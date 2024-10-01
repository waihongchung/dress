var DRESS;
(function (DRESS) {
    /**
     * @summary Outlier detection using boxplot.
     *
     * @description This method computes a boxplot, reporting the minimum, first quartile, median, third quartile, and maximum, for each specified feature using a non-parametric algorithm.
     * It also computes the upper and lower whiskers, which are set by default as 1.5 times the interquartile range. Any values that lie outside the whiskers are considered outliers.
     * Optionally, the outliers can be set to null, so that they can be further processed using an imputation algorithm.
     *
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value. Null values are ignored.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {boolean} [nullify=false] - Optional, set outliers to null. Default to false.
     * @param {number} [cutoff=1.5] - Optional, the distance of the whiskers. Default to 1.5 times the interquartile range.
     *
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   - feature (the feature being evaluated),
     *   - count (the number of non-null values),
     *   - quartiles (minimum, first quartile, median, third quartile, and maximum),
     *   - whiskers (lower and upper whiskers),
     *   - outliers (an array of outliers),
     *   - text.
     */
    DRESS.boxplot = (subjects, features, nullify = false, cutoff = 1.5) => {
        const padding = DRESS.longest(features);
        //
        const numSubject = subjects.length;
        return features.map(feature => {
            let subjectValues = Array(numSubject);
            let count = 0;
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (value !== null) {
                    subjectValues[count++] = [i, DRESS.numeric(value)];
                }
            }
            subjectValues = subjectValues.slice(0, count).sort((a, b) => a[1] - b[1]);
            //
            i = count;
            const median = (i & 1) ? subjectValues[(i - 1) / 2][1] : (subjectValues[i / 2][1] + subjectValues[i / 2 - 1][1]) / 2;
            i >>>= 1;
            const q25 = (i & 1) ? subjectValues[(i - 1) / 2][1] : (subjectValues[i / 2][1] + subjectValues[i / 2 - 1][1]) / 2;
            const q75 = (i & 1) ? subjectValues[count - 1 - (i - 1) / 2][1] : (subjectValues[count - i / 2][1] + subjectValues[count - 1 - i / 2][1]) / 2;
            const iqr = q75 - q25;
            const min = subjectValues[0][1];
            const max = subjectValues[count - 1][1];
            const lower = q25 - cutoff * iqr;
            const upper = q75 + cutoff * iqr;
            //
            const outliers = [];
            i = 0;
            while (i < count) {
                if (subjectValues[i][1] < lower) {
                    outliers.push(subjectValues[i][1]);
                    if (nullify) {
                        DRESS.set(subjects[subjectValues[i][0]], feature, null);
                    }
                    i++;
                }
                else {
                    break;
                }
            }
            i = count;
            while (i--) {
                if (subjectValues[i][1] > upper) {
                    outliers.push(subjectValues[i][1]);
                    if (nullify) {
                        DRESS.set(subjects[subjectValues[i][0]], feature, null);
                    }
                }
                else {
                    break;
                }
            }
            return {
                feature,
                count,
                quartiles: [min, q25, median, q75, max],
                whiskers: [lower, upper],
                outliers,
                p: outliers.length ? 0 : DRESS.SIGNIFICANCE,
                text: DRESS.pad(feature, padding) + ': [' + count + ']	' + outliers.length + '	(' + DRESS.clamp(outliers.length / count * 100) + '%)'
                    + '		(' + DRESS.clamp(lower) + ')	[' + DRESS.clamp(min) + '	' + DRESS.clamp(q25) + '	' + DRESS.clamp(median) + '	' + DRESS.clamp(q75) + '	' + DRESS.clamp(max) + ']	(' + DRESS.clamp(upper) + ')'
            };
        });
    };
    /**
     * @summary Outlier detection using the Grubbs' test.
     *
     * @description This method applies the Grubbs' test repetitively to detect outliers for each specified feature. Optionally, the outliers can be set to null, so that they can be further processed using an imputation algorithm.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value. Null values are ignored.
     *
     * Note that the algorithm assumes that the values of the feature are normally distributed. The algorithm should only be applied to normally distributed values.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {boolean} [nullify=false] - Optional, set outliers to null. Default to false.
     *
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   - feature (the feature being evaluated),
     *   - count (the number of non-null values),
     *   - outliers (an array of outliers),
     *   - text.
     */
    DRESS.grubbs = (subjects, features, nullify = false) => {
        const padding = DRESS.longest(features);
        //
        const numSubject = subjects.length;
        return features.map(feature => {
            let subjectValues = Array(numSubject);
            let mean = 0;
            let sd = 0;
            let count = 0;
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (value !== null) {
                    const num = DRESS.numeric(value);
                    subjectValues[count++] = [i, num];
                    const delta = num - mean;
                    mean += delta / count;
                    sd += delta * (num - mean);
                }
            }
            subjectValues = subjectValues.slice(0, count).sort(([, a], [, b]) => a - b);
            //
            const outliers = [];
            while (count) {
                sd = Math.sqrt(sd / count);
                const first = Math.abs(subjectValues[0][1] - mean);
                const last = Math.abs(subjectValues[count - 1][1] - mean);
                const tCI = DRESS.istudentt(2 * DRESS.SIGNIFICANCE / count, count - 2);
                const gCI = (count - 1) * tCI / Math.sqrt(count * (count - 2 + tCI * tCI));
                let subjectValue = null;
                if (first > last) {
                    if ((first / sd) > gCI) {
                        subjectValue = subjectValues.shift();
                    }
                    else {
                        break;
                    }
                }
                else {
                    if ((last / sd) > gCI) {
                        subjectValue = subjectValues.pop();
                    }
                    else {
                        break;
                    }
                }
                outliers.push(subjectValue[1]);
                if (nullify) {
                    DRESS.set(subjects[subjectValue[0]], feature, null);
                }
                // 
                sd *= sd * count;
                const delta = subjectValue[1] - mean;
                mean -= delta / --count;
                sd -= delta * (subjectValue[1] - mean);
            }
            count += outliers.length;
            return {
                feature,
                count,
                outliers,
                p: outliers.length ? 0 : DRESS.SIGNIFICANCE,
                text: DRESS.pad(feature, padding) + ': [' + count + ']	' + outliers.length + '	(' + DRESS.clamp(outliers.length / count * 100) + '%)'
            };
        });
    };
})(DRESS || (DRESS = {}));
