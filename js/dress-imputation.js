var DRESS;
(function (DRESS) {
    /**
     * @summary Mean/mode imputation.
     *
     * @description This method performs simple imputation by replacing missing values of each specified feature with the mean (in case of numerical features) or mode (in case of categorical features) of said feature from the rest of the subjects.
     * Each feature should be a property of the subject or is accessible using the dot notation. Any null value is considered as missing. If the property is an array, then the array of sorted and converted to a string for comparison.
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
            const name = replacement ? names[index] : feature;
            const nulls = [];
            let values = [];
            subjects.map(subject => {
                const value = DRESS.get(subject, feature);
                if (value === null) {
                    nulls.push(subject);
                }
                else {
                    values.push(value);
                }
            });
            if (values.length === subjects.length) {
                return {
                    feature: feature,
                    name: null,
                    count: nulls.length,
                    value: null,
                    text: DRESS.padEnd(feature, pad) + ': NO NULL VALUES.'
                };
            }
            else if (values.length === 0) {
                return {
                    feature: feature,
                    name: null,
                    count: nulls.length,
                    value: null,
                    text: DRESS.padEnd(feature, pad) + ': NO NON-NULL VALUES.'
                };
            }
            let meanMode;
            if (+values[0] === values[0]) {
                meanMode = values.reduce((mean, value) => mean + value) / values.length;
            }
            else {
                meanMode = values.reduce((counters, value) => {
                    value = JSON.stringify(Array.isArray(value) ? value.sort() : value);
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
                meanMode = JSON.parse(meanMode);
            }
            nulls.map(subject => DRESS.set(subject, name, meanMode));
            return {
                feature: feature,
                name: name,
                count: nulls.length,
                value: meanMode,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + nulls.length + '	(' + DRESS.clamp(nulls.length / subjects.length * 100) + '%)	= ' + ((+meanMode === meanMode) ? DRESS.clamp(meanMode) : JSON.stringify(meanMode))
            };
        });
    };
    /**
     * @summary Last observation carried forward imputation.
     *
     * @description This method imputes missing values using the last observation carried forward algorithm. If the missing value is associated with the first observation, then the next non-null observation is carried backforward (NOCB).
     * Each feature should be a property of the subject or is accessible using the dot notation. Any null value is considered as missing.
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
            const name = replacement ? names[index] : feature;
            let count = 0;
            subjects.map((subject, index) => {
                const value = DRESS.get(subject, feature);
                if (value === null) {
                    if (index) {
                        DRESS.set(subject, name, DRESS.get(subjects[index - 1], feature));
                        count++;
                    }
                    else {
                        let i = 0;
                        while (++i < subjects.length) {
                            const value = DRESS.get(subjects[i], feature);
                            if (value !== null) {
                                DRESS.set(subject, name, value);
                                count++;
                                break;
                            }
                        }
                    }
                }
            });
            return {
                feature: feature,
                name: name,
                count: count,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + count + '	(' + DRESS.clamp(count / subjects.length * 100) + '%)'
            };
        });
    };
    /**
     * @summary K-nearest-neighbor imputation.
     *
     * @description This method performs k-nearest neighbor imputation using a modified algorithm that accepts both numerical and categorical features as classifiers.
     * Each feature should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This algorithm represents an improvement over the popular K-prototype algorithm, which also handles mixed data type. Instead of relying on simple matching (as in K-mode), however,
     * the relative distribution of each categorical value is taken into account and the absolute difference in the relative distribution between two categorical values is used to compute the Manhattan distance.
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
                    const value = DRESS.get(subject, numerical);
                    const num = Array.isArray(value) ? value.length : +value;
                    const range = ranges[column];
                    if (num < range.min) {
                        range.min = num;
                    }
                    if (num > range.max) {
                        range.max = num;
                    }
                    return num;
                }),
                categoricals: categoricals.map((categorical, column) => {
                    let value = DRESS.get(subject, categorical);
                    value = Array.isArray(value) ? value.sort().join() : value;
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
            neighbors.map(neighbor => ((DRESS.get(neighbor.subject, feature) === null) ? nulls : nonnulls).push(neighbor));
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
                DRESS.meanMode([self.subject, ...nonnulls.slice(0, k).map(neighhbor => neighhbor.subject)], [feature], replacement ? [name] : null);
            });
            return {
                feature: feature,
                name: name,
                count: nulls.length,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + nulls.length + '	(' + DRESS.clamp(nulls.length / subjects.length * 100) + '%)'
            };
        });
    };
})(DRESS || (DRESS = {}));
