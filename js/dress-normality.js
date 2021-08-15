var DRESS;
(function (DRESS) {
    /**
     * @summary Perform Yeo-Johnson Power Transformation
     *
     * @description This method can be used to transform the specified features into a normal distribution (or close to normal distribution) by performing the Yeo-Johnson Transformation.
     * It is similar to the Box-Cox transformation, but is able to handle negative values as well.
     *
     * This method automatically searches for the ideal lambda (from -5 to 5) using the Brent optimization method based on the log-likelihood ratio of the transformed values.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   lambda (the optimal lambda value used),
     *   text
     */
    DRESS.johnson = (subjects, features, names = null) => {
        let transform = (X, lambda) => {
            const T = new Array(numSubject);
            let i = numSubject;
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
        let LL = (X, lambda) => {
            let sum = 0;
            let i = numSubject;
            while (i--) {
                sum += ((X[i] > 0) ? 1 : -1) * Math.log(Math.abs(X[i]) + 1);
            }
            return numSubject * 0.5 * Math.log(DRESS.variance(transform(X, lambda))) - (lambda - 1) * sum;
        };
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        const numSubject = subjects.length;
        return features.map((feature, index) => {
            const values = new Array(numSubject);
            let i = numSubject;
            while (i--) {
                values[i] = DRESS.numeric(DRESS.get(subjects[i], feature));
            }
            //
            const lambda = DRESS.minima((l) => LL(values, l), -5, 5);
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
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + DRESS.clamp(lambda)
            };
        });
    };
    /**
     * @summary Shapiro-Wilk test.
     *
     * @description This method performs the Shapiro-Wilk Normality test on the specified features.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @returns An array of result objects, one for each specified features
     *   feature (the feature being considered),
     *   W (the test statistic),
     *   z (the Z-value),
     *   p (the p-value),
     *   text
     */
    DRESS.normalities = (subjects, features) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        const numSubject = subjects.length;
        if (numSubject < 3) {
            return features.map(feature => ({
                feature,
                W: null,
                z: null,
                p: null,
                text: DRESS.padEnd(feature, pad) + ': unable to calculate normality with less than 3 samples.'
            }));
        }
        return features.map(feature => {
            const M = new Array(numSubject);
            let m = 0;
            let i = numSubject;
            while (i--) {
                M[i] = DRESS.asnorm((i + 1 - 0.375) / (numSubject + 0.25));
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
            const values = new Array(numSubject);
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
            const p = 1 - DRESS.snorm(z);
            return {
                feature,
                W,
                z,
                p,
                text: DRESS.padEnd(feature, pad) + ': ' + DRESS.clamp(W) + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
            };
        });
    };
})(DRESS || (DRESS = {}));
