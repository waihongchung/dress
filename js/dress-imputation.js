var DRESS;
(function (DRESS) {
    /**
     * @summary Mean mode imputation.
     *
     * @description This method performs simple imputation by replacing missing values of the specified feature with the mean (in case of numerical features) or mode (in case of categorical features) of the rest of the subjects.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. Any null value is considered as missing. If the property is an array, then the array of sorted and converted to a string for comparison.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the imputed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   name (the name of property that store the imputed values),
     *   count (the number of missing values),
     *   value (the mean or mode used as replacement),
     *   text
     */
    DRESS.meanMode = (subjects, features, names = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        return features.map((feature, index) => {
            const nulls = [];
            let values = [];
            subjects.map(subject => {
                if (subject[feature] === null) {
                    nulls.push(subject);
                }
                else {
                    values.push(subject[feature]);
                }
            });
            if (values.length === subjects.length) {
                return {
                    feature: feature,
                    count: 0,
                    value: null,
                    text: DRESS.padEnd(feature, pad) + ': NO NULL VALUES.'
                };
            }
            else if (values.length === 0) {
                return {
                    feature: feature,
                    count: subjects.length,
                    value: null,
                    text: DRESS.padEnd(feature, pad) + ': NO NON-NULL VALUES.'
                };
            }
            let meanMode;
            if (+values[0] === values[0]) {
                meanMode = values.reduce((mean, value) => mean + value) / values.length;
            }
            else {
                let isArray = false;
                if (Array.isArray(values[0])) {
                    isArray = true;
                    values = values.map(value => JSON.stringify(value.sort()));
                }
                meanMode = values.reduce((counters, value) => {
                    let counter = counters.find(counter => counter.value === value);
                    if (!counter) {
                        counters.push(counter = {
                            count: 0,
                            value: value
                        });
                    }
                    counter.count += 1;
                    return counters;
                }, []).sort((a, b) => a.count - b.count).pop().value;
                if (isArray) {
                    meanMode = JSON.parse(meanMode);
                }
            }
            if (replacement) {
                const name = names[index];
                nulls.map(subject => {
                    subject[name] = meanMode;
                });
            }
            else {
                nulls.map(subject => {
                    subject[feature] = meanMode;
                });
            }
            return {
                feature: feature,
                name: replacement ? names[index] : feature,
                count: nulls.length,
                value: meanMode,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(names[index], pad2)) : '') + ': ' + nulls.length + '	(' + DRESS.clamp(nulls.length / subjects.length * 100) + '%)	= ' + ((+meanMode === meanMode) ? DRESS.clamp(meanMode) : JSON.stringify(meanMode))
            };
        });
    };
    /**
     * @summary Last observation carried forward imputation.
     *
     * @description This method imputes missing values using the last observation carried forward algorithm. If the missing value is associated with the first observation, then the next non-null observation is carried backforward (NOCB).
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. Any null value is considered as missing.
     *
     * The subjects array should be sorted properly using other sorting algorithms before imputation is applied.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the imputed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   name (the name of property that store the imputed values),
     *   count (the number of missing values),
     *   text
     */
    DRESS.locf = (subjects, features, names = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        return features.map((feature, index) => {
            let count = 0;
            subjects.map((subject, index) => {
                if (subject[feature] === null) {
                    if (index) {
                        subject[feature] = subjects[index - 1][feature];
                        count++;
                    }
                    else {
                        let i = 0;
                        while (++i < subjects.length) {
                            if (subjects[i][feature] !== null) {
                                subject[feature] = subjects[i][feature];
                                count++;
                                break;
                            }
                        }
                    }
                }
            });
            return {
                feature: feature,
                name: replacement ? names[index] : feature,
                count: count,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(names[index], pad2)) : '') + ': ' + count + '	(' + DRESS.clamp(count / subjects.length * 100) + '%)'
            };
        });
    };
    /**
     * @summary K-nearest-neighbor imputation.
     *
     * @description This method performs k-nearest neighbor imputation using a modified algorithm that handles both numerical and categorical features.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This algorithm represents an improvement over the popular K-prototype algorithm, which also handles mixed data type. Instead of relying on simple matching (as in K-mode),
     * the relative distribution of each categorical value is taken into account and the absolute difference in relative distribution between two categorical values contributes to the Manhattan distance used in computation.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the imputed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers.
     * @param {string[]} features - An array of features to be imputed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number} [k=9] - The number of neighbors considered.
     * @param {boolean} [normalize=true] - Normalize numerical values prior to computation. Default to true.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   name (the name of property that store the imputed values),
     *   count (the number of missing values),
     *   values (the replacement values used),
     *   text
     */
    DRESS.knn = (subjects, numericals, categoricals, features, names = null, k = 9, normalize = true) => {
        const ranges = (new Array(numericals.length)).fill(0).map(_ => {
            return {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
                range: 0
            };
        });
        const counters = (new Array(categoricals.length)).fill(0).map(_ => new Array());
        const neighbors = subjects.map(subject => {
            return {
                subject: subject,
                numericals: numericals.map((numerical, column) => {
                    const value = Array.isArray(subject[numerical]) ? subject[numerical].length : +subject[numerical];
                    const range = ranges[column];
                    if (value < range.min) {
                        range.min = value;
                    }
                    if (value > range.max) {
                        range.max = value;
                    }
                    return value;
                }),
                categoricals: categoricals.map((categorical, column) => {
                    const value = Array.isArray(subject[categorical]) ? subject[categorical].sort().join() : subject[categorical];
                    let counter = counters[column].find(counter => counter.value === value);
                    if (!counter) {
                        counters[column].push(counter = {
                            count: 0,
                            value: value
                        });
                    }
                    counter.count += 1;
                    return counter;
                }),
                distance: 0
            };
        });
        ranges.map(range => {
            range.range = range.max - range.min;
            if (range.range === 0) {
                range.range = 1;
            }
        });
        counters.map(counters => {
            counters.sort((a, b) => a.count - b.count);
            if (counters.length) {
                const min = counters[0].count;
                let range = counters[counters.length - 1].count - min;
                if (range === 0) {
                    range = 1;
                }
                counters.map(counter => {
                    counter.count -= min;
                    counter.count /= range;
                });
            }
        });
        if (normalize) {
            neighbors.map(neighbor => {
                neighbor.numericals = neighbor.numericals.map((numerical, column) => (numerical - ranges[column].min) / (ranges[column].range));
            });
        }
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        return features.map((feature, index) => {
            const name = replacement ? names[index] : feature;
            const nulls = [];
            const nonnulls = [];
            neighbors.map(neighbor => {
                ((neighbor.subject[feature] === null) ? nulls : nonnulls).push(neighbor);
            });
            nulls.map(self => {
                nonnulls.map(neighhbor => {
                    neighhbor.distance = neighhbor.numericals.reduce((sum, numerical, index) => sum + Math.abs(self.numericals[index] - numerical), 0);
                    neighhbor.distance += neighhbor.categoricals.reduce((sum, categorical, index) => {
                        if (categorical.value !== self.categoricals[index].value) {
                            return sum + 0.5 + Math.abs(categorical.count - self.categoricals[index].count) * 0.5;
                        }
                        return sum;
                    }, 0);
                });
                nonnulls.sort((a, b) => a.distance - b.distance);
                DRESS.meanMode([self.subject, ...nonnulls.slice(0, Math.min(nonnulls.length, k)).map(neighhbor => neighhbor.subject)], [feature], replacement ? [name] : null);
            });
            return {
                feature: feature,
                name: name,
                count: nulls.length,
                values: nulls.map(self => self[feature]),
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + nulls.length + '	(' + DRESS.clamp(nulls.length / subjects.length * 100) + '%)'
            };
        });
    };
})(DRESS || (DRESS = {}));
