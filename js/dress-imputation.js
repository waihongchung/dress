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
     * @param {string[]} features - An array of features to be processed.
     * @param {boolean} [categorical=false] - Treat features as categorical features. Default to false.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   count (the number of missing values),
     *   value (the mean or mode used as replacement),
     *   text
     */
    DRESS.meanMode = (subjects, features, categorical = false) => {
        const numSubject = subjects.length;
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map(feature => {
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
                    values[count++] = categorical ? DRESS.categoric(value) : DRESS.numeric(value);
                }
            }
            values = values.slice(0, count);
            const value = categorical ? DRESS.mode(values) : DRESS.mean(values);
            nulls.map(subject => DRESS.set(subject, feature, value));
            count = numSubject - count;
            return {
                feature,
                count,
                text: DRESS.padEnd(feature, pad) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)' + '	= ' + (categorical ? value : DRESS.clamp(value))
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
