var DRESS;
(function (DRESS) {
    /**
     * @summary Mean/mode imputation.
     *
     * @description This method performs simple imputation by replacing missing values of each specified feature with the mean (in case of numerical features) or mode (in case of categorical features) of said feature from the rest of the subjects.
     * Each feature should be a property of the subject or is accessible using the dot notation. Any null value is considered as missing. If the property is an array, then the array of sorted and converted to a string for comparison.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be processed.
     * @param {string[]} categoricals - An array of categorical features to be processed.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   count (the number of missing values),
     *   value (the mean or mode used as replacement),
     *   text
     */
    DRESS.meanMode = (subjects, numericals, categoricals) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        const features = numericals.concat(categoricals);
        const numNumerical = numericals.length;
        //
        const numSubject = subjects.length;
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map((feature, index) => {
            const isNumeric = index < numNumerical;
            let values = new Array(numSubject);
            const nulls = new Array();
            let count = 0;
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (value === null) {
                    nulls.push(subjects[i]);
                }
                else {
                    values[count++] = isNumeric ? DRESS.numeric(value) : DRESS.categoric(value);
                }
            }
            values = values.slice(0, count);
            const value = isNumeric ? DRESS.mean(values) : DRESS.mode(values);
            nulls.map(subject => DRESS.set(subject, feature, value));
            count = numSubject - count;
            return {
                feature,
                count,
                text: DRESS.padEnd(feature, pad) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)' + '	= ' + (isNumeric ? DRESS.clamp(value) : value)
            };
        });
    };
    /**
     * @summary Last observation carried forward imputation.
     *
     * @description This method imputes null values using the last observation carried forward algorithm. If a null value is associated with the first observation, then the next non-null observation is carried backforward (NOCB).
     * Each feature should be a property of the subject or is accessible using the dot notation.
     *
     * The subjects array should be sorted in a logical fashion using other sorting algorithms before imputation is applied.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   count (the number of missing values),
     *   text
     */
    DRESS.locf = (subjects, features) => {
        const numSubject = subjects.length;
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map(feature => {
            let count = 0;
            for (let i = 0; i < numSubject; i++) {
                const value = DRESS.get(subjects[i], feature);
                if (value === null) {
                    if (i) {
                        DRESS.set(subjects[i], feature, DRESS.get(subjects[i - 1], feature));
                        count++;
                    }
                    else {
                        let j = 0;
                        while (++j < subjects.length) {
                            const value = DRESS.get(subjects[j], feature);
                            if (value !== null) {
                                DRESS.set(subjects[i], feature, value);
                                count++;
                                break;
                            }
                        }
                    }
                }
            }
            return {
                feature,
                count,
                text: DRESS.padEnd(feature, pad) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        });
    };
    /**
     * @summary Set the nullable values of the specified features to null.
     *
     * @description This method evaluates the value of the specified features in each subject.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the value of the property matches one of the values defined in the nulls array, the property is set to null.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} truths - A list of values that are considered as null.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were set to null),
     *   text
     */
    DRESS.nullify = (subjects, features, nulls, names = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        const numSubject = subjects.length;
        return features.map((feature, index) => {
            const name = replacement ? names[index] : feature;
            let count = 0;
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (nulls.indexOf(value) > -1) {
                    DRESS.set(subjects[i], name, null);
                    count++;
                }
            }
            return {
                feature,
                name,
                count,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        });
    };
    /**
     * @summary Remove any subjects that contains a null value as one of the specified features.
     *
     * @description This method creates a new array of subjects that contains only those subjects that do not have a null value in any of the specified features.
     *
     * @returns A new array of subjects.
     */
    DRESS.denullify = (subjects, features) => {
        const numSubject = subjects.length;
        const outputs = new Array(numSubject);
        let count = 0;
        let i = numSubject;
        while (i--) {
            if (!features.some(feature => DRESS.get(subjects[i], feature) === null)) {
                outputs[count++] = subjects[i];
            }
        }
        return outputs.slice(0, count);
    };
})(DRESS || (DRESS = {}));
