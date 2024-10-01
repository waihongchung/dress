var DRESS;
(function (DRESS) {
    /**
     * @summary Perform Box-Cox Power Transformation
     *
     * @description This method can be used to transform the specified features into a normal distribution (or close to normal distribution) by performing the Box-Cox Transformation.
     * If the smallest original value is negative, the original values are shifted so that the smallest pre-transformed value is at least 0.
     *
     * This method automatically searches for the ideal lambda (from -5 to 5) using the Brent optimization method based on the log-likelihood ratio of the transformed values.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number[]} [lambdas=null] - An array of predefined lambdas to be used for transformation. It MUST be of the same length as the features array. Specifying this parameter will disable automatic lambda search.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - lambda (the optimal lambda value used),
     *   - shift (the shift value used),
     *   - text.
     */
    DRESS.boxcox = (subjects, features, names = null, lambdas = null) => {
        const transform = (X, lambda) => {
            let i = X.length;
            const T = Array(i);
            while (i--) {
                const x = X[i];
                if (lambda === 0) {
                    T[i] = Math.log(x);
                }
                else {
                    T[i] = ((Math.pow(x, lambda)) - 1) / lambda;
                }
            }
            return T;
        };
        const LL = (X, sum, lambda) => {
            return (X.length / 2) * Math.log(DRESS.moments(transform(X, lambda))[1]) - (lambda - 1) * sum;
        };
        const padding = DRESS.longest(features);
        const replacement = Array.isArray(names) && (names.length === features.length);
        const padding2 = replacement && DRESS.longest(names);
        //
        const numSubject = subjects.length;
        const numFeature = features.length;
        if (!(Array.isArray(lambdas) && (lambdas.length === numFeature))) {
            lambdas = Array(numFeature).fill(null);
        }
        return features.map((feature, index) => {
            const values = Array(numSubject);
            let i = numSubject;
            let shift = Number.POSITIVE_INFINITY;
            while (i--) {
                let value = DRESS.numeric(DRESS.get(subjects[i], feature));
                values[i] = value;
                if (value < shift) {
                    shift = value;
                }
            }
            shift = shift > 0 ? 0 : (shift - Number.EPSILON);
            i = numSubject;
            let sum = 0;
            while (i--) {
                sum += Math.log(values[i] -= shift);
            }
            //
            const lambda = (lambdas[index] !== null) ? lambdas[index] : DRESS.minima((l) => LL(values, sum, l), -5, 5);
            const T = transform(values, lambda);
            //
            const name = replacement ? names[index] : feature;
            i = numSubject;
            while (i--) {
                DRESS.set(subjects[i], name, T[i]);
            }
            //
            return {
                feature,
                name,
                lambda,
                shift,
                text: DRESS.pad(feature, padding) + (replacement ? (' >> ' + DRESS.pad(name, padding2)) : '') + ': ' + DRESS.clamp(lambda) + '	(' + DRESS.clamp(shift) + ')'
            };
        });
    };
    /**
     * @summary Perform Yeo-Johnson Power Transformation
     *
     * @description This method can be used to transform the specified features into a normal distribution (or close to normal distribution) by performing the Yeo-Johnson Transformation.
     * It is similar to the Box-Cox transformation but can handle negative values as well.
     *
     * This method automatically searches for the ideal lambda (from -5 to 5) using the Brent optimization method based on the log-likelihood ratio of the transformed values.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number[]} [lambdas=null] - An array of predefined lambdas to be used for transformation. It MUST be of the same length as the features array. Specifying this parameter will disable automatic lambda search.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - lambda (the optimal lambda value used),
     *   - text.
     */
    DRESS.johnson = (subjects, features, names = null, lambdas = null) => {
        const transform = (X, lambda) => {
            let i = X.length;
            const T = Array(i);
            while (i--) {
                const x = X[i];
                if (x < 0) {
                    if (lambda === 2) {
                        T[i] = -Math.log(-x + 1);
                    }
                    else {
                        T[i] = -((Math.pow((-x + 1), (2 - lambda))) - 1) / (2 - lambda);
                    }
                }
                else {
                    if (lambda === 0) {
                        T[i] = Math.log(x + 1);
                    }
                    else {
                        T[i] = ((Math.pow((x + 1), lambda)) - 1) / lambda;
                    }
                }
            }
            return T;
        };
        const LL = (X, sum, lambda) => {
            return (X.length / 2) * Math.log(DRESS.moments(transform(X, lambda))[1]) - (lambda - 1) * sum;
        };
        const padding = DRESS.longest(features);
        const replacement = Array.isArray(names) && (names.length === features.length);
        const padding2 = replacement && DRESS.longest(names);
        //
        const numSubject = subjects.length;
        const numFeature = features.length;
        if (!(Array.isArray(lambdas) && (lambdas.length === numFeature))) {
            lambdas = Array(numFeature).fill(null);
        }
        return features.map((feature, index) => {
            const values = Array(numSubject);
            let i = numSubject;
            let sum = 0;
            while (i--) {
                let value = DRESS.numeric(DRESS.get(subjects[i], feature));
                values[i] = value;
                const sign = value > 0 ? 1 : -1;
                sum += sign * Math.log(sign * value + 1);
            }
            //
            const lambda = (lambdas[index] !== null) ? lambdas[index] : DRESS.minima((l) => LL(values, sum, l), -5, 5);
            const T = transform(values, lambda);
            //
            const name = replacement ? names[index] : feature;
            i = numSubject;
            while (i--) {
                DRESS.set(subjects[i], name, T[i]);
            }
            //
            return {
                feature,
                name,
                lambda,
                text: DRESS.pad(feature, padding) + (replacement ? (' >> ' + DRESS.pad(name, padding2)) : '') + ': ' + DRESS.clamp(lambda)
            };
        });
    };
    /**
     * @summary Shapiro-Wilk/Shapiro-Francia Royston Test.
     *
     * @description This method performs the Shapiro-Wilk/Shaprio-Francia Royston Normality test on the specified features.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns An array of result objects, one for each specified features
     *   - feature (the feature being considered),
     *   - W (the test statistic),
     *   - z (the Z-value),
     *   - p (the p-value),
     *   - text.
     */
    DRESS.shapiro = (subjects, features) => {
        const padding = DRESS.longest(features);
        const numSubject = subjects.length;
        if (numSubject < 3) {
            return features.map(feature => ({
                feature,
                W: null,
                z: null,
                p: null,
                text: DRESS.pad(feature, padding) + ': unable to calculate normality with less than 3 samples.'
            }));
        }
        return features.map(feature => {
            const M = Array(numSubject);
            let m = 0;
            let i = numSubject;
            while (i--) {
                const p = (i + 1 - 0.375) / (numSubject + 0.25);
                M[i] = (p < 0.5) ? -DRESS.inorm(2 * p) : DRESS.inorm(2 * (1 - p));
                m += M[i] * M[i];
            }
            const u = 1 / Math.sqrt(numSubject);
            const Mn = M[numSubject - 1];
            const Mn1 = M[numSubject - 2];
            i = numSubject;
            M[--i] = -2.706056 * Math.pow(u, 5) + 4.434685 * Math.pow(u, 4) - 2.071190 * Math.pow(u, 3) - 0.147981 * Math.pow(u, 2) + 0.221157 * u + M[i] * Math.pow(m, -0.5);
            M[--i] = -3.582633 * Math.pow(u, 5) + 5.682633 * Math.pow(u, 4) - 1.752461 * Math.pow(u, 3) - 0.293762 * Math.pow(u, 2) + 0.042981 * u + M[i] * Math.pow(m, -0.5);
            const e = Math.sqrt(Math.abs((m - 2 * Mn * Mn - 2 * Mn1 * Mn1) / (1 - 2 * M[i + 1] * M[i + 1] - 2 * M[i] * M[i])));
            while (--i > 1) {
                M[i] /= e;
            }
            M[1] = -M[numSubject - 2];
            M[0] = -M[numSubject - 1];
            //
            const values = Array(numSubject);
            i = numSubject;
            while (i--) {
                values[i] = DRESS.numeric(DRESS.get(subjects[i], feature));
            }
            values.sort((a, b) => a - b);
            //
            let X = 0;
            let Y = 0;
            let X2 = 0;
            let Y2 = 0;
            let XY = 0;
            i = numSubject;
            while (i--) {
                const x = values[i];
                const y = M[i];
                X += x;
                Y += y;
                X2 += x * x;
                Y2 += y * y;
                XY += x * y;
            }
            let W = (numSubject * XY - X * Y) / (Math.sqrt(numSubject * X2 - X * X) * Math.sqrt(numSubject * Y2 - Y * Y));
            W *= W;
            //
            const ln = Math.log(numSubject);
            const z = (Math.log(1 - W) - (0.0038915 * Math.pow(ln, 3) - 0.083751 * Math.pow(ln, 2) - 0.31082 * ln - 1.5861)) / (Math.exp(0.0030302 * Math.pow(ln, 2) - 0.082676 * ln - 0.4803));
            const p = DRESS.norm(z) / 2;
            return {
                feature,
                W,
                z,
                p,
                text: DRESS.pad(feature, padding) + ': ' + DRESS.clamp(W) + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
            };
        });
    };
    /**
     * @summary d'Agostino-Pearson Test.
     *
     * @description This method performs the d'Agostino-Pearson Omnibus test on the specified features.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns An array of result objects, one for each specified features
     *   - feature (the feature being considered),
     *   - K2 (the test statistic),
     *   - p (the p-value),
     *   - text.
     */
    DRESS.dagostino = (subjects, features) => {
        const padding = DRESS.longest(features);
        const n = subjects.length;
        if (n < 3) {
            return features.map(feature => ({
                feature,
                K2: null,
                p: null,
                text: DRESS.pad(feature, padding) + ': unable to calculate normality with less than 3 samples.'
            }));
        }
        return features.map(feature => {
            const values = Array(n);
            let i = n;
            while (i--) {
                values[i] = DRESS.numeric(DRESS.get(subjects[i], feature));
            }
            const [, , skewness, kurtosis] = DRESS.moments(values);
            const C = 3 * (n * n + 27 * n - 70) * (n + 1) * (n + 3) / ((n - 2) * (n + 5) * (n + 7) * (n + 9));
            const W = Math.sqrt(2 * (C - 1)) - 1;
            const a = Math.sqrt(2 / (W - 1));
            const d = 1 / Math.sqrt(Math.log(Math.sqrt(W)));
            const T = skewness * Math.sqrt((n + 1) * (n + 3) / (6 * (n - 2))) / a;
            const Zs = d * Math.log(T + Math.sqrt(T * T + 1));
            //
            const G = (kurtosis + 3 - 3 * (n - 1) / (n + 1)) / Math.sqrt((24 * n * (n - 2) * (n - 3)) / ((n + 1) * (n + 1) * (n + 3) * (n + 5)));
            const E = 6 * (n * n - 5 * n + 2) / ((n + 7) * (n + 9)) * Math.sqrt(6 * (n + 3) * (n + 5) / (n * (n - 2) * (n - 3 + Number.EPSILON)));
            const A = 6 + (8 / E) * ((2 / E) + Math.sqrt(1 + (4 / E / E)));
            const r = 2 / 9 / A;
            const v = (1 - 2 / A) / (1 + G * Math.sqrt(2 / (A - 4)));
            const Zk = (1 - r - (Math.pow(v, (1 / 3)))) / Math.sqrt(r);
            //
            const K2 = Zk * Zk + Zs * Zs;
            const p = DRESS.chi2(K2, 2);
            return {
                feature,
                K2,
                p,
                text: DRESS.pad(feature, padding) + ': ' + DRESS.clamp(K2) + '	p: ' + DRESS.clamp(p)
            };
        });
    };
})(DRESS || (DRESS = {}));
