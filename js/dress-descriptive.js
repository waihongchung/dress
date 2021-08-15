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
     *   skewness (the Galton skewness),
     *   kurtosis (the excess percentile kurtosis),
     *   count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   median2 (the median values for the second group of subjects, only applicable if subjects2 is specified),
     *   iqr2 (the interquartile range for the second group of subjects, only applicable if subjects2 is specified),
     *   skewness2 (the Galton skewness for the second group of subjects, only applicable if subjects2 is specified),
     *   kurtosis2 (the excess percentile kurtosis for the second group of subjects, only applicable if subjects2 is specified),
     *   z (z score, only applicable if subjects2 is specified),
     *   p (p value, only applicable if subjects2 is specified),
     *   text.
     */
    DRESS.medians = (subjects, features, subjects2 = null) => {
        let quartiles = (subjects, feature) => {
            const numSubject = subjects.length;
            const values = new Array(numSubject);
            let i = numSubject;
            while (i--) {
                values[i] = DRESS.numeric(DRESS.get(subjects[i], feature));
            }
            values.sort((a, b) => a - b);
            i = numSubject;
            const median = (i & 1) ? values[(i - 1) / 2] : (values[i / 2] + values[i / 2 - 1]) / 2;
            i >>>= 1;
            const q25 = (i & 1) ? values[(i - 1) / 2] : (values[i / 2] + values[i / 2 - 1]) / 2;
            const q75 = (i & 1) ? values[numSubject - 1 - (i - 1) / 2] : (values[numSubject - i / 2] + values[numSubject - 1 - i / 2]) / 2;
            const iqr = q75 - q25;
            const p10 = values[Math.floor(numSubject * 0.1)];
            const p90 = values[Math.floor(numSubject * 0.9)];
            return [numSubject, median, iqr, (q25 + q75 - 2 * median) / iqr, iqr / (2 * (p90 - p10)) - 0.263, values];
        };
        //
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map(feature => {
            const quartiles1 = quartiles(subjects, feature);
            if (subjects2) {
                const quartiles2 = quartiles(subjects2, feature);
                //                
                const values = quartiles1[5 /* VALUES */].concat(quartiles2[5 /* VALUES */]).sort((a, b) => a - b);
                const ranks1 = quartiles1[5 /* VALUES */].map(value => values.indexOf(value));
                const ranks2 = quartiles2[5 /* VALUES */].map(value => values.indexOf(value));
                const ranks = ranks1.concat(ranks2).sort((a, b) => a - b);
                const count1 = quartiles1[0 /* COUNT */];
                const count2 = quartiles2[0 /* COUNT */];
                const count = count1 + count2;
                const ties = (new Array(count)).fill(0);
                let i = count;
                while (i--) {
                    if (ranks[i] !== i) {
                        ties[ranks[i]] += 1;
                    }
                }
                i = count1;
                while (i--) {
                    ranks1[i] += ties[ranks1[i]] / 2 + 1;
                }
                const count1x2 = count1 * count2;
                const U = count1x2 + count1 * (count1 + 1) / 2 - ranks1.reduce((sum, rank) => sum + rank);
                const z = Math.abs(U - count1x2 / 2) / Math.sqrt((count1x2 / (count * (count - 1))) * (((Math.pow(count, 3)) - count) / 12 - ties.reduce((sum, tie) => sum + ((Math.pow(tie, 3)) - tie), 0) / 12));
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: count1,
                    median: quartiles1[1 /* MEDIAN */],
                    iqr: quartiles1[2 /* IQR */],
                    skewness: quartiles1[3 /* SKEWNESS */],
                    kurtosis: quartiles1[4 /* KURTOSIS */],
                    count2: count2,
                    median2: quartiles2[1 /* MEDIAN */],
                    iqr2: quartiles2[2 /* IQR */],
                    skewness2: quartiles2[3 /* SKEWNESS */],
                    kurtosis2: quartiles2[4 /* KURTOSIS */],
                    z: z,
                    p: p,
                    text: DRESS.padEnd(feature, pad) + ': [' + count1 + ']	' + DRESS.clamp(quartiles1[1 /* MEDIAN */]) + '	IQR: ' + DRESS.clamp(quartiles1[2 /* IQR */]) + '	SKW: ' + DRESS.clamp(quartiles1[3 /* SKEWNESS */]) + '	KUR: ' + DRESS.clamp(quartiles1[4 /* KURTOSIS */]) + '	vs'
                        + ' [' + count2 + ']	' + DRESS.clamp(quartiles2[1 /* MEDIAN */]) + '	IQR: ' + DRESS.clamp(quartiles2[2 /* IQR */]) + '	SKW: ' + DRESS.clamp(quartiles2[3 /* SKEWNESS */]) + '	KUR: ' + DRESS.clamp(quartiles2[4 /* KURTOSIS */])
                        + ' U: ' + DRESS.clamp(U) + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: quartiles1[0 /* COUNT */],
                median: quartiles1[1 /* MEDIAN */],
                iqr: quartiles1[2 /* IQR */],
                skewness: quartiles1[3 /* SKEWNESS */],
                kurtosis: quartiles1[4 /* KURTOSIS */],
                count2: null,
                median2: null,
                iqr2: null,
                skewness2: null,
                kurtosis2: null,
                z: null,
                p: null,
                text: DRESS.padEnd(feature, pad) + ': [' + quartiles1[0 /* COUNT */] + ']	' + DRESS.clamp(quartiles1[1 /* MEDIAN */]) + '	IQR: ' + DRESS.clamp(quartiles1[2 /* IQR */]) + '	SKW: ' + DRESS.clamp(quartiles1[3 /* SKEWNESS */]) + '	KUR: ' + DRESS.clamp(quartiles1[4 /* KURTOSIS */])
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
            let cases1 = 0;
            const n1 = subjects.length;
            let i = n1;
            while (i--) {
                if (DRESS.numeric(DRESS.get(subjects[i], feature))) {
                    cases1 += 1;
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
                        cases2 += 1;
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
                    text: DRESS.padEnd(feature, pad) + ': [' + cases1 + ']	' + DRESS.clamp(p1 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ') vs'
                        + '	[' + cases2 + ']	' + DRESS.clamp(p2 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
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
                text: DRESS.padEnd(feature, pad) + ': [' + cases1 + ']	' + DRESS.clamp(p1 * 100) + '%'
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
            let i = subjects.length;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                (Array.isArray(value) ? value.filter((value, index, values) => values.indexOf(value) === index) : [value]).map(value => {
                    value = String(value).trim();
                    counters.set(value, (counters.get(value) || 0) + 1);
                });
            }
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
     *   skewness (the Fisher-Pearson coefficient of skewness),
     *   kurtosis (the excess Kurtosis),
     *   ci (the confidence interval of the mean),
     *   count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   mean2 (the arithmetic mean of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   sd2 (the standard deviation of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   skewness2 (the Fisher-Pearson coefficient of skewness, only applicable if subjects2 is specified),
     *   kurtosis2 (the excess Kurtosis, only applicable if subjects2 is specified),
     *   ci2 (the confidence interval of the mean for the second group of subjects, only applicable if subjects2 is specified),
     *   z (z score, only applicable if subjects2 is specified),
     *   p (p value, only applicable if subjects2 is specified),
     *   text.
     */
    DRESS.means = (subjects, features, subjects2 = null) => {
        let moments = (subjects, feature) => {
            const numSubject = subjects.length;
            let m1 = 0;
            let m2 = 0;
            let m3 = 0;
            let m4 = 0;
            for (let i = 0; i < numSubject; i++) {
                const num = DRESS.numeric(DRESS.get(subjects[i], feature));
                const n = i + 1;
                const delta = (num - m1);
                const delta_n = delta / n;
                const delta_n2 = delta_n * delta_n;
                const term = delta * delta_n * i;
                m1 += delta_n;
                m4 += term * delta_n2 * (n * n - 3 * n + 3) + 6 * delta_n2 * m2 - 4 * delta_n * m3;
                m3 += term * delta_n * (n - 2) - 3 * delta_n * m2;
                m2 += term;
            }
            return [numSubject, m1, m2 / numSubject, Math.sqrt(numSubject) * m3 / (Math.pow(m2, 1.5)), numSubject * m4 / (m2 * m2) - 3, Math.sqrt(m2) / numSubject];
        };
        //
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            const moments1 = moments(subjects, feature);
            const ci1 = [moments1[1 /* MEAN */] - zCI * moments1[5 /* ERROR */], moments1[1 /* MEAN */] + zCI * moments1[5 /* ERROR */]];
            //
            if (subjects2) {
                const moments2 = moments(subjects2, feature);
                const ci2 = [moments2[1 /* MEAN */] - zCI * moments2[5 /* ERROR */], moments2[1 /* MEAN */] + zCI * moments2[5 /* ERROR */]];
                //      
                const z = (moments1[1 /* MEAN */] - moments2[1 /* MEAN */]) / Math.sqrt(moments1[2 /* VARIANCE */] / moments1[0 /* COUNT */] + moments2[2 /* VARIANCE */] / moments2[0 /* COUNT */]);
                const p = DRESS.norm(z);
                return {
                    feature: feature,
                    count: moments1[0 /* COUNT */],
                    mean: moments1[1 /* MEAN */],
                    sd: Math.sqrt(moments1[2 /* VARIANCE */]),
                    skewness: moments1[3 /* SKEWNESS */],
                    kurtosis: moments1[4 /* KURTOSIS */],
                    ci: ci1,
                    count2: moments2[0 /* COUNT */],
                    mean2: moments2[1 /* MEAN */],
                    sd2: Math.sqrt(moments2[2 /* VARIANCE */]),
                    ci2: ci2,
                    skewness2: moments2[3 /* SKEWNESS */],
                    kurtosis2: moments2[4 /* KURTOSIS */],
                    z: z,
                    p: p,
                    text: DRESS.padEnd(feature, pad) + ': [' + moments1[0 /* COUNT */] + ']	' + DRESS.clamp(moments1[1 /* MEAN */])
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(Math.sqrt(moments1[2 /* VARIANCE */])) + '	SKW: ' + DRESS.clamp(moments1[3 /* SKEWNESS */]) + '	KUR: ' + DRESS.clamp(moments1[4 /* KURTOSIS */]) + '	vs'
                        + ' [' + moments2[0 /* COUNT */] + ']	' + DRESS.clamp(moments2[1 /* MEAN */])
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(Math.sqrt(moments2[2 /* VARIANCE */])) + '	SKW: ' + DRESS.clamp(moments2[3 /* SKEWNESS */]) + '	KUR: ' + DRESS.clamp(moments2[4 /* KURTOSIS */])
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                feature: feature,
                count: moments1[0 /* COUNT */],
                mean: moments1[1 /* MEAN */],
                sd: Math.sqrt(moments1[2 /* VARIANCE */]),
                skewness: moments1[3 /* SKEWNESS */],
                kurtosis: moments1[4 /* KURTOSIS */],
                ci: ci1,
                count2: null,
                mean2: null,
                sd2: null,
                skewness2: null,
                kurtosis2: null,
                ci2: null,
                z: null,
                p: null,
                text: DRESS.padEnd(feature, pad) + ': [' + moments1[0 /* COUNT */] + ']	' + DRESS.clamp(moments1[1 /* MEAN */])
                    + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(Math.sqrt(moments1[2 /* VARIANCE */])) + '	SKW: ' + DRESS.clamp(moments1[3 /* SKEWNESS */]) + '	KUR: ' + DRESS.clamp(moments1[4 /* KURTOSIS */])
            };
        });
    };
})(DRESS || (DRESS = {}));
