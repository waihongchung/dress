var DRESS;
(function (DRESS) {
    /**
     * @summary Locate the medians of the specified features, and optionally compare the result to that of a second group of subjects.
     *
     * @description This method computes the medians as well as the interquartile ranges of the specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * Z score is calculated using the Mann–Whitney U test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   feature (the feature being analyzed),
     *   count (the number of subjects),
     *   median (the median value),
     *   iqr (the interquartile range, which equals to the value of the 75th percentile minus that of the 25th percentile),
     *   count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   median2 (the median values for the second group of subjects, only applicable if subjects2 is specified),
     *   iqr2 (the interquartile range for the second group of subjects, only applicable if subjects2 is specified),
     *   z (z score, only applicable if subjects2 is specified),
     *   p (p value, only applicable if subjects2 is specified),
     *   text.
     */
    DRESS.medians = (subjects, features, subjects2 = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map(feature => {
            const values1 = subjects.map(subject => DRESS.numeric(DRESS.get(subject, feature))).sort((a, b) => a - b);
            const count1 = subjects.length;
            let n = count1;
            const median1 = (n & 1) ? values1[(n - 1) / 2] : (values1[n / 2] + values1[n / 2 - 1]) / 2;
            n = (n - (n & 1)) / 2;
            const q25 = (n & 1) ? values1[(n - 1) / 2] : (values1[n / 2] + values1[n / 2 - 1]) / 2;
            const q75 = (n & 1) ? values1[count1 - 1 - (n - 1) / 2] : (values1[count1 - n / 2] + values1[count1 - 1 - n / 2]) / 2;
            const iqr1 = q75 - q25;
            if (subjects2) {
                const values2 = subjects2.map(subject => DRESS.numeric(DRESS.get(subject, feature))).sort((a, b) => a - b);
                const count2 = subjects2.length;
                let n = count2;
                const median2 = (n & 1) ? values2[(n - 1) / 2] : (values2[n / 2] + values2[n / 2 - 1]) / 2;
                n = (n - (n & 1)) / 2;
                const q25 = (n & 1) ? values2[(n - 1) / 2] : (values2[n / 2] + values2[n / 2 - 1]) / 2;
                const q75 = (n & 1) ? values2[count2 - 1 - (n - 1) / 2] : (values2[count2 - n / 2] + values2[count2 - 1 - n / 2]) / 2;
                const iqr2 = q75 - q25;
                //                
                const values = values1.concat(values2).sort((a, b) => a - b);
                const ranks1 = values1.map(value => values.indexOf(value));
                const ranks2 = values2.map(value => values.indexOf(value));
                const ties = (new Array(values.length)).fill(0);
                ranks1.concat(ranks2).sort((a, b) => a - b).map((rank, index) => {
                    if (rank !== index) {
                        ties[rank] += 1;
                    }
                });
                const count = count1 + count2;
                const count1x2 = count1 * count2;
                const U = count1x2 + count1 * (count1 + 1) / 2 - ranks1.map(rank => rank + ties[rank] / 2 + 1).reduce((sum, rank) => sum + rank, 0);
                const z = Math.abs(U - count1x2 / 2) / Math.sqrt((count1x2 / (count * (count - 1))) * (((Math.pow(count, 3)) - count) / 12 - ties.reduce((sum, tie) => sum + ((Math.pow(tie, 3)) - tie), 0) / 12));
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: count1,
                    median: median1,
                    iqr: iqr1,
                    count2: count2,
                    median2: median2,
                    iqr2: iqr2,
                    z: z,
                    p: p,
                    text: DRESS.padEnd(feature, pad) + ': [' + count1 + ']	' + DRESS.clamp(median1) + '	IQR: ' + DRESS.clamp(iqr1) + '	vs'
                        + ' [' + count2 + ']	' + DRESS.clamp(median2) + '	IQR: ' + DRESS.clamp(iqr2)
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: count1,
                median: median1,
                iqr: iqr1,
                count2: null,
                median2: null,
                iqr2: null,
                z: null,
                p: null,
                text: DRESS.padEnd(feature, pad) + ': [' + count1 + ']	' + DRESS.clamp(median1) + '	IQR: ' + DRESS.clamp(iqr1)
            };
        });
    };
    /**
     * @summary Calculate the proportion of subjects that a positive feature, and optionally compare the result to that of a second group of subjects.
     *
     * @description This method counts the number of subjects that has a positive feature.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then a positive feature is defined as a non-empty array.
     * If the property is not an array, then it would be converted to a numeric value and a positive feature is defined as any non-zero value.
     *
     * Z score is calcuated using the 2 proportions Z test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   feature (the feature being analyzed),
     *   count (the number of subject with a positive feature),
     *   proportion (the proportion of subject with a positive feature),
     *   ci (the confidence interval of the proportion),
     *   count2 (the number of subject with a positive feature for the second group of subjects, only applicable if subjects2 is specified),
     *   proportion2 (the proportion of subject with a positive feature for the second group of subjects, only applicable if subjects2 is specified),
     *   ci2 (the confidence interval of the proportion for the second group of subjects, only applicable if subjects2 is specified),
     *   z (z score, only applicable if subjects2 is specified),
     *   p (p value, only applicable if subjects2 is specified),
     *   text.
     */
    DRESS.proportions = (subjects, features, subjects2 = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            const cases1 = subjects.filter(subject => DRESS.numeric(DRESS.get(subject, feature)));
            const n1 = subjects.length;
            const p1 = cases1.length / n1;
            const se1 = Math.sqrt(p1 * (1 - p1) / n1);
            const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
            //            
            if (subjects2) {
                const cases2 = subjects2.filter(subject => DRESS.numeric(DRESS.get(subject, feature)));
                const n2 = subjects2.length;
                const p2 = cases2.length / n2;
                const se2 = Math.sqrt(p2 * (1 - p2) / n2);
                const ci2 = [p2 - zCI * se2, p2 + zCI * se2];
                //
                const p12 = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
                const z = ((p1 - p2) / Math.sqrt(p12 * (1 - p12) * ((1 / n1) + (1 / n2))));
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: cases1.length,
                    proportion: p1,
                    ci: ci1,
                    count2: cases2.length,
                    proportion2: p2,
                    ci2: ci2,
                    z: z,
                    p: p,
                    text: DRESS.padEnd(feature, pad) + ': [' + cases1.length + ']	' + DRESS.clamp(p1 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ') vs'
                        + '	[' + cases2.length + ']	' + DRESS.clamp(p2 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: cases1.length,
                proportion: p1,
                ci: ci1,
                count2: null,
                proportion2: null,
                ci2: null,
                z: null,
                p: null,
                text: DRESS.padEnd(feature, pad) + ': [' + cases1.length + ']	' + DRESS.clamp(p1 * 100) + '%'
                    + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
            };
        });
    };
    /**
     * @summary Calculate the frequency of occurrence for each feature value, and optionally compare the result to that of a second groups of subjects.
     *
     * @description This method tabulates all possible values for each feature, and counts the frequency of occurrence of each feature value.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then each value within the array
     * is converted to a string. If the property is not an array, then the entire value is converted into a string.
     *
     * Z score is calcuated using the 2 proportions Z test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     * @param {number} [limit=25] - Optional, maximum number of feature values to be analyzed.
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   feature (the feature being analyzed),
     *   values (an array of possible feature values),
     *   text.
     *   For each feature value, the following results are returned:
     *     count (the number of subject with said feature value),
     *     proportion (the proportion of subject with said feature value),
     *     ci (the confidence interval of the proportion),
     *     count2 (the number of subject with said feature value for the second group of subjects, only applicable if subjects2 is specified),
     *     proportion2 (the proportion of subject with said feature value for the second group of subjects, only applicable if subjects2 is specified),
     *     ci2 (the confidence interval of the proportion for the second group of subjects, only applicable if subjects2 is specified),
     *     z (z score, only applicable if subjects2 is specified),
     *     p (p value, only applicable if subjects2 is specified),
     *     text.
     */
    DRESS.frequencies = (subjects, features, subjects2 = null, limit = 25) => {
        let count = (subjects, feature) => {
            const counters = new Map();
            subjects.map(subject => {
                const value = DRESS.get(subject, feature);
                (Array.isArray(value) ? value.filter((value, index, values) => values.indexOf(value) === index) : [value]).map(value => {
                    value = String(value).trim();
                    counters.set(value, (counters.get(value) || 0) + 1);
                });
            });
            return Array.from(counters).sort((a, b) => b[1] - a[1]);
        };
        //
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            const n1 = subjects.length;
            const counters1 = count(subjects, feature).slice(0, limit);
            const pad = counters1.reduce((max, counter) => Math.max(max, counter[0].length), 0);
            if (subjects2) {
                const n2 = subjects2.length;
                const counters2 = count(subjects2, feature);
                return {
                    feature: feature,
                    values: counters1.map(counter1 => {
                        const p1 = counter1[1] / n1;
                        const se1 = Math.sqrt(p1 * (1 - p1) / n1);
                        const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
                        const counter2 = counters2.find(counter2 => counter1[0] === counter2[0]) || ['', 0];
                        const p2 = counter2[1] / n2;
                        const se2 = Math.sqrt(p2 * (1 - p2) / n2);
                        const ci2 = [p2 - zCI * se2, p2 + zCI * se2];
                        //
                        const p12 = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
                        const z = ((p1 - p2) / Math.sqrt(p12 * (1 - p12) * ((1 / n1) + (1 / n2))));
                        const p = DRESS.norm(z);
                        return {
                            value: counter1[0],
                            count: counter1[1],
                            proportion: p1,
                            ci: ci1,
                            count2: counter2[1],
                            proportion2: p2,
                            ci2: ci2,
                            z: z,
                            p: p,
                            text: DRESS.padEnd(counter1[0], pad) + ': [' + counter1[1] + ']	' + DRESS.clamp(p1 * 100) + '%'
                                + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')	vs'
                                + '	[' + counter2[1] + ']	' + DRESS.clamp(p2 * 100) + '%'
                                + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                                + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        };
                    }),
                    text: '[' + feature + ']'
                };
            }
            return {
                feature: feature,
                values: counters1.map(counter1 => {
                    const p1 = counter1[1] / n1;
                    const se1 = Math.sqrt(p1 * (1 - p1) / n1);
                    const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
                    return {
                        value: counter1[0],
                        count: counter1[1],
                        proportion: p1,
                        ci: ci1,
                        count2: null,
                        proportion2: null,
                        ci2: null,
                        z: null,
                        p: null,
                        text: DRESS.padEnd(counter1[0], pad) + ': [' + counter1[1] + ']	' + DRESS.clamp(p1 * 100) + '%'
                            + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                    };
                }),
                text: '[' + feature + ']'
            };
        });
    };
    /**
     * @summary Calculate the arithmetic mean for each feature, and optionally compare the result to that of a second group of subjects.
     *
     * @description This method computes the arithmetic means as well as the standard deviations of the specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   feature (the feature being analyzed),
     *   count (the number of subjects),
     *   mean (the arithmetic mean of the feature),
     *   sd (the standard deviation of the feature),
     *   ci (the confidence interval of the mean),
     *   count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   mean2 (the arithmetic mean of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   sd2 (the standard deviation of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   ci2 (the confidence interval of the mean for the second group of subjects, only applicable if subjects2 is specified),
     *   z (z score, only applicable if subjects2 is specified),
     *   p (p value, only applicable if subjects2 is specified),
     *   text.
     */
    DRESS.means = (subjects, features, subjects2 = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            const count1 = subjects.length;
            let mean1 = 0;
            let sd1 = 0;
            subjects.map((subject, index) => {
                const num = DRESS.numeric(DRESS.get(subject, feature));
                const delta = (num - mean1);
                mean1 += delta / (index + 1);
                sd1 += delta * (num - mean1);
            });
            sd1 = Math.sqrt(sd1 / count1);
            const ci1 = [mean1 - zCI * sd1 / Math.sqrt(count1), mean1 + zCI * sd1 / Math.sqrt(count1)];
            //
            if (subjects2) {
                const count2 = subjects2.length;
                let mean2 = 0;
                let sd2 = 0;
                subjects2.map((subject, index) => {
                    const num = DRESS.numeric(DRESS.get(subject, feature));
                    const delta = (num - mean2);
                    mean2 += delta / (index + 1);
                    sd2 += delta * (num - mean2);
                });
                sd2 = Math.sqrt(sd2 / count2);
                const ci2 = [mean2 - zCI * sd2 / Math.sqrt(count2), mean2 + zCI * sd2 / Math.sqrt(count2)];
                //      
                const z = (mean1 - mean2) / Math.sqrt(sd1 * sd1 / count1 + sd2 * sd2 / count2);
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: count1,
                    mean: mean1,
                    sd: sd1,
                    ci: ci1,
                    count2: count2,
                    mean2: mean2,
                    sd2: sd2,
                    ci2: ci2,
                    z: z,
                    p: p,
                    text: DRESS.padEnd(feature, pad) + ': [' + count1 + ']	' + DRESS.clamp(mean1)
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(sd1) + '	vs'
                        + ' [' + count2 + ']	' + DRESS.clamp(mean2)
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(sd2)
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: count1,
                mean: mean1,
                sd: sd1,
                ci: ci1,
                count2: null,
                mean2: null,
                sd2: null,
                ci2: null,
                z: null,
                p: null,
                text: DRESS.padEnd(feature, pad) + ': [' + count1 + ']	' + DRESS.clamp(mean1)
                    + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(sd1)
            };
        });
    };
})(DRESS || (DRESS = {}));
