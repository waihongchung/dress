var DRESS;
(function (DRESS) {
    const doValidate = (model, folds, parameters, async = DRESS.async) => {
        return Promise.all(folds.map((_, index) => {
            // Build K models
            return async((model, folds, index, parameters) => {
                const validation = folds.splice(index, 1)[0];
                // Train the model
                model.train.call(model, [].concat(...folds));
                // Validate the model
                return model.validate.call(model, validation, ...parameters);
            }, model, folds, index, parameters);
        })).then(validations => {
            // Extract validation metrics
            const metrics = new Map();
            validations.forEach(validation => {
                Object.keys(validation).forEach(metric => {
                    if (typeof validation[metric] === 'number') {
                        if (!metrics.has(metric)) {
                            metrics.set(metric, []);
                        }
                        metrics.get(metric).push(validation[metric]);
                    }
                });
            });
            //
            const padding = DRESS.longest(Array.from(metrics.keys()));
            const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
            return Array.from(metrics).map(([metric, values]) => {
                const [mean, , , , error] = DRESS.moments(values);
                const ci = [mean - zCI * error, mean + zCI * error];
                return {
                    metric,
                    mean,
                    ci,
                    text: DRESS.pad(metric, padding) + ': ' + DRESS.clamp(mean) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                };
            });
        });
    };
    /**
     * @summary Permutation feature importances.
     *
     * @description This method computes the relative importance of each feature by randomly permuting the feature values, which breaks the relationship between the feature and the true outcome.
     * A feature is considered important if the permutation process increases the model error because this implies that the model relied on the feature for the prediction.
     *
     * * Note this is an asynchronous operation.
     *
     * @param {any} model - The model to be analyzed. Any regression or classification model that contains the method 'validate' is supported.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} [parameters=[]] - An array of parameters to be passed to the algorithm to 'validate' function of the model.
     * @param {number} [k=5] - The number of folds. The default is 5.
     * @param {any} [async=DRESS.async] - The asynchronous operator. The default is DRESS.async.
     *
     * @returns A Promise that can be resolved to a result object containing the following properties:
     *   - seed (the randomly generated seed),
     *   - features: (an array of features, each containing the following parameters),
     *   > - feature (the name of the feature),
     *   > - importance (the average feature importance),
     *   > - ci (the confidence interval of the feature importance),
     *   > - relative (the relative average feature importance),
     *   > - text.
     *   - text.
     */
    DRESS.importances = (model, subjects, parameters = [], k = 5, async = DRESS.async) => {
        model = Object.assign({}, model); // Create a shallow copy of the model to preserve the model's methods
        //
        const seed = DRESS.SEED;
        //
        const features = (model['features'] || []).concat(model['numericals'] || []).concat(model['categoricals'] || []);
        const padding = DRESS.longest(features);
        //
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        return Promise.all(features.map(feature => {
            // Create copy of the original values
            const numSubject = subjects.length;
            const values = Array(numSubject);
            let i = numSubject;
            while (i--) {
                values[i] = DRESS.get(subjects[i], feature);
            }
            // Compute based and permutated validations
            return async((model, subjects, parameters, values, feature, k) => {
                const validations = [model.validate.call(model, subjects, ...parameters)]; // base
                const numSubject = subjects.length;
                while (k--) {
                    // Permutate feature values    
                    let i = numSubject;
                    while (i--) {
                        DRESS.set(subjects[i], feature, values[DRESS.randi(numSubject)]);
                    }
                    validations.push(model.validate.call(model, subjects, ...parameters)); // permutations
                }
                return validations;
            }, model, subjects, parameters, values, feature, k).then(validations => {
                const base = validations.shift(); // First one is base.
                const metric = (typeof base['accuracy'] === 'number') ? 'accuracy' : 'r2';
                const metrics = validations.map(validation => base[metric] - validation[metric]);
                const [importance, , , , error] = DRESS.moments(metrics);
                const ci = [importance - zCI * error, importance + zCI * error];
                //
                return {
                    feature,
                    importance,
                    ci,
                    relative: 0,
                    text: DRESS.pad(feature, padding) + ': ' + DRESS.clamp(importance) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                };
            });
        })).then(features => {
            const sum = features.reduce((sum, feature) => sum + feature.importance, 0) + Number.EPSILON;
            features.forEach(feature => {
                feature.relative = feature.importance / sum;
                feature.text += '	[' + DRESS.clamp(feature.relative * 100) + '%]';
            });
            return {
                seed,
                features: features.sort((a, b) => b.importance - a.importance),
                text: 'seed: ' + seed
            };
        });
    };
    /**
     * @summary K-fold cross validation.
     *
     * @description This method performs a k-fold cross-validation procedure based on the specified algorithm and the specified subjects.
     * The subjects are split into k groups; a model is created using k-1 groups as training data, while the remaining 1 group is used as validation data.
     * The process is repeated until each group has been used as validation once. The average performance across all models is reported.
     *
     * * Note this is an asynchronous operation.
     *
     * @param {Algorithm} algorithm - The algorithm used to create the models.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} training - An array of parameters to be passed to the algorithm to train a model.
     * @param {any[]} validating - An array of parameters to be passed to the algorithm to 'validate' function of the model.
     * @param {number} [k=5] - The number of folds. Default is 5.
     * @param {any} [async=DRESS.async] - The asynchronous operator. The default is DRESS.async.
     *
     * @returns A result object containing the following properties:
     *   - seed (the randomly generated seed),
     *   - metrics (an array of performance metrics, each with the following properties)
     *   > - metric (the name of the performance metric),
     *   > - mean (the mean model performance),
     *   > - ci (the confidence interval of the model performance),
     *   > - text.
     *   - text.
     */
    DRESS.crossValidate = (algorithm, subjects, training = [], validating = [], k = 5, async = DRESS.async) => {
        const seed = DRESS.SEED;
        // Split subjects into k folds
        subjects = DRESS.shuffle(subjects.slice()); // Create a shallow copy and shuffle
        const numSubject = subjects.length;
        const size = (numSubject - (numSubject % k)) / k; // Size of each fold
        const folds = Array(k).fill(null).map((_, index) => subjects.slice(index * size, (index + 1) * size));
        DRESS.SEED = seed;
        // Create an empty model by calling the algorithm on an empty training set.
        const model = algorithm.call(null, [], ...training);
        // Perform cross validation
        return doValidate(model, folds, validating, async).then(metrics => ({
            seed,
            metrics,
            text: 'seed: ' + seed
        }));
    };
    /**
     * @summary Automatic Hyperparameter Tuning
     *
     * @description This method performs hyperparameter optimization using a grid search approach with early stopping.
     * Internally, the method uses the crossValidate method to compute the resulting model's performance. The method iteratively alters the specified hyperparameters until there is no further increase in the model's performance.
     * Note it is possible for the method to be trapped in a local maxima. This can be avoided by varying the order in which the hyperparameters are specified.
     *
     * @param {object} initial - The starting hyperparameter values.
     * @param {object} eventual - The stopping hyperparameter values. Only specify hyperparameters that need to be optimized.
     * @param {string} metric - The performance metric based on which hyperparameter optimization is performed.
     * @param {Algorithm} algorithm - The algorithm used to create the models.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} training - One or more parameters to be passed to the algorithm to train a model.
     * @param {any[]} validating - One or more parameters to be passed to the algorithm to 'validate' function of the model.
     * @param {number} [k=5] - The number of folds used in cross-validation. Default is 5.
     * @param {number} [p=5] - The number of intervals between the starting and stopping values. Default is 5.
     * @param {any} [async=DRESS.async] - The asynchronous operator. The default is DRESS.async.
     *
     */
    DRESS.hyperparameters = (initial, eventual, metric, algorithm, subjects, training = [], validating = [], k = 5, p = 5, async = DRESS.async) => {
        const seed = DRESS.SEED;
        // Split subjects into k folds
        subjects = DRESS.shuffle(subjects.slice()); // Create a shallow copy and shuffle
        const numSubject = subjects.length;
        const size = (numSubject - (numSubject % k)) / k;
        const folds = Array(k).fill(null).map((_, index) => subjects.slice(index * size, (index + 1) * size));
        // Identify tunable hyperparameters
        const tunables = [];
        Object.keys(eventual).forEach(name => {
            if ((initial[name] !== null) && (eventual[name] !== null) && (typeof initial[name] !== 'undefined') && (eventual[name] !== initial[name])) {
                const interval = (eventual[name] - initial[name]) / p;
                tunables.push([name, Array(p + 1).fill(initial[name]).map((value, index) => index * interval + value)]);
            }
        });
        // Tune one tunable hyperparameter
        const hyperparameters = (currentHyperparameters, metric, algorithm, folds, training, validating, k, seed, tunables, tunableIndex, tunedCount, steps) => {
            const numTunable = tunables.length;
            if (tunedCount < numTunable) {
                // Get the next tunable hyperparameters
                const [name, values] = tunables[tunableIndex < numTunable ? tunableIndex : (tunableIndex = 0)];
                // Get the current performance from the last step
                let currentPerformance = (steps.length) ? steps[steps.length - 1].performance : null;
                // Save the current hyperparameter value
                let currentValue = (currentPerformance !== null) ? currentHyperparameters[name] : null;
                // Perform corss validations
                return Promise.all(values.map(value => {
                    currentHyperparameters[name] = value;
                    //
                    DRESS.SEED = seed;
                    // Create an empty model by calling the algorithm on an empty training set.
                    const model = algorithm.call(null, [], ...training);
                    // Set the model's hyperparameters.
                    model.hyperparameters = currentHyperparameters;
                    //
                    return (value !== currentValue) ?
                        doValidate(model, folds, validating, async).then(metrics => metrics.find(m => m.metric === metric) || metrics.shift()) :
                        currentPerformance;
                })).then(performances => {
                    // Reset hyperparameter back to current value
                    currentHyperparameters[name] = currentValue;
                    // Find top performing hyperparameter value
                    performances.forEach((performance, index) => {
                        if ((currentPerformance === null) || (performance.mean > currentPerformance.mean)) {
                            currentPerformance = performance;
                            // Update hyperparameter to the top performing value
                            currentHyperparameters[name] = values[index];
                        }
                    });
                    // If the top performing hyperparameter value is changed
                    if (currentValue !== currentHyperparameters[name]) {
                        steps.push({
                            hyperparameters: Object.assign({}, currentHyperparameters), // clone current hyperparameters
                            performance: currentPerformance,
                            text: tunables.map(([name,]) => name + ' = ' + currentHyperparameters[name]).join('	'),
                        });
                        tunedCount = 0;
                    }
                    // Tune the next tunable hyperparameters
                    return hyperparameters(currentHyperparameters, metric, algorithm, folds, training, validating, k, seed, tunables, tunableIndex + 1, tunedCount + 1, steps);
                });
            }
            return Promise.resolve({
                seed,
                steps,
                text: 'seed: ' + seed
            });
        };
        return hyperparameters(Object.assign({}, initial), metric, algorithm, folds, training, validating, k, seed, tunables, 0, 0, []);
    };
})(DRESS || (DRESS = {}));
