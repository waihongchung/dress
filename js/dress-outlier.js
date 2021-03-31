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
     *   quartiles (minimum, first quartile, median, third quartile, and maximum),
     *   whiskers (lower and upper whiskers),
     *   outliers (an array of outliers),
     *   text.
     */
    DRESS.boxplot = (subjects, features, nullify = false, cutoff = 1.5) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map(feature => {
            const values = [];
            subjects.map(subject => {
                const value = DRESS.get(subject, feature);
                if (value !== null) {
                    values.push(Array.isArray(value) ? value.length : +value);
                }
            });
            const count = values.sort((a, b) => a - b).length;
            let n = count;
            const q50 = (n & 1) ? values[(n - 1) / 2] : (values[n / 2] + values[n / 2 - 1]) / 2;
            n = (n - (n & 1)) / 2;
            const q25 = (n & 1) ? values[(n - 1) / 2] : (values[n / 2] + values[n / 2 - 1]) / 2;
            const q75 = (n & 1) ? values[count - 1 - (n - 1) / 2] : (values[count - n / 2] + values[count - 1 - n / 2]) / 2;
            const iqr = q75 - q25;
            const min = values.shift();
            const max = values.pop();
            const lower = q25 - cutoff * iqr;
            const upper = q75 + cutoff * iqr;
            //
            const outliers = [];
            subjects.map(subject => {
                const value = DRESS.get(subject, feature);
                if (value !== null) {
                    const num = Array.isArray(value) ? value.length : +value;
                    if ((num < lower) || (num > upper)) {
                        outliers.push(num);
                        if (nullify) {
                            DRESS.set(subject, feature, null);
                        }
                    }
                }
            });
            return {
                feature: feature,
                quartiles: [min, q25, q50, q75, max],
                whiskers: [lower, upper],
                outliers: outliers.sort((a, b) => b - a),
                p: outliers.length ? 0 : DRESS.SIGNIFICANCE,
                text: DRESS.padEnd(feature, pad) + ': ' + DRESS.clamp(lower) + '|--	[' + DRESS.clamp(min) + '	' + DRESS.clamp(q25) + '	' + DRESS.clamp(q50) + '	' + DRESS.clamp(q75) + '	' + DRESS.clamp(max) + ']	--|' + DRESS.clamp(upper)
                    + '	| ' + outliers.length + '	(' + DRESS.clamp(outliers.length / subjects.length * 100) + '%)	[' + outliers.map(outlier => DRESS.clamp(outlier)).join(', ') + ']'
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
     *   outliers (an array of outliers),
     *   text.
     */
    DRESS.grubbs = (subjects, features, nullify = false) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        return features.map(feature => {
            const outliers = [];
            const subjectValues = [];
            subjects.map(subject => {
                const value = DRESS.get(subject, feature);
                if (value !== null) {
                    subjectValues.push({
                        subject: subject,
                        value: Array.isArray(value) ? value.length : +value,
                        error: 0
                    });
                }
            });
            while (subjectValues.length) {
                let count = 0;
                let mean = 0;
                let sd = 0;
                subjectValues.map(subjectValue => {
                    const temp = (subjectValue.value - mean);
                    mean += temp / ++count;
                    sd += temp * (subjectValue.value - mean);
                });
                sd = Math.sqrt(sd / count);
                subjectValues.map(subjectValue => subjectValue.error = Math.abs(subjectValue.value - mean));
                const max = subjectValues.sort((a, b) => a.error - b.error).pop();
                const tCI = DRESS.atdist(2 * DRESS.SIGNIFICANCE / count, count - 2);
                const gCI = (count - 1) * tCI / Math.sqrt(count * (count - 2 + tCI * tCI));
                //
                if ((max.error / sd) > gCI) {
                    outliers.push(max);
                    if (nullify) {
                        DRESS.set(max.subject, feature, null);
                    }
                }
                else {
                    break;
                }
            }
            return {
                feature: feature,
                outliers: outliers.map(subjectValue => subjectValue.value),
                p: outliers.length ? 0 : DRESS.SIGNIFICANCE,
                text: DRESS.padEnd(feature, pad) + ': ' + outliers.length + '	(' + DRESS.clamp(outliers.length / subjects.length * 100) + '%)	[' + outliers.map(subjectValue => DRESS.clamp(subjectValue.value)).join(', ') + ']'
            };
        });
    };
})(DRESS || (DRESS = {}));
