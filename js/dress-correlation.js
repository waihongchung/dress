var DRESS;
(function (DRESS) {
    /**
     * @summary Calculate the degree of correlation between the specified features.
     *
     * @description This method computes the degree of correlation between two or more specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * By default, the degree of correlation is measured by means of the Spearman's rank correlation coefficient.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - The features to be analyzed.
     * @param {boolean} [rank=true] - Use Spearman's rank correlation coefficient. If set to false, then the Pearson correlation coefficient is used instead.
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   feature (the feature being evaluated),
     *   correlations (an array of correlation results, one for each remaining feature),
     *   text.
     *   For each correlation result, the following properties are returned:
     *     feature (the other feature being evaluated),
     *     r (the Spearman's correlation coefficient or the Pearson correlaton coefficient),
     *     ci (confidence interval),
     *     t (t score),
     *     p (p value),
     *     text.
     */
    DRESS.correlations = (subjects, features, rank = true) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const n = subjects.length;
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE) / ((n > 3) ? Math.sqrt(n - 3) : 1);
        //
        const matrix = (new Array(features.length)).fill(0).map(_ => (new Array(features.length)).fill(0));
        return features.map((featureX, row) => {
            let valX = subjects.map(subject => {
                const value = DRESS.get(subject, featureX);
                return Array.isArray(value) ? value.length : +value;
            });
            if (rank) {
                const rankX = valX.slice().sort((a, b) => a - b);
                valX = valX.map(value => rankX.indexOf(value));
            }
            features.map((featureY, col) => {
                if (row < col) {
                    let X = 0;
                    let Y = 0;
                    let X2 = 0;
                    let Y2 = 0;
                    let XY = 0;
                    if (rank) {
                        const valY = subjects.map(subject => {
                            const value = DRESS.get(subject, featureY);
                            return Array.isArray(value) ? value.length : +value;
                        });
                        const rankY = valY.slice().sort((a, b) => a - b);
                        valX.map((x, index) => {
                            const y = rankY.indexOf(valY[index]);
                            X += x;
                            Y += y;
                            X2 += x * x;
                            Y2 += y * y;
                            XY += x * y;
                        });
                    }
                    else {
                        subjects.map((subject, index) => {
                            const x = valX[index];
                            const value = DRESS.get(subject, featureY);
                            const y = Array.isArray(value) ? value.length : +value;
                            X += x;
                            Y += y;
                            X2 += x * x;
                            Y2 += y * y;
                            XY += x * y;
                        });
                    }
                    const r = (n * XY - X * Y) / (Math.sqrt(n * X2 - X * X) * Math.sqrt(n * Y2 - Y * Y));
                    const zR = Math.log((1 + r) / (1 - r)) / 2;
                    const ci = [(Math.exp(2 * (zR - zCI)) - 1) / (Math.exp(2 * (zR - zCI)) + 1), (Math.exp(2 * (zR + zCI)) - 1) / (Math.exp(2 * (zR + zCI)) + 1)];
                    const t = r * Math.sqrt((n - 2) / (1 - r * r));
                    const p = DRESS.tdist(t, n - 2);
                    matrix[row][col] = matrix[col][row] = {
                        r: r,
                        ci: ci,
                        t: t,
                        p: p
                    };
                }
            });
            return {
                feature: featureX,
                correlations: matrix[row].map((correlation, col) => {
                    if (correlation) {
                        return {
                            feature: features[col],
                            r: correlation.r,
                            ci: correlation.ci,
                            t: correlation.t,
                            p: correlation.p,
                            text: DRESS.padEnd(features[col], pad) + ': ' + DRESS.signed(DRESS.clamp(correlation.r)) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + correlation.ci.map(v => DRESS.signed(DRESS.clamp(v))).join(' - ') + ')'
                                + '	t: ' + DRESS.signed(DRESS.clamp(correlation.t)) + '	p: ' + DRESS.clamp(correlation.p)
                        };
                    }
                    return null;
                }).filter(_ => _),
                text: '[' + featureX + ']'
            };
        });
    };
})(DRESS || (DRESS = {}));
