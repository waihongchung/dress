var DRESS;
(function (DRESS) {
    /**
     * @summary Outlier detection using boxplot.
     *
     * @description This method computes a boxplot, reporting the minimum, first quartile, median, third quartile, and maximum, for each specified feature using a non-parametric algorithm.
     * It also computes the upper and lower whiskers, which is set by default as 1.5 times the interquartile range. Any values that lie outside the whiskers are considered as outliers.
     * Optionally, the outliers can be set to null, so that they can be further processed using an imputation algorithm.
     *
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value. Null values are ignored.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {boolean} [nullify=false] - Optional, set outliers to null. Default to false.
     * @param {number} [cutoff=1.5] - Optional, the distance of the whiskers. Default to 1.5 times the interquartile range.
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   feature (the feature being evaluated),
     *   count (the number of non-null values),
     *   quartiles (minimum, first quartile, median, third quartile, and maximum),
     *   whiskers (lower and upper whiskers),
     *   outliers (an array of outliers),
     *   text.
     */
    DRESS.boxplot = (subjects, features, nullify = false, cutoff = 1.5) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        const numSubject = subjects.length;
        return features.map(feature => {
            let values = new Array(numSubject);
            let count = 0;
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (value !== null) {
                    values[count++] = [i, DRESS.numeric(value)];
                }
            }
            values = values.slice(0, count).sort((a, b) => a[1] - b[1]);
            let n = count;
            const q50 = (n & 1) ? values[(n - 1) / 2][1] : (values[n / 2][1] + values[n / 2 - 1][1]) / 2;
            n >>>= 1;
            const q25 = (n & 1) ? values[(n - 1) / 2][1] : (values[n / 2][1] + values[n / 2 - 1][1]) / 2;
            const q75 = (n & 1) ? values[count - 1 - (n - 1) / 2][1] : (values[count - n / 2][1] + values[count - 1 - n / 2][1]) / 2;
            const iqr = q75 - q25;
            const min = values[0][1];
            const max = values[count - 1][1];
            const lower = q25 - cutoff * iqr;
            const upper = q75 + cutoff * iqr;
            //
            const outliers = [];
            i = 0;
            while (i < count) {
                if (values[i][1] < lower) {
                    outliers.push(values[i][1]);
                    if (nullify) {
                        DRESS.set(subjects[values[i][0]], feature, null);
                    }
                    i++;
                }
                else {
                    break;
                }
            }
            i = count;
            while (i--) {
                if (values[i][1] > upper) {
                    outliers.push(values[i][1]);
                    if (nullify) {
                        DRESS.set(subjects[values[i][0]], feature, null);
                    }
                }
                else {
                    break;
                }
            }
            return {
                feature,
                count,
                quartiles: [min, q25, q50, q75, max],
                whiskers: [lower, upper],
                outliers,
                p: outliers.length ? 0 : DRESS.SIGNIFICANCE,
                text: DRESS.padEnd(feature, pad) + ': [' + count + ']	' + outliers.length + '	(' + DRESS.clamp(outliers.length / count * 100) + '%)'
                    + '		' + DRESS.clamp(lower) + '|-	[' + DRESS.clamp(min) + '	' + DRESS.clamp(q25) + '	' + DRESS.clamp(q50) + '	' + DRESS.clamp(q75) + '	' + DRESS.clamp(max) + ']	-|' + DRESS.clamp(upper)
            };
        });
    };
    /**
     * @summary Outlier detection using the Grubbs' test.
     *
     * @description This method applies the Grubbs' test repetitively to detect outliers for each specified feature. Optionally, the outliers can be set to null, so that they can be further processed using an imputation algorithm.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value. Null values are ignored.
     *
     * Note that the algorithm assumes that the values of the feature is normally distributed. The algorithm should only be applied to normally distributed values.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {boolean} [nullify=false] - Optional, set outliers to null. Default to false.
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   feature (the feature being evaluated),
     *   count (the number of non-null values),
     *   outliers (an array of outliers),
     *   text.
     */
    DRESS.grubbs = (subjects, features, nullify = false) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        const numSubject = subjects.length;
        return features.map(feature => {
            const outliers = [];
            let values = new Array(numSubject);
            let count = 0;
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (value !== null) {
                    values[count++] = [i, DRESS.numeric(value), 0];
                }
            }
            values = values.slice(0, count);
            while (values.length) {
                const n = values.length;
                let mean = 0;
                let sd = 0;
                for (i = 0; i < n; i++) {
                    const delta = values[i][1] - mean;
                    mean += delta / (i + 1);
                    sd += delta * (values[i][1] - mean);
                }
                sd = Math.sqrt(sd / n);
                i = n;
                while (i--) {
                    values[i][2] = Math.abs(values[i][1] - mean);
                }
                const max = values.sort((a, b) => a[2] - b[2]).pop();
                const tCI = DRESS.atdist(2 * DRESS.SIGNIFICANCE / n, n - 2);
                const gCI = (n - 1) * tCI / Math.sqrt(n * (n - 2 + tCI * tCI));
                //
                if ((max[2] / sd) > gCI) {
                    outliers.push(max[1]);
                    if (nullify) {
                        DRESS.set(subjects[max[0]], feature, null);
                    }
                }
                else {
                    break;
                }
            }
            return {
                feature,
                count,
                outliers,
                p: outliers.length ? 0 : DRESS.SIGNIFICANCE,
                text: DRESS.padEnd(feature, pad) + ': [' + count + ']	' + outliers.length + '	(' + DRESS.clamp(outliers.length / count * 100) + '%)'
            };
        });
    };
})(DRESS || (DRESS = {}));
