var DRESS;
(function (DRESS) {
    /**
     * @summary Mean/mode imputation.
     *
     * @description This method performs simple imputation by replacing missing values of each specified feature with the mean (in case of numerical features) or mode (in case of categorical features or array features) of said feature from the rest of the subjects.
     * Each feature should be a property of the subject or be accessible using the dot notation. Any null value is considered missing. If the property is an array, it is treated as a categorical feature and the array of sorted and converted to a string for comparison.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be processed.
     * @param {string[]} categoricals - An array of categorical features to be processed.
     *
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   - feature (the feature imputed),
     *   - count (the number of missing values),
     *   - nulls (an array of subjects that were imputed),
     *   - value (the mean or mode used as a replacement),
     *   - text
     */
    DRESS.meanMode = (subjects, numericals = [], categoricals = []) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        //
        const features = numericals.concat(categoricals);
        const numNumerical = numericals.length;
        //
        const numSubject = subjects.length;
        const padding = DRESS.longest(features);
        //
        return features.map((feature, index) => {
            const isNumeric = index < numNumerical;
            const values = [];
            const nulls = [];
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (value === null) {
                    nulls.push(subjects[i]);
                }
                else {
                    values.push(isNumeric ? DRESS.numeric(value) : value);
                }
            }
            const value = isNumeric ? DRESS.mean(values) : DRESS.mode(values);
            nulls.forEach(subject => DRESS.set(subject, feature, value));
            const count = nulls.length;
            return {
                feature,
                count,
                nulls,
                value,
                text: DRESS.pad(feature, padding) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)' + '	= ' + (isNumeric ? DRESS.clamp(value) : DRESS.categoric(value))
            };
        });
    };
    /**
     * @summary Last observation carried forward imputation.
     *
     * @description This method imputes null values using the last observation carried forward algorithm. If a null value is associated with the first observation, then the next non-null observation is carried backward (NOCB).
     * Each feature should be a property of the subject or be accessible using the dot notation.
     *
     * The subject array should be sorted in a logical fashion using other sorting algorithms before imputation is applied.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   - feature (the feature imputed),
     *   - count (the number of missing values),
     *   - nulls (an array of subjects that were imputed),
     *   - text
     */
    DRESS.locf = (subjects, features) => {
        const numSubject = subjects.length;
        const padding = DRESS.longest(features);
        //
        return features.map(feature => {
            const nulls = [];
            let count = 0;
            for (let i = 0; i < numSubject; i++) {
                const value = DRESS.get(subjects[i], feature);
                if (value === null) {
                    nulls.push(subjects[i]);
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
                nulls,
                text: DRESS.pad(feature, padding) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        });
    };
    /**
     * @summary Nearest neighbor imputation.
     *
     * @description This method imputes null values of the specified features using the average value, mean for numerical feature, mode for categorical feature, from the k-nearest neighbors to subject in question.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be processed.
     * @param {string[]} categoricals - An array of categorical features to be processed.
     * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
     * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
     * @param {any} [kNN=DRESS.kNN] - A k-nearest neighbor machine-learning algorithm. Default to DRESS.kNN.
     *
     * @returns An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   - feature (the feature imputed),
     *   - count (the number of missing values),
     *   - nulls (an array of subjects that were imputed),
     *   - text
     */
    DRESS.nearestNeighbor = (subjects, numericals = [], categoricals = [], k = 5, unweighted = false, kNN = DRESS.kNN) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        //
        const features = numericals.concat(categoricals);
        const numNumerical = numericals.length;
        const outcomeColumn = features.length;
        //
        const numSubject = subjects.length;
        const padding = DRESS.longest(features);
        // Build a kNN model without specifying outcome
        const model = kNN(subjects, null, numericals, categoricals);
        return features.map((feature, index) => {
            const isNumeric = index < numNumerical;
            // Set the feature being imputed to zero importance.
            const importances = Array(outcomeColumn).fill(1);
            importances[index] = 0;
            model.hyperparameters = { importances };
            //
            const nulls = [];
            let i = numSubject;
            while (i--) {
                if (DRESS.get(subjects[i], feature) === null) {
                    nulls.push(subjects[i]);
                    //
                    const nearests = model.nearest(subjects[i], numSubject).sort((a, b) => b[1 /*NEAREST.DISTANCE*/] - a[1 /*NEAREST.DISTANCE*/]);
                    const values = [];
                    const weights = [];
                    while ((values.length < k) && nearests.length) {
                        const nearest = nearests.pop();
                        const value = DRESS.get(nearest[0 /*NEAREST.NEIGHBOR*/][outcomeColumn], feature);
                        if (value !== null) {
                            values.push(isNumeric ? DRESS.numeric(value) : value);
                            weights.push(-nearest[1 /*NEAREST.DISTANCE*/]);
                        }
                    }
                    //
                    if (unweighted) {
                        DRESS.set(subjects[i], feature, isNumeric ? DRESS.mean(values) : DRESS.mode(values));
                    }
                    else {
                        DRESS.set(subjects[i], feature, isNumeric ? DRESS.mean(values, DRESS.softmax(weights)) : DRESS.mode(values, DRESS.softmax(weights)));
                    }
                }
            }
            const count = nulls.length;
            return {
                feature,
                count,
                nulls,
                text: DRESS.pad(feature, padding) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        });
    };
    /**
     * @summary Set the nullable values of the specified features to null.
     *
     * @description This method matches the value of the specified features in each subject against an array of nulls.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the value of the property matches one of the values defined in the nulls array, the property is set to `null`.
     * If the property is an array, then `null` is defined as the presence of one or more values within the null array within the property array.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} nullables - A list of values that are considered as `null`.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {boolean} [negate=false] - Negate the output value, i.e. the property is set to `null` in the absence of any values defined in the nulls array.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - count (the number of subjects that were set to null),
     *   - nulls (an array of subjects that were set to null),
     *   - text
     */
    DRESS.nullify = (subjects, features, nullables, names = null, negate = false) => {
        const padding = DRESS.longest(features);
        const replacement = Array.isArray(names) && (names.length === features.length);
        const padding2 = replacement && DRESS.longest(names);
        //        
        const numSubject = subjects.length;
        return features.map((feature, index) => {
            const name = replacement ? names[index] : feature;
            let nulls = [];
            let i = numSubject;
            while (i--) {
                let value = DRESS.get(subjects[i], feature);
                value = Array.isArray(value) ? nullables.some(nullable => value.indexOf(nullable) > -1) : (nullables.indexOf(value) > -1);
                value = negate ? !value : value;
                if (value) {
                    DRESS.set(subjects[i], name, null);
                    nulls.push(subjects[i]);
                }
            }
            const count = nulls.length;
            return {
                feature,
                name,
                count,
                nulls,
                text: DRESS.pad(feature, padding) + (replacement ? (' >> ' + DRESS.pad(name, padding2)) : '') + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        });
    };
    /**
     * @summary Remove any subjects that contain a null value as one or more of the specified features.
     *
     * @description This method removes any subject that contains a null value in any of the specified features.
     *
     * NOTE: This method is destructive and directly alters the specified array of subjects.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns {object[]} Several transformation parameters for debugging purposes.
     *   - features (the feature considered),
     *   - count (the number of subject removed),
     *   - nulls (an array of subjects that were removed),
     *   - text.
     */
    DRESS.denullify = (subjects, features) => {
        const numSubject = subjects.length;
        let count = 0;
        let nulls = [];
        for (let i = 0; i < numSubject; i++) {
            const subject = subjects[i];
            if (!features.some(feature => DRESS.get(subject, feature) === null)) {
                subjects[count++] = subject;
            }
            else {
                nulls.push(subject);
            }
        }
        subjects.splice(count, count = numSubject - count);
        return {
            features,
            count,
            nulls,
            text: '[' + features.join(' | ') + '] ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
        };
    };
})(DRESS || (DRESS = {}));
