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
            const nulls = Array();
            let values = [];
            subjects.map(subject => {
                const value = DRESS.get(subject, feature);
                if (value === null) {
                    nulls.push(subject);
                }
                else {
                    values.push(categorical ? DRESS.categoric(value) : DRESS.numeric(value));
                }
            });
            const value = categorical ? DRESS.mode(values) : DRESS.mean(values);
            nulls.map(subject => DRESS.set(subject, feature, value));
            const count = nulls.length;
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
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map(feature => {
            let count = 0;
            subjects.map((subject, index) => {
                const value = DRESS.get(subject, feature);
                if (value === null) {
                    if (index) {
                        DRESS.set(subject, feature, DRESS.get(subjects[index - 1], feature));
                        count++;
                    }
                    else {
                        let i = 0;
                        while (++i < subjects.length) {
                            const value = DRESS.get(subjects[i], feature);
                            if (value !== null) {
                                DRESS.set(subject, feature, value);
                                count++;
                                break;
                            }
                        }
                    }
                }
            });
            return {
                feature,
                count,
                text: DRESS.padEnd(feature, pad) + ': ' + count + '	(' + DRESS.clamp(count / subjects.length * 100) + '%)'
            };
        });
    };
})(DRESS || (DRESS = {}));
