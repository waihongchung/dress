var DRESS;
(function (DRESS) {
    /**
     * @summary Multiple logistic regressions.
     *
     * @description This method builds a statistical model to predict the occurrence of an event based on a list of features.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then a positive outcome is defined as a non-empty array, while the length of the array is used as the value of the feature.
     * If the property is not an array, then it would be converted to a numeric value and a positive outcome is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @returns {object} A result object, containing the following properties:
     *   outcomes (the array of outcomes that defines an event),
     *   deviance (the statistical deviance, or chi-square value of the model),
     *   r2 (the McFadden pseudo-R2 value of the model),
     *   aic (the Akaike Information Criteria of the model),
     *   p (p value, based on deviance),
     *   features (an array of features),
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the classification accuracy of the model, accepts an array of subjects and a threshold probability, default is 0.5, as parameters).
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      z (z score),
     *      p (p value),
     *      oddsRatio (oddsRatio),
     *      ci (confidence interval),
     *      text.
     */
    DRESS.logistic = (subjects, outcomes, features) => {
        let X;
        let Y;
        if (Array.isArray(subjects)) {
            X = new Array(subjects.length);
            Y = new Array(subjects.length);
            subjects.map((subject, index) => {
                X[index] = features.map(feature => DRESS.numeric(DRESS.get(subject, feature)));
                Y[index] = +outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome)));
            });
        }
        else if ((typeof subjects['X'] === 'object') && (typeof subjects['Y'] === 'object')) {
            X = subjects['X'];
            Y = subjects['Y'];
        }
        else {
            X = null;
            Y = null;
        }
        let model;
        if (X && Y) {
            const numRow = X.length;
            const numColumn = features.length + 1;
            const means = (new Array(numColumn)).fill(0);
            let SDs = (new Array(numColumn)).fill(0);
            X = X.map(Xr => {
                return [1, ...Xr].map((Xrc, c) => {
                    const delta = Xrc - means[c];
                    means[c] += delta / (c + 1);
                    SDs[c] += delta * (Xrc - means[c]);
                    return Xrc;
                });
            });
            SDs = SDs.map(sd => Math.sqrt(sd / numRow));
            const coefficients = (new Array(numColumn)).fill(0);
            const SEs = (new Array(numColumn)).fill(0);
            const matrix = (new Array(numColumn)).fill(null).map(_ => (new Array(numColumn + 1)).fill(0));
            for (let r = 0; r < numRow; r++) {
                for (let c = 1; c < numColumn; c++) {
                    X[r][c] -= means[c];
                    X[r][c] /= SDs[c];
                }
            }
            ;
            const Y1 = Y.reduce((a, b) => a + b, 0);
            const Y0 = Y.length - Y1;
            coefficients[0] = Math.log(Y1 / Y0);
            let LnV = 0;
            let Ln1mV = 0;
            let LLn = 0; // Log Likelihood Null
            let LLp = 2e+10; // Log Likelihood Previous
            let LL = 1e+10; // Log Likelihood
            let fract = 0.001;
            const ZERO = 1 / (Math.pow(10, (DRESS.PRECISION + 3)));
            while (Math.abs(LLp - LL) > ZERO) {
                LLp = LL;
                LL = 0;
                for (let j = 0; j < numColumn; j++) {
                    for (let k = j; k <= numColumn; k++) {
                        matrix[j][k] = 0;
                    }
                }
                ;
                for (let r = 0; r < numRow; r++) {
                    const Xr = X[r];
                    let q;
                    let v = Xr.reduce((v, Xrc, c) => v + coefficients[c] * Xrc, 0);
                    if (v > 15) {
                        q = Math.exp(-v);
                        LnV = -q;
                        Ln1mV = -v;
                        v = Math.exp(LnV);
                    }
                    else if (v < -15) {
                        q = Math.exp(v);
                        LnV = v;
                        Ln1mV = -q;
                        v = Math.exp(LnV);
                    }
                    else {
                        v = 1 / (1 + Math.exp(-v));
                        LnV = Math.log(v);
                        Ln1mV = Math.log(1 - v);
                        q = v * (1 - v);
                    }
                    LL -= 2 * Y[r] * LnV - 2 * (Y[r] - 1) * Ln1mV;
                    for (let c = 0; c < numColumn; c++) {
                        matrix[c][numColumn] += Xr[c] * (Y[r] * (1 - v) + (Y[r] - 1) * v);
                        for (let k = c; k < numColumn; k++) {
                            matrix[c][k] += Xr[c] * Xr[k] * q;
                        }
                    }
                    ;
                }
                ;
                if (LLp == 1e+10) {
                    LLn = LL;
                }
                for (let j = 1; j < numColumn; j++) {
                    for (let k = 0; k < j; k++) {
                        matrix[j][k] = matrix[k][j];
                    }
                }
                for (let i = 0; i < numColumn; i++) {
                    let s = matrix[i][i];
                    matrix[i][i] = 1;
                    for (let k = 0; k <= numColumn; k++) {
                        matrix[i][k] /= s;
                    }
                    for (let j = 0; j < numColumn; j++) {
                        if (i != j) {
                            s = matrix[j][i];
                            matrix[j][i] = 0;
                            for (let k = 0; k <= numColumn; k++) {
                                matrix[j][k] -= s * matrix[i][k];
                            }
                        }
                    }
                }
                fract *= 2;
                if (fract > 1) {
                    fract = 1;
                }
                for (let j = 0; j < numColumn; j++) {
                    coefficients[j] += fract * matrix[j][numColumn];
                }
                ;
            }
            for (let j = 1; j < numColumn; j++) {
                coefficients[j] /= SDs[j];
                SEs[j] = Math.sqrt(matrix[j][j]) / SDs[j];
                coefficients[0] -= coefficients[j] * means[j];
            }
            SEs[0] = 0;
            for (let j = 0; j < numColumn; j++) {
                let Xj;
                if (j === 0) {
                    Xj = 1;
                }
                else {
                    Xj = -means[j] / SDs[j];
                }
                for (let k = 0; k < numColumn; k++) {
                    let Xk;
                    if (k === 0) {
                        Xk = 1;
                    }
                    else {
                        Xk = -means[k] / SDs[k];
                    }
                    SEs[0] += Xj * Xk * matrix[j][k];
                }
            }
            SEs[0] = Math.sqrt(SEs[0]);
            //               
            features = ['(intercept)', ...features];
            const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
            const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
            const deviance = LLn - LL;
            const r2 = 1 - (LL / LLn);
            const aic = LL + 2 * numColumn;
            const p = DRESS.chiSq(deviance, numColumn - 1);
            model = {
                outcomes,
                deviance,
                r2,
                aic,
                p,
                features: coefficients.map((coefficient, j) => {
                    const z = coefficient / SEs[j];
                    const p = DRESS.norm(z);
                    const ci = [Math.exp(coefficient - zCI * SEs[j]), Math.exp(coefficient + zCI * SEs[j])];
                    return {
                        feature: features[j],
                        coefficient,
                        z,
                        p,
                        oddsRatio: Math.exp(coefficient),
                        ci,
                        text: DRESS.padEnd(features[j], pad) + ': ' + DRESS.signed(DRESS.clamp(coefficient))
                            + '	OR: ' + DRESS.clamp(Math.exp(coefficient)) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                            + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                    };
                }),
                text: '[' + outcomes.join(', ') + ']'
                    + '	R2: ' + DRESS.clamp(r2) + '	AIC: ' + DRESS.clamp(aic) + '	deviance: ' + DRESS.clamp(deviance) + '	p: ' + DRESS.clamp(p)
            };
        }
        else {
            model = subjects;
        }
        return Object.assign(Object.assign({}, model), { predict(subject) {
                let p = this.features[0].coefficient;
                let i = this.features.length;
                while (--i) {
                    p += DRESS.numeric(DRESS.get(subject, this.features[i].feature)) * this.features[i].coefficient;
                }
                return p;
            },
            roc(subjects, roc = DRESS.roc) {
                return roc({
                    predictions: subjects.map(subject => [
                        +this.outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome))),
                        this.predict(subject)
                    ])
                }, this.outcomes, ['logistic']);
            },
            performance(subjects, threshold = 0.5) {
                return DRESS.accuracies(subjects.map(subject => [
                    +this.outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome))),
                    (this.predict(subject) > threshold)
                ]));
            } });
    };
    /**
     * @summary Multiple linear regressions.
     *
     * @description This method builds a statistical model to predict the outcome values based on a list of features.
     * Each outcome and feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the outcome/feature.
     * If the property is not an array, then it would be converted to a numeric value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string} outcome - The outcome to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {boolean} [origin=false] - Force intercept to past through the origin. Default to false.
     * @returns {object} A result object, containing the following properties:
     *   outcome (the outcome),
     *   r2 (the R2 value of the model),
     *   ar2 (the adjusted R2 value of the model)
     *   f (the F statistic of the model),
     *   p (p value, based on deviance),
     *   features (an array of features),
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   performance (a method for evaluting the regression accuracy of the model, accepts an array of subjects as a parameter).
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      t (t score),
     *      p (p value),
     *      ci (confidence interval),
     *      text.
     */
    DRESS.linear = (subjects, outcome, features, origin = false) => {
        let X;
        let Y;
        if (Array.isArray(subjects)) {
            X = new Array(subjects.length);
            Y = new Array(subjects.length);
            subjects.map((subject, index) => {
                X[index] = features.map(feature => DRESS.numeric(DRESS.get(subject, feature)));
                Y[index] = DRESS.numeric(DRESS.get(subject, outcome));
            });
        }
        else if ((typeof subjects['X'] === 'object') && (typeof subjects['Y'] === 'object')) {
            X = subjects['X'];
            Y = subjects['Y'];
        }
        else {
            X = null;
            Y = null;
        }
        let model;
        if (X && Y) {
            X = origin ? X : X.map(Xr => [1, ...Xr]);
            const numRow = X.length;
            const numColumn = features.length + (origin ? 0 : 1);
            //
            const XT = (new Array(numColumn)).fill(null).map(_ => (new Array(numRow)).fill(0));
            X.map((Xr, r) => {
                Xr.map((Xrc, c) => {
                    XT[c][r] = Xrc;
                });
            });
            //
            const M = (new Array(numColumn)).fill(null).map(_ => (new Array(numColumn)).fill(0));
            XT.map((XTr, r) => {
                XT.map((Xc, c) => {
                    M[r][c] = XTr.reduce((p, XTrc, c) => p + XTrc * Xc[c], 0);
                });
            });
            //
            const I = (new Array(numColumn)).fill(null).map(_ => (new Array(numColumn)).fill(0));
            I.map((Ir, r) => {
                Ir[r] = 1;
            });
            //
            for (let r = 0; r < numColumn; ++r) {
                let e = M[r][r];
                if (e === 0) {
                    for (let rr = r + 1; rr < numColumn; ++rr) {
                        if (M[rr][r] !== 0) {
                            let temp = [...M[rr]];
                            M[rr] = M[r];
                            M[r] = temp;
                            //
                            temp = [...I[rr]];
                            I[rr] = I[r];
                            I[r] = temp;
                            //
                            break;
                        }
                    }
                    e = M[r][r];
                }
                for (let c = 0; c < numColumn; ++c) {
                    M[r][c] /= e;
                    I[r][c] /= e;
                }
                for (let rr = 0; rr < numColumn; ++rr) {
                    if (rr === r) {
                        continue;
                    }
                    e = M[rr][r];
                    for (let c = 0; c < numColumn; ++c) {
                        M[rr][c] -= e * M[r][c];
                        I[rr][c] -= e * I[r][c];
                    }
                }
            }
            //
            I.map((Ir, r) => {
                X.map((XTc, c) => {
                    XT[r][c] = Ir.reduce((p, Irc, c) => p + Irc * XTc[c], 0); // n * m
                });
            });
            //
            const O = XT.reduce((O, XTr) => {
                O.push(XTr.reduce((p, XTrc, c) => p + XTrc * Y[c], 0));
                return O;
            }, []);
            //
            const YP = X.reduce((YP, Xr) => {
                YP.push(Xr.reduce((p, Xrc, c) => p + Xrc * O[c], 0));
                return YP;
            }, []);
            let mean = 0;
            let SST = 0;
            let SSE = 0;
            Y.map((Yr, r) => {
                const temp = Yr - mean;
                const error = Yr - YP[r];
                mean += temp / (r + 1);
                SST += temp * (Yr - mean);
                SSE += error * error;
            });
            const MSE = SSE / (numRow - numColumn);
            const f = (SST - SSE) / (numColumn - (origin ? 0 : 1)) / MSE;
            const r2 = 1 - SSE / SST;
            const ar2 = 1 - (1 - r2) * (numRow - 1) / (numRow - numColumn);
            const aic = numRow * Math.log(SSE / numRow) + 2 * numColumn;
            const p = DRESS.fdist(f, numColumn - (origin ? 0 : 1), numRow - numColumn);
            const SEs = I.map((Ir, r) => Math.sqrt(Ir[r] * MSE));
            features = ['(intercept)', ...features];
            if (origin) {
                O.unshift(0);
                SEs.unshift(1e-8);
            }
            const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
            const zCI = DRESS.atdist(DRESS.SIGNIFICANCE, numRow - numColumn);
            //
            model = {
                outcome,
                r2,
                ar2,
                aic,
                f,
                p,
                features: O.map((Or, r) => {
                    const t = Or / SEs[r];
                    const p = DRESS.tdist(t, numRow - numColumn);
                    const ci = [Or - zCI * SEs[r], Or + zCI * SEs[r]];
                    return {
                        feature: features[r],
                        coefficient: Or,
                        t,
                        p,
                        ci,
                        text: DRESS.padEnd(features[r], pad) + ': ' + DRESS.signed(DRESS.clamp(Or))
                            + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                            + '	t: ' + DRESS.signed(DRESS.clamp(t)) + '	p: ' + DRESS.clamp(p)
                    };
                }),
                text: '[' + outcome + ']'
                    + '	R2: ' + DRESS.clamp(r2) + '	aR2: ' + DRESS.clamp(ar2) + '	AIC: ' + DRESS.clamp(aic) + '	F: ' + DRESS.clamp(f) + '	p: ' + DRESS.clamp(p)
            };
        }
        else {
            model = subjects;
        }
        return Object.assign(Object.assign({}, model), { predict(subject) {
                let p = this.features[0].coefficient;
                let i = this.features.length;
                while (--i) {
                    p += DRESS.numeric(DRESS.get(subject, this.features[i].feature)) * this.features[i].coefficient;
                }
                return p;
            },
            performance(subjects) {
                return DRESS.errors(subjects.map(subject => [
                    DRESS.numeric(DRESS.get(subject, this.outcome)),
                    this.predict(subject)
                ]));
            } });
    };
    /**
     * @summary Simple polynomial regression.
     *
     * @description This method builds a statistical model to predict the outcome values based on a feature using a polynomial equation.
     * Each outcome and feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the outcome/feature.
     * If the property is not an array, then it would be converted to a numeric value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string} outcome - The outcome to be analyzed.
     * @param {string} feature - The feature to be analyzed.
     * @param {number} degree - The maximum degree of the polynomial.
     * @param {boolean} [origin=false] - Force intercept to past through the origin. Default to false.
     * @returns {object} A result object, containing the following properties:
     *   outcome (the outcome),
     *   r2 (the R2 value of the model),
     *   ar2 (the adjusted R2 value of the model)
     *   f (the F statistic of the model),
     *   p (p value, based on deviance),
     *   features (based on the degree of the polynomial),
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   performance (a method for evaluting the regression accuracy of the model, accepts an array of subjects as a parameter).
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      t (t score),
     *      p (p value),
     *      ci (confidence interval),
     *      text.
     */
    DRESS.polynomial = (subjects, outcome, feature, degree, origin = false) => {
        let X;
        let Y;
        if (Array.isArray(subjects)) {
            X = new Array(subjects.length);
            Y = new Array(subjects.length);
            subjects.map((subject, index) => {
                X[index] = DRESS.numeric(DRESS.get(subject, feature));
                Y[index] = DRESS.numeric(DRESS.get(subject, outcome));
            });
        }
        else if ((typeof subjects['X'] === 'object') && (typeof subjects['Y'] === 'object')) {
            X = subjects['X'];
            Y = subjects['Y'];
        }
        else {
            X = null;
            Y = null;
        }
        const features = new Array(degree).fill(null).map((_, d) => feature + '^' + (d + 1));
        return DRESS.linear((X && Y) ? {
            X: X.map(Xr => (new Array(degree)).fill(null).map((_, d) => Math.pow(Xr, (d + 1)))),
            Y: Y
        } : subjects, outcome, features, origin);
    };
})(DRESS || (DRESS = {}));
