var DRESS;
(function (DRESS) {
    /**
     * @summary Permutation feature importance.
     *
     * @description This method computes the relative importance of each feature by randomly permuting the feature values, which breaks the relationship between the feature and the true outcome.
     * A feature is considered important if the permutation process increases the model error, because in this implies that the model relied on the feature for the prediction.
     *
     * @param {any} model - The model to be analyzed. Any regression or classification model that contains the method 'performance' is supported.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} parameters - One or more parameters to be passed to the algorithm to 'performance' function of the model.
     * @returns An array of features used by the model. For each feature, the following parameters are returned:
     *   feature (the name of the feature),
     *   mean (the average feature importance).
     *   ci (the confidence interval of the feature importance),
     *   text.
     */
    DRESS.importance = (model, subjects, ...parameters) => {
        const numFold = 5;
        const features = (model['features'] || []).concat(model['numericals'] || []).concat(model['categoricals'] || []);
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const numSubject = subjects.length;
        //        
        const performance = model.performance.apply(model, [subjects, ...parameters]);
        const measure = (typeof performance['accuracy'] === 'number') ? 'accuracy' : 'r2';
        const base = performance[measure];
        //
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return features.map(feature => {
            const originals = new Array(numSubject);
            let i = numSubject;
            while (i--) {
                originals[i] = DRESS.get(subjects[i], feature);
            }
            //
            const metrics = new Array(numFold);
            let j = numFold;
            while (j--) {
                i = numSubject;
                while (i--) {
                    DRESS.set(subjects[i], feature, originals[DRESS.randi(numSubject)]);
                }
                metrics[j] = base - model.performance.apply(model, [subjects, ...parameters])[measure];
            }
            //
            let mean = 0;
            let se = 0;
            metrics.map((metric, index) => {
                const delta = (metric - mean);
                mean += delta / (index + 1);
                se += delta * (metric - mean);
            });
            se = Math.sqrt(se) / metrics.length;
            const ci = [mean - zCI * se, mean + zCI * se];
            //
            i = numSubject;
            while (i--) {
                DRESS.set(subjects[i], feature, originals[i]);
            }
            return {
                feature,
                mean,
                ci,
                text: DRESS.padEnd(feature, pad) + ': ' + DRESS.clamp(mean) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
            };
        }).sort((a, b) => b.mean - a.mean);
    };
    /**
     * @summary K-Fold Cross Validation
     *
     * @description This method performs a 5-fold cross validation procedure based on the specified algorithm and the specified subjects.
     * The subjects are split into 5 groups; a model is created using 4 of the 5 groups are used as training data, while the remaining 1 group is used as validation data.
     * The process is repeated until each group has been used as validation once. The average performance across all 5 models is reported.
     *
     * @param {string} algorithm - The name of the algorithm used to create the models.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} parameters - One or more parameters to be passed to the algorithm to create a model.
     * @param {any[]} parameters2 - One or more parameters to be passed to the algorithm to 'performance' function of the model.
     * @returns A result object containing the following properties:
     *   seed (the random generate seed),
     *   measure (the statistical measure used to determine a model's performance, either accuracy for classification models or R2 for regression models),
     *   mean (the average model performance).
     *   ci (the confidence interval of the model performance),
     *   text.
     */
    DRESS.crossValidate = (algorithm, subjects, parameters = [], parameters2 = []) => {
        const seed = DRESS.SEED;
        const numFold = 5;
        //
        const folds = new Array(numFold).fill(null).map(_ => []);
        let sequences = [...Array(numFold).keys()].sort(_ => DRESS.random() - 0.5);
        let i = subjects.length;
        let j = numFold;
        while (i--) {
            folds[sequences[--j]].push(subjects[i]);
            if (j === 0) {
                sequences.sort(_ => DRESS.random() - 0.5);
                j = numFold;
            }
        }
        let measure;
        const metrics = [];
        i = numFold;
        while (i--) {
            DRESS.SEED = seed;
            const validation = folds.pop();
            const training = folds.reduce((folds, fold) => folds.concat(fold));
            const model = algorithm.apply(null, [training, ...parameters]);
            const performance = model.performance.apply(model, [validation, ...parameters2]);
            measure = (typeof performance['accuracy'] === 'number') ? 'accuracy' : 'r2';
            metrics.push(performance[measure]);
            folds.unshift(validation);
        }
        let mean = 0;
        let se = 0;
        metrics.map((metric, index) => {
            const delta = (metric - mean);
            mean += delta / (index + 1);
            se += delta * (metric - mean);
        });
        se = Math.sqrt(se) / metrics.length;
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        const ci = [mean - zCI * se, mean + zCI * se];
        return {
            seed,
            measure,
            mean,
            ci,
            text: measure + ' : ' + DRESS.clamp(mean) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')	seed: ' + seed
        };
    };
    /**
     * @summary Automatic Hyperparameter Tuning
     *
     * @description This method simplifies the hyperparameter tuning process by automatically testing a range of hyperparameter values.
     *
     */
    DRESS.hypertune = (hyperparameters, properties, intervals, stops, algorithm, subjects, ...parameters) => {
        const seed = DRESS.SEED;
        if (properties.length !== intervals.length) {
            return null;
        }
        properties.map((property, index) => {
            if (typeof hyperparameters[property] === 'undefined') {
                hyperparameters[property] = intervals[index];
            }
        });
        //
        const hp = JSON.parse(JSON.stringify(hyperparameters));
        let changed = true;
        let performance = null;
        while (changed) {
            changed = false;
            properties.map((property, index) => {
                const performances = new Map();
                const current = hp[property];
                hp[property] = hyperparameters[property];
                let i = stops;
                while (i--) {
                    DRESS.SEED = seed;
                    performances.set(hp[property], DRESS.crossValidate(algorithm, subjects, ...parameters, hp));
                    hp[property] += intervals[index];
                }
                performance = Array.from(performances).sort(([, a], [, b]) => a.mean - b.mean).pop();
                changed || (changed = performance[0] !== current);
                hp[property] = performance[0];
            });
        }
        return {
            hyperparameters: hp,
            performance: performance[1],
            text: properties.map(property => property + ' = ' + hp[property]).join('	'),
        };
    };
})(DRESS || (DRESS = {}));
