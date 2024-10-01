var DRESS;
(function (DRESS) {
    const regress = (X, Y, currentCount, means, deviations, coefficients, errors, iteration, learning, regularization, predict, cost, hessian) => {
        const numRow = X.length;
        if (numRow === 0) {
            return 0;
        }
        regularization /= numRow;
        const numColumn = coefficients.length;
        const matrix = Array(numColumn).fill(null).map(() => Array(numColumn + 1).fill(0));
        // Convert standard deviations to total variances
        for (let c = 0; c < numColumn; c++) {
            deviations[c] *= deviations[c] * currentCount;
        }
        // Standardize values
        for (let r = 0; r < numRow; r++) {
            X[r].unshift(1);
            for (let c = 0; c < numColumn; c++) {
                const delta = X[r][c] - means[c];
                means[c] += delta / (r + 1 + currentCount);
                deviations[c] += delta * (X[r][c] - means[c]);
            }
        }
        // Convert total variances to standard deviations
        for (let c = 0; c < numColumn; c++) {
            deviations[c] = Math.sqrt(deviations[c] / (numRow + currentCount));
        }
        for (let r = 0; r < numRow; r++) {
            for (let c = 1; c < numColumn; c++) {
                X[r][c] -= means[c];
                X[r][c] /= deviations[c];
            }
        }
        // Destandardize coefficients
        for (let j = 1; j < numColumn; j++) {
            coefficients[0] += coefficients[j] * means[j];
            coefficients[j] *= deviations[j];
        }
        // Newtonian Gradient Descent
        const ZERO = Math.pow(10, -(DRESS.PRECISION + 3));
        let delta;
        do {
            // Reset matrix
            for (let j = 0; j < numColumn; j++) {
                matrix[j].fill(0);
            }
            // Compute Gradient and Hassian
            for (let r = 0; r < numRow; r++) {
                let prediction = 0;
                for (let c = 0; c < numColumn; c++) {
                    prediction += coefficients[c] * X[r][c];
                }
                prediction = predict(prediction);
                const error = Y[r] - prediction;
                const hesse = hessian(Y[r], prediction);
                for (let c = 0; c < numColumn; c++) {
                    matrix[c][numColumn] += X[r][c] * error + (c ? 1 : 0) * regularization * coefficients[c]; // Gradient
                    for (let k = c; k < numColumn; k++) {
                        matrix[c][k] += X[r][c] * X[r][k] * hesse + ((c && (c === k)) ? 1 : 0) * regularization;
                    }
                }
            }
            // Matrix Inversion and Gradient Multiplication
            for (let j = 1; j < numColumn; j++) {
                for (let k = 0; k < j; k++) {
                    matrix[j][k] = matrix[k][j];
                }
            }
            for (let i = 0; i < numColumn; i++) {
                const s = matrix[i][i];
                matrix[i][i] = 1;
                for (let k = 0; k <= numColumn; k++) {
                    matrix[i][k] /= s;
                }
                for (let j = 0; j < numColumn; j++) {
                    if (i !== j) {
                        const s = matrix[j][i];
                        matrix[j][i] = 0;
                        for (let k = 0; k <= numColumn; k++) {
                            matrix[j][k] -= s * matrix[i][k];
                        }
                    }
                }
            }
            // Update coefficients
            delta = 0;
            for (let j = 0; j < numColumn; j++) {
                delta += Math.abs(matrix[j][numColumn]);
                coefficients[j] += matrix[j][numColumn] * learning;
            }
            delta /= numColumn;
        } while ((delta > ZERO) && (--iteration > 0));
        // Compute cost
        let costFull = 0;
        for (let r = 0; r < numRow; r++) {
            let prediction = 0;
            for (let c = 0; c < numColumn; c++) {
                prediction += coefficients[c] * X[r][c];
            }
            prediction = predict(prediction);
            costFull += cost(Y[r], prediction);
        }
        //
        // Standardize coefficients and compute errors
        for (let j = 1; j < numColumn; j++) {
            coefficients[j] /= deviations[j];
            coefficients[0] -= coefficients[j] * means[j];
            errors[j] = Math.sqrt(matrix[j][j]) / deviations[j];
        }
        errors[0] = 0;
        for (let j = 0; j < numColumn; j++) {
            const eJ = (j === 0) ? 1 : -means[j] / deviations[j];
            for (let k = 0; k < numColumn; k++) {
                const eK = (k === 0) ? 1 : -means[k] / deviations[k];
                errors[0] += eJ * eK * matrix[j][k];
            }
        }
        errors[0] = Math.sqrt(errors[0]);
        //
        return costFull;
    };
    /**
     * @summary Multiple logistic regressions.
     *
     * @description This method builds a statistical model to predict the occurrence of an event based on a list of features.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had a UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive outcome is defined as a non-empty array, while the length of the array is used as the value of the feature.
     * If the property is not an array, then it would be converted to a numeric value and a positive outcome is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters include number of iteration (iteration), learning rate (learning), and regularization strength (regularization).
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcomes (the array of outcomes that defines an event),
     *   - deviance (the statistical deviance, or chi-square value of the model),
     *   - r2 (the McFadden pseudo-R2 value of the model),
     *   - aic (the Akaike Information Criteria of the model),
     *   - p (p-value, based on deviance),
     *   - features (an array of features containing the following properties),
     *   > - feature (the feature being considered),
     *   > - coefficient (the regression coefficient),
     *   > - z (z score),
     *   > - p (p-value),
     *   > - oddsRatio (oddsRatio),
     *   > - ci (confidence interval),
     *   > - text.
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model)
     *   - estimate (a method for computing an estimate, probability of the outcome being true, based on the model, accepts one subject as a parameter)
     *   - predict (a method for making a prediction based on the model, accepts one subject and a threshold probability, default is 0.5, as parameters),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the classification accuracy of the model, accepts an array of subjects and a threshold probability, default is 0.5, as parameters).
     */
    DRESS.logistic = (subjects, outcomes = [], features = [], hyperparameters = {}) => {
        //    
        const XY = (subjects, outcomes, features, X, Y) => {
            const numFeature = features.length;
            let i = subjects.length;
            while (i--) {
                X[i] = Array(numFeature);
                let j = numFeature;
                while (j--) {
                    X[i][j] = DRESS.numeric(DRESS.get(subjects[i], features[j]));
                }
                Y[i] = +outcomes.every(outcome => DRESS.numeric(DRESS.get(subjects[i], outcome)));
            }
        };
        //
        const logistic = (X, Y, outcomes, features, currentCount, means, deviations, coefficients, hyperparameters) => {
            if ((X === null) || (Y === null)) {
                return null;
            }
            //
            const { iteration = Number.MAX_SAFE_INTEGER, learning = 1, regularization = 0, } = hyperparameters;
            //
            const numRow = X.length;
            const numColumn = features.length;
            //        
            let costNull = Y.filter(_ => _).length / numRow;
            costNull = numRow ? numRow * (costNull * Math.log(costNull) + (1 - costNull) * Math.log(1 - costNull)) : Number.EPSILON;
            const errors = Array(numColumn).fill(0);
            const costFull = regress(X, Y, currentCount, means, deviations, coefficients, errors, iteration, learning, regularization, (value) => (1 / (1 + Math.exp(-value))), (expectation, prediction) => (expectation * Math.log(prediction + Number.EPSILON) + (1 - expectation) * Math.log(1 - prediction + Number.EPSILON)), (expectation, prediction) => (prediction * (1 - prediction)));
            const deviance = 2 * (costFull - costNull);
            const r2 = 1 - (costFull / costNull);
            const aic = 2 * (numColumn - costFull);
            const p = DRESS.chi2(deviance, numColumn - 1);
            //                       
            const padding = DRESS.longest(features);
            const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
            //
            return {
                outcomes,
                count: currentCount + numRow,
                classes: null,
                deviance,
                r2,
                aic,
                p,
                features: coefficients.map((coefficient, c) => {
                    const oddsRatio = Math.exp(coefficient);
                    const z = coefficient / (errors[c] + Number.EPSILON);
                    const p = DRESS.norm(z);
                    const ci = [Math.exp(coefficient - zCI * errors[c]), Math.exp(coefficient + zCI * errors[c])];
                    return {
                        feature: features[c],
                        mean: means[c],
                        deviation: deviations[c],
                        coefficient,
                        oddsRatio,
                        ci,
                        z,
                        p,
                        text: DRESS.pad(features[c], padding) + ': ' + DRESS.sign(DRESS.clamp(coefficient))
                            + '	OR: ' + DRESS.clamp(oddsRatio) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                            + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                    };
                }),
                hyperparameters,
                text: '[' + outcomes.join(' + ') + ']'
                    + '	r2: ' + DRESS.clamp(r2) + '	aic: ' + DRESS.clamp(aic) + '	deviance: ' + DRESS.clamp(deviance) + '	p: ' + DRESS.clamp(p),
            };
        };
        //
        let X = null;
        let Y = null;
        if (Array.isArray(subjects)) {
            X = Array(subjects.length);
            Y = Array(subjects.length);
            XY(subjects, outcomes, features, X, Y);
            features = ['(intercept)', ...features]; // Do NOT modify original parameters. Otherwise will break forward/backward selection.
        }
        //
        const numFeature = features.length;
        let model = logistic(X, Y, outcomes, features, 0, Array(numFeature).fill(0), Array(numFeature).fill(0), Array(numFeature).fill(0), hyperparameters);
        if (!model) {
            model = subjects;
        }
        //
        return Object.assign(Object.assign({}, model), { async: DRESS.nameof(() => DRESS.logistic), 
            /**
             * @summary Fit the prepopulated X and Y arrays to the existing model.
             *
             * @param {number[][]} X
             * @param {number[]} Y
             */
            fit(X, Y) {
                const features = this.features.map(feature => feature.feature);
                const means = this.features.map(feature => feature.mean);
                const deviations = this.features.map(feature => feature.deviation);
                const coefficients = this.features.map(feature => feature.coefficient);
                //
                const model = logistic(X, Y, this.outcomes, features, this.count, means, deviations, coefficients, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @sumarry Train one or more subjects against the existing model.
             *
             * @param {object[]} subjects - The subjects to be processed.
             */
            train(subjects) {
                const features = this.features.map(feature => feature.feature);
                //
                let X = null;
                let Y = null;
                if (Array.isArray(subjects)) {
                    X = Array(subjects.length);
                    Y = Array(subjects.length);
                    XY(subjects, this.outcomes, features.slice(1), X, Y); // Ignore intercept
                }
                //                                
                this.fit(X, Y);
            },
            /**
             * @summary Compute an estimate based on the model
             *
             * @description This method computes an estimate, probability of the outcome being positive, based on the model.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {number} The outcome estimate.
             */
            estimate(subject) {
                const features = this.features;
                let p = features[0].coefficient;
                let i = features.length;
                while (--i) {
                    p += DRESS.numeric(DRESS.get(subject, features[i].feature)) * features[i].coefficient;
                }
                return 1 / (1 + Math.exp(-p));
            },
            /**
             * @summary Make a prediction based on the model
             *
             * @description This method computes the predicted outcome based on a test subject.
             *
             * @param {object} subject - A test subject
             * @param {number} [threshold=0.5] - The probability threshold above which the predicted outcome is considered positive.
             *
             * @returns {number} The predicted outcome
             */
            predict(subject, threshold = 0.5) {
                return +(this.estimate(subject) > threshold);
            },
            /**
             * @summary Compute the area under the curve for a classification model.
             *
             * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
             *
             * @returns A ROC or PR curve
             */
            auc(subjects, curve = DRESS.roc) {
                const outcomes = this.outcomes;
                return curve({
                    predictions: subjects.map(subject => [
                        this.estimate(subject),
                        +outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome)))
                    ])
                }, outcomes, ['AUC']);
            },
            /**
             * @summary Validate the performance of the model.
             *
             * @description This method computes the accuracy of the model based on the specified test subjects and a specified threshold.
             *
             * @param {object[]} subjects - An array of test subjects
             * @param {number} [threshold=0.5] - The probability threshold above which the predicted outcome is considered positive.
             *
             * @returns The performance of the model.
             */
            validate(subjects, threshold = 0.5) {
                const outcomes = this.outcomes;
                return DRESS.accuracies(subjects.map(subject => [
                    this.predict(subject, threshold),
                    +outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome)))
                ]));
            } });
    };
    /**
     * @summary Polytomous Logistic Regression
     *
     * @description This method builds a polytomous (or multinomial) classification model based on logistic regression on a list of features.
     * The outcome must be a categorical feature with two or more possible values. For instance, the outcome of 'smoking history' may be one of three values: 'current', 'former', and 'never'.
     * An outcome cannot be an array. Each outcome and feature should be a property of the subject or be accessible using the dot notation.  All features must be numerical.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcome - The outcome of the model.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters to be passed to the logistic regression algorithm.
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcome (the outcome of the model),
     *   - deviance (the statistical deviance, or chi-square value of the model),
     *   - r2 (the McFadden pseudo-R2 value of the model),
     *   - aic (the Akaike Information Criteria of the model),
     *   - p (p-value, based on deviance),
     *   - classes (a list of distinct classes)
     *   - features (an array of features, each containing the following properties),
     *   > - feature (the feature being considered),
     *   > - coefficients (the regression coefficients),
     *   > - p (p-value),
     *   > - text.
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model)
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the classification accuracy of the model, accepts an array of subjects as a parameter).
     */
    DRESS.polytomous = (subjects, outcome = null, features = [], hyperparameters = {}) => {
        //    
        const XY = (subjects, outcome, features, X, Y) => {
            const numFeature = features.length;
            let i = subjects.length;
            while (i--) {
                X[i] = Array(numFeature);
                let j = numFeature;
                while (j--) {
                    X[i][j] = DRESS.numeric(DRESS.get(subjects[i], features[j]));
                }
                Y[i] = DRESS.get(subjects[i], outcome);
            }
        };
        //
        const polytomous = (X, Y, outcome, classes, features, currentCount, means, deviations, coefficients, hyperparameters) => {
            if ((X === null) || (Y === null)) {
                return null;
            }
            //
            const numRow = X.length;
            const numColumn = features.length;
            //
            const clsX = Array(classes.length).fill(null).map(() => []);
            let i = numRow;
            while (i--) {
                const clsIndex = DRESS.classify(Y[i], classes);
                (clsX[clsIndex] || (clsX[clsIndex] = [])).push(X[i]);
            }
            //            
            const Ps = Array(numColumn).fill(Number.POSITIVE_INFINITY);
            const mX = Array().concat(...clsX);
            const mY = Array(numRow);
            let oneIndex = 0;
            let costNull = 0;
            let costFull = 0;
            classes.forEach((cls, clsIndex) => {
                const one = clsX[clsIndex];
                if (one.length && (one.length < numRow)) {
                    // Construct model                                
                    const model = DRESS.logistic([], [cls], features.slice(1), hyperparameters); // Ignore intercept           
                    model.count = currentCount;
                    model.features.forEach((feature, f) => {
                        feature.mean = means[f] || 0;
                        feature.deviation = deviations[f] || 0;
                        feature.coefficient = coefficients[f][clsIndex] || 0;
                    });
                    // Train model
                    model.fit(mX.map(row => row.slice()), // Make a copy.
                    mY.fill(0).fill(1, oneIndex, oneIndex += one.length));
                    //                    
                    if (!isNaN(model.deviance)) {
                        // Extract coefficients
                        model.features.forEach((feature, f) => {
                            means[f] = feature.mean;
                            deviations[f] = feature.deviation;
                            coefficients[f][clsIndex] = feature.coefficient;
                            if (feature.p < Ps[f]) {
                                Ps[f] = feature.p;
                            }
                        });
                        const cost = model.deviance / model.r2;
                        costNull += cost;
                        costFull += cost - model.deviance;
                    }
                    else {
                        // set coefficients to zero
                        model.features.forEach((feature, f) => {
                            coefficients[f][clsIndex] = 0;
                        });
                    }
                }
            });
            //
            const deviance = costNull - costFull;
            const r2 = 1 - (costFull / costNull);
            const aic = costFull + 2 * numColumn;
            const p = DRESS.chi2(deviance, numColumn - 1);
            //            
            const padding = DRESS.longest(features);
            return {
                outcome,
                count: currentCount + numRow,
                classes,
                deviance,
                r2,
                aic,
                p,
                features: features.map((feature, f) => ({
                    feature,
                    mean: means[f],
                    deviation: deviations[f],
                    coefficients: coefficients[f],
                    p: Ps[f],
                    text: DRESS.pad(feature, padding) + ': [' + coefficients[f].map(c => DRESS.sign((DRESS.clamp(c)))).join(', ') + ']	p: ' + DRESS.clamp(Ps[f])
                })),
                hyperparameters,
                text: '[' + outcome + ']'
                    + '	r2: ' + DRESS.clamp(r2) + '	aic: ' + DRESS.clamp(aic) + '	deviance: ' + DRESS.clamp(deviance) + '	p: ' + DRESS.clamp(p)
            };
        };
        //
        let X = null;
        let Y = null;
        if (Array.isArray(subjects)) {
            X = Array(subjects.length);
            Y = Array(subjects.length);
            XY(subjects, outcome, features, X, Y);
            features = ['(intercept)', ...features]; // Do NOT modify original parameters. Otherwise will break forward/backward selection.
        }
        //        
        const numFeature = features.length;
        let model = polytomous(X, Y, outcome, [], features, 0, Array(numFeature).fill(0), Array(numFeature).fill(0), (Array(numFeature).fill(null)).map(() => []), hyperparameters);
        if (!model) {
            model = subjects;
        }
        //
        return Object.assign(Object.assign({}, model), { async: DRESS.nameof(() => DRESS.polytomous), 
            /**
             * @summary Fit the prepopulated X and Y arrays to the existing model.
             *
             * @param {number[][]} X
             * @param {string[]} Y
             */
            fit(X, Y) {
                const features = this.features.map(feature => feature.feature);
                const means = this.features.map(feature => feature.mean);
                const deviations = this.features.map(feature => feature.deviation);
                const coefficients = this.features.map(feature => feature.coefficients);
                //
                const model = polytomous(X, Y, this.outcome, this.classes, features, this.count, means, deviations, coefficients, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @sumarry Train one or more subjects against the existing model.
             *
             * @param {object[]} subjects - The subjects to be processed.
             */
            train(subjects) {
                const features = this.features.map(feature => feature.feature);
                //
                let X = null;
                let Y = null;
                if (Array.isArray(subjects)) {
                    X = Array(subjects.length);
                    Y = Array(subjects.length);
                    XY(subjects, this.outcome, features.slice(1), X, Y); // Ignore intercept
                }
                //
                this.fit(X, Y);
            },
            /**
             * @summary Compute the probabilities of each class for a test subject.
             *
             * @description This method computes the probabilities of each possible outcome with respect to the test subject.
             *
             * @param {object} subject - A test subject
             *
             * @returns {number[]} The predicted probability estimates.
             */
            estimate(subject) {
                const features = this.features;
                const numClass = this.classes.length;
                const estimates = Array(numClass);
                let clsIndex = numClass;
                while (clsIndex--) {
                    let p = features[0].coefficients[clsIndex];
                    let f = features.length;
                    while (--f) {
                        p += DRESS.numeric(DRESS.get(subject, features[f].feature)) * features[f].coefficients[clsIndex];
                    }
                    estimates[clsIndex] = 1 / (1 + Math.exp(-p));
                }
                return estimates;
            },
            /**
             * @summary Make a prediction based on the model
             *
             * @description This method computes the predicted outcome based on a test subject.
             *
             * @param {object} subject - A test subject
             *
             * @returns {number} The predicted outcome
             */
            predict(subject) {
                return this.classes[this.estimate(subject).reduce((max, p, i, P) => P[max] > p ? max : i, 0)];
            },
            /**
             * @summary Compute the area under the curve for a classification model.
             *
             * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
             *
             * @returns A ROC or PR curve
             */
            auc(subjects, curve = DRESS.roc) {
                return DRESS.auc(this, subjects, this.outcome, this.classes, curve);
            },
            /**
             * @summary Validating the performance of the model.
             *
             * @description This method computes the accuracy of the model based on the specified test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             *
             * @returns The performance of the model.
             */
            validate(subjects) {
                return DRESS.validate(this, subjects, this.outcome, this.classes);
            } });
    };
    /**
     * @summary Multiple linear regressions.
     *
     * @description This method builds a statistical model to predict the outcome values based on a list of features.
     * Each outcome and feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the outcome/feature.
     * If the property is not an array, then it would be converted to a numeric value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string} outcome - The outcome to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters include number of iteration (iteration), learning rate (learning), and regularization strength (regularization).
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcome (the outcome),
     *   - r2 (the R2 value of the model),
     *   - f (the F statistic of the model),
     *   - p (p-value, based on deviance),
     *   - features (an array of features containing the following properties),
     *   > - feature (the feature being considered),
     *   > - coefficient (the regression coefficient),
     *   > - t (t score),
     *   > - p (p-value),
     *   > - ci (confidence interval),
     *   > - text.
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model)
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - validate (a method for validating the regression accuracy of the model, accepts an array of subjects as a parameter).
     */
    DRESS.linear = (subjects, outcome = null, features = [], hyperparameters = {}) => {
        //    
        const XY = (subjects, outcome, features, X, Y) => {
            const numFeature = features.length;
            let i = subjects.length;
            while (i--) {
                X[i] = Array(numFeature);
                let j = numFeature;
                while (j--) {
                    X[i][j] = DRESS.numeric(DRESS.get(subjects[i], features[j]));
                }
                Y[i] = DRESS.numeric(DRESS.get(subjects[i], outcome));
            }
        };
        //
        const linear = (X, Y, outcome, features, currentCount, means, deviations, coefficients, hyperparameters) => {
            if ((X === null) || (Y === null)) {
                return null;
            }
            //
            const { iteration = Number.MAX_SAFE_INTEGER, learning = 1, regularization = 0, } = hyperparameters;
            //        
            const numRow = X.length;
            const numColumn = features.length;
            //            
            let costNull = numRow ? Y.reduce((a, b) => a + b) / numRow : 0;
            costNull = numRow ? Y.reduce((a, b) => a + (Math.pow((b - costNull), 2)), 0) : 0;
            const errors = Array(numColumn).fill(0);
            const costFull = regress(X, Y, currentCount, means, deviations, coefficients, errors, iteration, learning, regularization, (value) => (value), (expectation, prediction) => (Math.pow((expectation - prediction), 2)), (expectation, prediction) => 1);
            const mse = costFull / (numRow - numColumn);
            const f = (costNull - costFull) / (numColumn - 1) / mse;
            const r2 = 1 - costFull / costNull;
            const aic = numRow * Math.log(costFull / numRow) + 2 * numColumn;
            const p = DRESS.centralf(f, numColumn - 1, numRow - numColumn);
            //
            const padding = DRESS.longest(features);
            const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
            //
            return {
                outcome,
                count: currentCount + numRow,
                classes: null,
                r2,
                aic,
                f,
                p,
                features: coefficients.map((coefficient, c) => {
                    errors[c] *= Math.sqrt(mse);
                    const t = coefficient / errors[c];
                    const p = DRESS.studentt(t, numRow - numColumn);
                    const ci = [coefficient - zCI * errors[c], coefficient + zCI * errors[c]];
                    return {
                        feature: features[c],
                        mean: means[c],
                        deviation: deviations[c],
                        coefficient,
                        ci,
                        t,
                        p,
                        text: DRESS.pad(features[c], padding) + ': ' + DRESS.sign(DRESS.clamp(coefficient))
                            + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                            + '	t: ' + DRESS.sign(DRESS.clamp(t)) + '	p: ' + DRESS.clamp(p)
                    };
                }),
                hyperparameters,
                text: '[' + outcome + ']'
                    + '	r2: ' + DRESS.clamp(r2) + '	aic: ' + DRESS.clamp(aic) + '	f: ' + DRESS.clamp(f) + '	p: ' + DRESS.clamp(p),
            };
        };
        //        
        let X = null;
        let Y = null;
        if (Array.isArray(subjects)) {
            X = Array(subjects.length);
            Y = Array(subjects.length);
            XY(subjects, outcome, features, X, Y);
            features = ['(intercept)', ...features]; // Do NOT modify original parameters. Otherwise will break forward/backward selection.
        }
        //               
        const numFeature = features.length;
        let model = linear(X, Y, outcome, features, 0, Array(features.length).fill(0), Array(features.length).fill(0), Array(features.length).fill(0), hyperparameters);
        if (!model) {
            model = subjects;
        }
        //
        return Object.assign(Object.assign({}, model), { async: DRESS.nameof(() => DRESS.linear), 
            /**
             * @summary Fit the prepopulated X and Y arrays to the existing model.
             *
             * @param {number[][]} X
             * @param {number[]} Y
             */
            fit(X, Y) {
                const features = this.features.map(feature => feature.feature);
                const means = this.features.map(feature => feature.mean);
                const deviations = this.features.map(feature => feature.deviation);
                const coefficients = this.features.map(feature => feature.coefficient);
                //
                const model = linear(X, Y, this.outcome, features, this.count, means, deviations, coefficients, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @sumarry Train one or more subjects against the existing model.
             *
             * @param {object[]} subjects - The subjects to be processed.
             */
            train(subjects) {
                const features = this.features.map(feature => feature.feature);
                //
                let X = null;
                let Y = null;
                if (Array.isArray(subjects)) {
                    X = Array(subjects.length);
                    Y = Array(subjects.length);
                    XY(subjects, this.outcome, features.slice(1), X, Y); // Ignore intercept
                }
                //                                
                this.fit(X, Y);
            },
            /**
             * @summary Compute one or more outcome estimates based on the model.
             *
             * @description This method computes an array of outcome estimates on the model.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {number} The outcome estimates.
             */
            estimate(subject) {
                const features = this.features;
                const numFeature = features.length;
                const estimates = Array(numFeature);
                const values = Array(numFeature);
                let i = numFeature;
                while (--i) {
                    values[i] = DRESS.numeric(DRESS.get(subject, features[i].feature)) * features[i].coefficient;
                }
                //
                i = numFeature;
                while (i--) {
                    let p = features[0].coefficient;
                    let j = numFeature;
                    while (--j) {
                        p += (i === j) ? features[j].mean * features[j].coefficient : values[j];
                    }
                    estimates[i] = p;
                }
                //
                return estimates;
            },
            /**
             * @summary Make a prediction based on the model
             *
             * @description This method computes the predicted outcome based on a test subject.
             *
             * @param {object} subject - A test subject
             *
             * @returns {number} The predicted outcome
             */
            predict(subject) {
                const features = this.features;
                let p = features[0].coefficient;
                let i = features.length;
                while (--i) {
                    p += DRESS.numeric(DRESS.get(subject, features[i].feature)) * features[i].coefficient;
                }
                return p;
            },
            /**
             * @summary Compute the area under the curve for a classification model.
             *
             * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
             *
             * @returns A ROC or PR curve
             */
            auc(subjects, curve = DRESS.roc) {
                return DRESS.auc(this, subjects, this.outcome, null, curve);
            },
            /**
             * @summary Validating the performance of the model.
             *
             * @description This method computes the accuracy of the model based on the specified test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             *
             * @returns The performance of the model.
             */
            validate(subjects) {
                return DRESS.validate(this, subjects, this.outcome, null);
            } });
    };
    /**
     * @summary Eliminate highly correlated features based on the variance inflation factor (VIF).
     *
     * @description This method iteratively computes the amount of collinearity (or multicollinearity) amongst a list of features based on the variance inflation factor (VIF).
     * The method eliminates the feature with the highest VIF that is above the specified cutoff value and repeats the process.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {number} [cutoff=5] - Default cutoff VIF value is 5.
     *
     * @returns {object} A result object containing the following properties:
     *   - steps (an array of elimination steps containing the following properties),
     *   > - features (an array of features being analyzed, each containing the following properties),
     *   >> - feature (name of feature),
     *   >> - vif (the variance inflation factor),
     *   > - text,
     *   - features (the final array of features after the elimination process).
     */
    DRESS.collinearity = (subjects, features, cutoff = 5) => {
        const padding = DRESS.longest(features);
        //
        const steps = [];
        while (features.length) {
            const vifs = features.map(feature => {
                const vif = 1 / (1 - DRESS.linear(subjects, feature, features.filter(f => f !== feature)).r2 + Number.EPSILON);
                return {
                    feature,
                    vif,
                };
            }).sort((a, b) => b.vif - a.vif);
            steps.push({
                features: vifs,
                text: vifs.map(f => DRESS.pad(f.feature, padding) + ' (' + DRESS.clamp(f.vif) + ')').join(' | ')
            });
            if (vifs[0].vif > cutoff) {
                features = vifs.map(vif => vif.feature).slice(1);
            }
            else {
                break;
            }
        }
        return {
            steps,
            features,
            text: ''
        };
    };
    /**
     * @summary Apply backward elimination algorithm on a set of features.
     *
     * @description This method applies the backward elimination feature selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accepts more than one feature can be used.
     *
     * The backward elimination algorithm starts with the full model and successively eliminates feature that has a p-value less than the significance cutoff, which is specified by the global variable DRESS.SIGNIFICANCE.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string | string[]} outcomes - An outcome or an array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     *
     * @returns {object} A result object containing the following properties:
     *   - steps (an array of elimination steps containing the following properties),
     *   > - features (an array of features being analyzed, each containing the following properties),
     *   >> - feature (name of feature)
     *   >> - p (p-value),
     *   > - text,
     *   - features (the final array of features after the elimination process),
     *   - model (the final regression model).
     
     */
    DRESS.backward = (regression, subjects, outcomes, features, ...rest) => {
        const padding = DRESS.longest(features);
        //
        const steps = [];
        let model = null;
        while (true) {
            model = regression(subjects, outcomes, features, ...rest);
            // Remove intercept
            const selections = model.features.filter(f => features.indexOf(f.feature) > -1).sort((a, b) => a.p - b.p);
            steps.push({
                features: selections.map(f => ({ feature: f.feature, p: f.p })),
                text: selections.map(f => DRESS.pad(f.feature, padding) + ' (' + DRESS.clamp(f.p) + ')').join(' | ')
            });
            const selection = selections.pop();
            if (selection && selection.p > DRESS.SIGNIFICANCE) {
                features = features.filter(feature => feature !== selection.feature);
            }
            else {
                break;
            }
        }
        return {
            steps,
            features,
            model,
            text: ''
        };
    };
    /**
     * @summary Apply forward selection algorithm on a set of features.
     *
     * @description This method applies the forward selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accepts more than one feature can be used.
     *
     * The forward selection algorithm starts with the null model and successively includes new features so that the Akaike Information Criteria (AIC) of the final model is minimized.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string | string[]} outcomes - An outcome or an array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     *
     * @returns {object} A result object containing the following properties:
     *   - steps (an array of selection steps containing the following properties),
     *   > - features (the features being analyzed),
     *   > - aic (the AIC of the model at the current step),
     *   > - text,
     *   - features (the final array of features after the selection process),
     *   - model (the final regression model).
     */
    DRESS.forward = (regression, subjects, outcomes, features, ...rest) => {
        const padding = DRESS.longest(features);
        //
        const steps = [];
        const selections = [];
        let model = null;
        let aic = Number.POSITIVE_INFINITY;
        while (true) {
            const current = features.map(feature => regression(subjects, outcomes, [...selections, feature], ...rest)).sort((a, b) => b.aic - a.aic).pop();
            if (current && (current.aic < aic)) {
                model = current;
                aic = model.aic;
                const feature = model.features.find(f => features.indexOf(f.feature) > -1).feature;
                selections.push(feature);
                features = features.filter(f => f !== feature);
                steps.push({
                    features: selections,
                    aic: model.aic,
                    text: selections.map(f => DRESS.pad(f, padding)).join(' | ') + ' (' + DRESS.clamp(aic) + ')'
                });
            }
            else {
                break;
            }
        }
        return {
            steps,
            features: selections,
            model,
            text: ''
        };
    };
})(DRESS || (DRESS = {}));
