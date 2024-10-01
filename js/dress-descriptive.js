var DRESS;
(function (DRESS) {
    /**
     * @summary Generate a concise summary of the specified array of subjects.
     *
     * @description This method loops through the specified array of subjects and generates a summary describing the names of the enumerable features, the data type (numeric vs categoric), and the number of `null` values found in these subjects.
     *
     * @param {object[]} subjects - An array of subjects to analyze.
     * @param {number} [limit=DRESS.PRECISION] - Display the first N unique values of the feature. Default to DRESS.PRECISION.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the name of the feature),
     *   - numeric (whether the feature is a numeric or categoric feature),
     *   - null (number of null values),
     *   - unique (number of unique values),
     *   - values (an array of unique non-null values),
     *   - text.
     */
    DRESS.summary = (subjects, limit = DRESS.PRECISION) => {
        const summary = (features, object, path = '', ancestors = []) => {
            // Detect circular reference            
            if (ancestors.indexOf(object) === -1) {
                if (Array.isArray(object)) {
                    ancestors.push(object);
                    object.forEach(value => summary(features, value, path + '[]', ancestors));
                }
                else if (('object' === typeof object) && (object)) {
                    ancestors.push(object);
                    Object.keys(object).forEach(key => summary(features, object[key], (path && (path + '.')) + key, ancestors));
                }
                else {
                    if (!features.has(path)) {
                        features.set(path, [0, true, new Map()]);
                    }
                    const feature = features.get(path);
                    if (object === null) {
                        feature[0]++;
                    }
                    else {
                        feature[1] && (feature[1] = (object - parseFloat(object) + 1) >= 0);
                        feature[2].set(object, true);
                    }
                }
            }
        };
        //
        const features = new Map();
        const numSubject = subjects.length;
        let i = numSubject;
        while (i--) {
            summary(features, subjects[i]);
        }
        const padding = DRESS.longest(Array.from(features.keys()));
        return {
            count: numSubject,
            features: Array.from(features).sort(([a,], [b,]) => a > b ? 1 : -1).map(([feature, summary]) => {
                const values = Array.from(summary[2].keys());
                const unique = summary[2].size;
                return {
                    feature,
                    numeric: summary[1] ? 1 : 0,
                    null: summary[0],
                    unique,
                    values,
                    text: DRESS.pad(feature, padding) + ': ' + (summary[1] ? 'numeric  ' : 'categoric') + '	null: ' + summary[0] + '	unique: ' + unique + '	[' + values.slice(0, limit).join(', ') + ((unique > DRESS.PRECISION) ? ', ...]' : ']')
                };
            }),
            text: numSubject + ' row(s)	' + features.size + ' feature(s)'
        };
    };
    /**
     * @summary Calculate the arithmetic mean for each feature and optionally compare the result to that of a second group of subjects.
     *
     * @description This method computes the arithmetic means as well as the standard deviations of the specified features.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed),
     *   - count (the number of subjects),
     *   - mean (the arithmetic mean of the feature),
     *   - sd (the standard deviation of the feature),
     *   - skewness (the Fisher-Pearson coefficient of skewness),
     *   - kurtosis (the excess Kurtosis),
     *   - ci (the confidence interval of the mean),
     *   - count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   - mean2 (the arithmetic mean of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - sd2 (the standard deviation of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - skewness2 (the Fisher-Pearson coefficient of skewness, only applicable if subjects2 is specified),
     *   - kurtosis2 (the excess Kurtosis, only applicable if subjects2 is specified),
     *   - ci2 (the confidence interval of the mean for the second group of subjects, only applicable if subjects2 is specified),
     *   - z (z score, only applicable if subjects2 is specified),
     *   - p (p-value, only applicable if subjects2 is specified),
     *   - text.
     */
    DRESS.means = (subjects, features, subjects2 = null) => {
        const means = (subjects, feature) => {
            const numSubject = subjects.length;
            const values = Array(numSubject);
            let i = numSubject;
            while (i--) {
                values[i] = DRESS.numeric(DRESS.get(subjects[i], feature));
            }
            return DRESS.moments(values);
        };
        const padding = DRESS.longest(features);
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            const means1 = means(subjects, feature);
            const ci1 = [means1[0 /* MEANS.MEAN */] - zCI * means1[4 /* MEANS.ERROR */], means1[0 /* MEANS.MEAN */] + zCI * means1[4 /* MEANS.ERROR */]];
            //
            if (subjects2) {
                const count1 = subjects.length;
                const count2 = subjects2.length;
                const means2 = means(subjects2, feature);
                const ci2 = [means2[0 /* MEANS.MEAN */] - zCI * means2[4 /* MEANS.ERROR */], means2[0 /* MEANS.MEAN */] + zCI * means2[4 /* MEANS.ERROR */]];
                //      
                const z = (means1[0 /* MEANS.MEAN */] - means2[0 /* MEANS.MEAN */]) / Math.sqrt(means1[1 /* MEANS.VARIANCE */] / count1 + means2[1 /* MEANS.VARIANCE */] / count2);
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: count1,
                    mean: means1[0 /* MEANS.MEAN */],
                    sd: Math.sqrt(means1[1 /* MEANS.VARIANCE */]),
                    skewness: means1[2 /* MEANS.SKEWNESS */],
                    kurtosis: means1[3 /* MEDIANS.KURTOSIS */],
                    ci: ci1,
                    count2: count2,
                    mean2: means2[0 /* MEANS.MEAN */],
                    sd2: Math.sqrt(means2[1 /* MEANS.VARIANCE */]),
                    ci2: ci2,
                    skewness2: means2[2 /* MEANS.SKEWNESS */],
                    kurtosis2: means2[3 /* MEANS.KURTOSIS */],
                    z: z,
                    p: p,
                    text: DRESS.pad(feature, padding) + ': [' + count1 + ']	' + DRESS.clamp(means1[0 /* MEANS.MEAN */])
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(Math.sqrt(means1[1 /* MEANS.VARIANCE */])) + '	SKW: ' + DRESS.clamp(means1[2 /* MEANS.SKEWNESS */]) + '	KUR: ' + DRESS.clamp(means1[3 /* MEANS.KURTOSIS */]) + '	vs'
                        + ' [' + count2 + ']	' + DRESS.clamp(means2[0 /* MEANS.MEAN */])
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(Math.sqrt(means2[1 /* MEANS.VARIANCE */])) + '	SKW: ' + DRESS.clamp(means2[2 /* MEANS.SKEWNESS */]) + '	KUR: ' + DRESS.clamp(means2[3 /* MEANS.KURTOSIS */])
                        + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: subjects.length,
                mean: means1[0 /* MEANS.MEAN */],
                sd: Math.sqrt(means1[1 /* MEANS.VARIANCE */]),
                skewness: means1[2 /* MEANS.SKEWNESS */],
                kurtosis: means1[3 /* MEDIANS.KURTOSIS */],
                ci: ci1,
                count2: null,
                mean2: null,
                sd2: null,
                skewness2: null,
                kurtosis2: null,
                ci2: null,
                z: null,
                p: null,
                text: DRESS.pad(feature, padding) + ': [' + subjects.length + ']	' + DRESS.clamp(means1[0 /* MEANS.MEAN */])
                    + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(Math.sqrt(means1[1 /* MEANS.VARIANCE */])) + '	SKW: ' + DRESS.clamp(means1[2 /* MEANS.SKEWNESS */]) + '	KUR: ' + DRESS.clamp(means1[3 /* MEANS.KURTOSIS */])
            };
        });
    };
    /**
     * @summary Locate the medians of the specified features and optionally compare the result to that of a second group of subjects.
     *
     * @description This method computes the medians as well as the interquartile ranges of the specified features.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * Z score is calculated using the Mann–Whitney U test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed),
     *   - count (the number of subjects),
     *   - median (the median value),
     *   - iqr (the interquartile range, which equals the value of the 75th percentile minus that of the 25th percentile),
     *   - skewness (the Galton skewness),
     *   - kurtosis (the excess percentile kurtosis),
     *   - count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   - median2 (the median values for the second group of subjects, only applicable if subjects2 is specified),
     *   - iqr2 (the interquartile range for the second group of subjects, only applicable if subjects2 is specified),
     *   - skewness2 (the Galton skewness for the second group of subjects, only applicable if subjects2 is specified),
     *   - kurtosis2 (the excess percentile kurtosis for the second group of subjects, only applicable if subjects2 is specified),
     *   - z (z score, only applicable if subjects2 is specified),
     *   - p (p-value, only applicable if subjects2 is specified),
     *   - text.
     */
    DRESS.medians = (subjects, features, subjects2 = null) => {
        const medians = (subjects, feature) => {
            const numSubject = subjects.length;
            const values = Array(numSubject);
            let i = numSubject;
            while (i--) {
                values[i] = DRESS.numeric(DRESS.get(subjects[i], feature));
            }
            return DRESS.quartiles(values);
        };
        //
        const padding = DRESS.longest(features);
        //
        return features.map(feature => {
            const medians1 = medians(subjects, feature);
            if (subjects2) {
                const medians2 = medians(subjects2, feature);
                //                
                const values = medians1[4 /* MEDIANS.VALUES */].concat(medians2[4 /* MEDIANS.VALUES */]).sort((a, b) => a - b);
                const ranks1 = medians1[4 /* MEDIANS.VALUES */].map(value => values.indexOf(value));
                const ranks2 = medians2[4 /* MEDIANS.VALUES */].map(value => values.indexOf(value));
                const ranks = ranks1.concat(ranks2).sort((a, b) => a - b);
                const count1 = subjects.length;
                const count2 = subjects2.length;
                const count = count1 + count2;
                const ties = Array(count).fill(0);
                let i = count;
                while (i--) {
                    if (ranks[i] !== i) {
                        ties[ranks[i]]++;
                    }
                }
                i = count1;
                while (i--) {
                    ranks1[i] += ties[ranks1[i]] / 2 + 1;
                }
                const U = count1 * count2 + count1 * (count1 + 1) / 2 - ranks1.reduce((sum, rank) => sum + rank);
                const z = Math.abs(U - count1 * count2 / 2) / Math.sqrt((count1 * count2 / (count * (count - 1))) * (((Math.pow(count, 3)) - count) / 12 - ties.reduce((sum, tie) => sum + ((Math.pow(tie, 3)) - tie), 0) / 12));
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: count1,
                    median: medians1[0 /* MEDIANS.MEDIAN */],
                    iqr: medians1[1 /* MEDIANS.IQR */],
                    skewness: medians1[2 /* MEDIANS.SKEWNESS */],
                    kurtosis: medians1[3 /* MEDIANS.KURTOSIS */],
                    count2: count2,
                    median2: medians2[0 /* MEDIANS.MEDIAN */],
                    iqr2: medians2[1 /* MEDIANS.IQR */],
                    skewness2: medians2[2 /* MEDIANS.SKEWNESS */],
                    kurtosis2: medians2[3 /* MEDIANS.KURTOSIS */],
                    z: z,
                    p: p,
                    text: DRESS.pad(feature, padding) + ': [' + count1 + ']	' + DRESS.clamp(medians1[0 /* MEDIANS.MEDIAN */]) + '	IQR: ' + DRESS.clamp(medians1[1 /* MEDIANS.IQR */]) + '	SKW: ' + DRESS.clamp(medians1[2 /* MEDIANS.SKEWNESS */]) + '	KUR: ' + DRESS.clamp(medians1[3 /* MEDIANS.KURTOSIS */]) + '	vs'
                        + ' [' + count2 + ']	' + DRESS.clamp(medians2[0 /* MEDIANS.MEDIAN */]) + '	IQR: ' + DRESS.clamp(medians2[1 /* MEDIANS.IQR */]) + '	SKW: ' + DRESS.clamp(medians2[2 /* MEDIANS.SKEWNESS */]) + '	KUR: ' + DRESS.clamp(medians2[3 /* MEDIANS.KURTOSIS */])
                        + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: subjects.length,
                median: medians1[0 /* MEDIANS.MEDIAN */],
                iqr: medians1[1 /* MEDIANS.IQR */],
                skewness: medians1[2 /* MEDIANS.SKEWNESS */],
                kurtosis: medians1[3 /* MEDIANS.KURTOSIS */],
                count2: null,
                median2: null,
                iqr2: null,
                skewness2: null,
                kurtosis2: null,
                z: null,
                p: null,
                text: DRESS.pad(feature, padding) + ': [' + subjects.length + ']	' + DRESS.clamp(medians1[0 /* MEDIANS.MEDIAN */]) + '	IQR: ' + DRESS.clamp(medians1[1 /* MEDIANS.IQR */]) + '	SKW: ' + DRESS.clamp(medians1[2 /* MEDIANS.SKEWNESS */]) + '	KUR: ' + DRESS.clamp(medians1[3 /* MEDIANS.KURTOSIS */])
            };
        });
    };
    /**
     * @summary Calculate the proportion of subjects that have a positive feature and optionally compare the result to that of a second group of subjects.
     *
     * @description This method counts the number of subjects that has a positive feature.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive feature is defined as a non-empty array.
     * If the property is not an array, then it would be converted to a numeric value and a positive feature is defined as any non-zero value.
     *
     * Z score is calculated using the 2 proportions Z test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed),
     *   - count (the number of subjects with a positive feature),
     *   - proportion (the proportion of subject with a positive feature),
     *   - ci (the confidence interval of the proportion),
     *   - count2 (the number of subjects with a positive feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - proportion2 (the proportion of subjects with a positive feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - ci2 (the confidence interval of the proportion for the second group of subjects, only applicable if subjects2 is specified),
     *   - z (z score, only applicable if subjects2 is specified),
     *   - p (p-value, only applicable if subjects2 is specified),
     *   - text.
     */
    DRESS.proportions = (subjects, features, subjects2 = null) => {
        const padding = DRESS.longest(features);
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            let cases1 = 0;
            const n1 = subjects.length;
            let i = n1;
            while (i--) {
                if (DRESS.numeric(DRESS.get(subjects[i], feature))) {
                    cases1++;
                }
            }
            const p1 = cases1 / n1;
            const se1 = Math.sqrt(p1 * (1 - p1) / n1);
            const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
            //            
            if (subjects2) {
                let cases2 = 0;
                const n2 = subjects2.length;
                let i = n2;
                while (i--) {
                    if (DRESS.numeric(DRESS.get(subjects2[i], feature))) {
                        cases2++;
                    }
                }
                const p2 = cases2 / n2;
                const se2 = Math.sqrt(p2 * (1 - p2) / n2);
                const ci2 = [p2 - zCI * se2, p2 + zCI * se2];
                //
                const p12 = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
                const z = ((p1 - p2) / Math.sqrt(p12 * (1 - p12) * ((1 / n1) + (1 / n2))));
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: cases1,
                    proportion: p1,
                    ci: ci1,
                    count2: cases2,
                    proportion2: p2,
                    ci2: ci2,
                    z: z,
                    p: p,
                    text: DRESS.pad(feature, padding) + ': [' + cases1 + ']	' + DRESS.clamp(p1 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ') vs'
                        + '	[' + cases2 + ']	' + DRESS.clamp(p2 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                        + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: cases1,
                proportion: p1,
                ci: ci1,
                count2: null,
                proportion2: null,
                ci2: null,
                z: null,
                p: null,
                text: DRESS.pad(feature, padding) + ': [' + cases1 + ']	' + DRESS.clamp(p1 * 100) + '%'
                    + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
            };
        });
    };
    /**
     * @summary Calculate the frequency of occurrence for each feature value and optionally compare the result to that of a second group of subjects.
     *
     * @description This method tabulates all possible values for each feature and counts the frequency of occurrence of each feature value.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then each value within the array
     * is converted to a string. If the property is not an array, then the entire value is converted into a string.
     *
     * Z score is calculated using the 2 proportions Z test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     * @param {number} [limit=25] - Optional, maximum number of feature values to be analyzed.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed, with the following properties),
     *   > - count (the number of subjects with said feature value),
     *   > - proportion (the proportion of subject with said feature value),
     *   > - ci (the confidence interval of the proportion),
     *   > - count2 (the number of subjects with said feature value for the second group of subjects, only applicable if subjects2 is specified),
     *   > - proportion2 (the proportion of subject with said feature value for the second group of subjects, only applicable if subjects2 is specified),
     *   > - ci2 (the confidence interval of the proportion for the second group of subjects, only applicable if subjects2 is specified),
     *   > - z (z score, only applicable if subjects2 is specified),
     *   > - p (p-value, only applicable if subjects2 is specified),
     *   > - text.
     *   - values (an array of possible feature values),
     *   - text.
     */
    DRESS.frequencies = (subjects, features, subjects2 = null, limit = 25) => {
        const frequencies = (subjects, feature) => {
            const counters = new Map();
            let i = subjects.length;
            while (i--) {
                //const value = get(subjects[i], feature);
                //(Array.isArray(value) ? value : [value]).forEach(value => {
                [].concat(DRESS.get(subjects[i], feature)).forEach(value => {
                    value = DRESS.categoric(value);
                    counters.set(value, (counters.get(value) || 0) + 1);
                });
            }
            return Array.from(counters).sort((a, b) => b[1] - a[1]);
        };
        //
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            const n1 = subjects.length;
            const frequencies1 = frequencies(subjects, feature).slice(0, limit);
            const padding = DRESS.longest(frequencies1.map(frequencies => frequencies[0]));
            if (subjects2) {
                const n2 = subjects2.length;
                const frequencies2 = frequencies(subjects2, feature);
                return {
                    feature: feature,
                    values: frequencies1.map(frequency1 => {
                        const p1 = frequency1[1] / n1;
                        const se1 = Math.sqrt(p1 * (1 - p1) / n1);
                        const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
                        const frequency2 = frequencies2.find(frequency2 => frequency1[0] === frequency2[0]) || ['', 0];
                        const p2 = frequency2[1] / n2;
                        const se2 = Math.sqrt(p2 * (1 - p2) / n2);
                        const ci2 = [p2 - zCI * se2, p2 + zCI * se2];
                        //
                        const p12 = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
                        const z = ((p1 - p2) / Math.sqrt(p12 * (1 - p12) * ((1 / n1) + (1 / n2))));
                        const p = DRESS.norm(z);
                        return {
                            value: frequency1[0],
                            count: frequency1[1],
                            proportion: p1,
                            ci: ci1,
                            count2: frequency2[1],
                            proportion2: p2,
                            ci2: ci2,
                            z: z,
                            p: p,
                            text: DRESS.pad(frequency1[0], padding) + ': [' + frequency1[1] + ']	' + DRESS.clamp(p1 * 100) + '%'
                                + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')	vs'
                                + '	[' + frequency2[1] + ']	' + DRESS.clamp(p2 * 100) + '%'
                                + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                                + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        };
                    }),
                    text: '[' + feature + ']'
                };
            }
            return {
                feature: feature,
                values: frequencies1.map(frequency1 => {
                    const p1 = frequency1[1] / n1;
                    const se1 = Math.sqrt(p1 * (1 - p1) / n1);
                    const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
                    return {
                        value: frequency1[0],
                        count: frequency1[1],
                        proportion: p1,
                        ci: ci1,
                        count2: null,
                        proportion2: null,
                        ci2: null,
                        z: null,
                        p: null,
                        text: DRESS.pad(frequency1[0], padding) + ': [' + frequency1[1] + ']	' + DRESS.clamp(p1 * 100) + '%'
                            + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                    };
                }),
                text: '[' + feature + ']'
            };
        });
    };
})(DRESS || (DRESS = {}));
