var DRESS;
(function (DRESS) {
    /**
     * @ignore
     */
    let features = (subject, numericals, categoricals) => [
        ...numericals.map(numerical => DRESS.numeric(DRESS.get(subject, numerical))),
        ...categoricals.map(categorical => DRESS.categoric(DRESS.get(subject, categorical)))
    ];
    /**
     * @ignore
     */
    let gini = (rows, column) => {
        const length = rows.length;
        if (length) {
            const counts = new Map();
            let i = length;
            while (i--) {
                const value = rows[i][column];
                counts.set(value, (counts.get(value) || 0) + 1);
            }
            return 1 - Array.from(counts.values()).reduce((gini, count) => gini + (count / length) * (count / length), 0);
        }
        return 0;
    };
    /**
     * @ignore
     */
    let mse = (rows, column) => {
        const length = rows.length;
        if (length) {
            let mean = 0;
            let mse = 0;
            for (let i = 0; i < length; i++) {
                const value = rows[i][column];
                const delta = value - mean;
                mean += delta / (i + 1);
                mse += delta * (value - mean);
            }
            return mse / length;
        }
        return 0;
    };
    /**
     * @ignore
     */
    let split = (rows, feature, cutoff, numerical, outcome, classification) => {
        const length = rows.length;
        const queue = new Array(length);
        let split = 0;
        let i = length;
        while (i--) {
            if (numerical ? (rows[i][feature] < cutoff) : (rows[i][feature] === cutoff)) {
                queue[split++] = rows[i];
            }
            else {
                queue[i + split] = rows[i];
            }
        }
        const left = queue.slice(0, split);
        const right = queue.slice(split);
        const leftImpurity = classification ? gini(left, outcome) : mse(left, outcome);
        const rightImpurity = classification ? gini(right, outcome) : mse(right, outcome);
        return [
            left,
            leftImpurity,
            right,
            rightImpurity,
            (left.length * leftImpurity + right.length * rightImpurity) / length
        ];
    };
    /**
     * @ignore
     */
    let vote = (row, numNumerical, trees, classification) => {
        const numTree = trees.length;
        const votes = new Array(numTree);
        let i = numTree;
        while (i--) {
            let node = trees[i];
            while (true) {
                const descendent = ((node.feature < numNumerical) ? (row[node.feature] < node.cutoff) : (row[node.feature] === node.cutoff)) ? node.left : node.right;
                if (Array.isArray(descendent)) {
                    votes[i] = classification ? DRESS.mode(descendent) : DRESS.mean(descendent);
                    break;
                }
                else {
                    node = descendent;
                }
            }
        }
        return votes;
    };
    /**
     * @ignore
     */
    let stump = (rows, features, numNumerical, outcome, classification, impurity, depth, maxDepth, minSize) => {
        const NUM_TRIES = 10;
        const numRow = rows.length;
        if ((impurity > 0) && (numRow > minSize) && (depth < maxDepth)) {
            let feature;
            let optimalCutoff;
            let optimalParts = [null, null, null, null, Number.POSITIVE_INFINITY];
            let retries = NUM_TRIES;
            while ((retries--) && (optimalParts[4] >= impurity)) {
                feature = features[DRESS.randi(features.length)];
                const numerical = (feature < numNumerical);
                optimalCutoff = null;
                let tries = NUM_TRIES;
                while (tries--) {
                    let cutoff;
                    if (numerical) {
                        cutoff = DRESS.random();
                        cutoff = rows[DRESS.randi(numRow)][feature] * cutoff + rows[DRESS.randi(numRow)][feature] * (1 - cutoff);
                    }
                    else {
                        cutoff = rows[DRESS.randi(numRow)][feature];
                    }
                    if (cutoff !== optimalCutoff) {
                        const parts = split(rows, feature, cutoff, numerical, outcome, classification);
                        if (parts[0].length && parts[2].length && (parts[4] < optimalParts[4])) {
                            optimalCutoff = cutoff;
                            optimalParts = parts;
                        }
                    }
                }
            }
            if (optimalParts[4] < impurity) {
                return {
                    feature,
                    cutoff: optimalCutoff,
                    impurity: optimalParts[4],
                    left: stump(optimalParts[0], features, numNumerical, outcome, classification, optimalParts[1], depth + 1, maxDepth, minSize),
                    right: stump(optimalParts[2], features, numNumerical, outcome, classification, optimalParts[3], depth + 1, maxDepth, minSize),
                };
            }
        }
        return rows.map(row => row[outcome]);
    };
    /**
     * @summary Build a Random Forest model
     *
     * @description This method builds a random forest model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * Internally, this method implements the extremely randomized tree (ExtraTrees) algorithm instead of the true random forest algorithm in order to reduce computational complexity.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=true] - Model type. Default to classification. Set to false to build a regression model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minSize, maxDepth, numTree, and samplingRate.
     * @returns {object} A random forest model containing the following properties:
     *   seed (the random generate seed value),
     *   outcome (the outcome of the model),
     *   numericals (the numerical features used to create the model),
     *   categoricals (the categorical features used to create the model),
     *   classes (a list of distinct classes, only available in a classification model),
     *   trees (an array of decision trees),
     *   impurity (the overall impurity of the model),
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects as a parameter),
     *   importance (a method for reporting feature importance).
     */
    DRESS.randomForest = (subjects, outcome, numericals, categoricals, classification = true, hyperparameters = {}) => {
        const minSize = hyperparameters.size || (classification ? 1 : 5);
        const maxDepth = hyperparameters.depth || 10;
        const numTree = hyperparameters.trees || 100;
        const samplingRate = hyperparameters.sampling || 0;
        let seed;
        let trees;
        let impurity;
        let classes;
        if (Array.isArray(subjects)) {
            seed = DRESS.SEED;
            const rows = new Array(subjects.length);
            classes = [];
            if (classification) {
                subjects.map((subject, index) => {
                    const value = DRESS.categoric(DRESS.get(subject, outcome));
                    let cls = classes.indexOf(value);
                    if (cls === -1) {
                        cls = classes.push(value) - 1;
                    }
                    rows[index] = [...features(subject, numericals, categoricals), cls];
                });
            }
            else {
                subjects.map((subject, index) => {
                    rows[index] = [...features(subject, numericals, categoricals), DRESS.numeric(DRESS.get(subject, outcome))];
                });
            }
            const numNumerical = numericals.length;
            const numColumn = numNumerical + categoricals.length;
            trees = [];
            impurity = classification ? gini(rows, numColumn) : mse(rows, numColumn);
            const numFeature = (samplingRate === 0) ? Math.ceil(Math.sqrt(numColumn)) : Math.ceil(samplingRate * numColumn);
            while (trees.length < numTree) {
                const columns = [...Array(numColumn).keys()].sort(_ => DRESS.random() - 0.5).slice(-numFeature);
                const tree = stump(rows, columns, numNumerical, numColumn, classification, impurity, 0, maxDepth, minSize);
                if (!Array.isArray(tree)) {
                    trees.push(tree);
                }
            }
        }
        else {
            seed = subjects['seed'] || 0;
            outcome = subjects['outcome'] || '';
            numericals = subjects['numericals'] || [];
            categoricals = subjects['categoricals'] || [];
            classes = subjects['classes'] || [];
            trees = subjects['trees'] || [];
            impurity = subjects['impurity'] || 0;
        }
        return {
            seed,
            outcome,
            numericals,
            categoricals,
            classes,
            trees,
            impurity,
            text: '[' + outcome + '] seed: ' + seed,
            predict(subject) {
                const classification = this.classes.length;
                const votes = vote(features(subject, this.numericals, this.categoricals), this.numericals.length, this.trees, classification);
                return classification ? this.classes[DRESS.mode(votes)] : DRESS.mean(votes);
            },
            roc(subjects, roc = DRESS.roc) {
                if (this.classes.length) {
                    const numSubject = subjects.length;
                    const numNumerical = this.numericals.length;
                    const expectations = new Array(numSubject);
                    const votes = new Array(numSubject);
                    subjects.map((subject, index) => {
                        expectations[index] = DRESS.categoric(DRESS.get(subject, this.outcome));
                        votes[index] = vote(features(subject, this.numericals, this.categoricals), numNumerical, this.trees, true);
                    });
                    return this.classes.map((cls, clsIndex) => {
                        const predictions = new Array(numSubject);
                        expectations.map((expectation, index) => {
                            predictions[index] = [(expectation === cls) ? 1 : 0, votes[index].filter(vote => vote === clsIndex).length / votes[index].length];
                        });
                        return roc({ predictions }, [cls], ['randomForest']);
                    });
                }
                return null;
            },
            performance(subjects) {
                const numNumerical = this.numericals.length;
                if (this.classes.length) {
                    return DRESS.accuracies(subjects.map(subject => [
                        DRESS.categoric(DRESS.get(subject, this.outcome)),
                        this.classes[DRESS.mode(vote(features(subject, this.numericals, this.categoricals), numNumerical, this.trees, true))]
                    ]));
                }
                else {
                    return DRESS.errors(subjects.map(subject => [
                        DRESS.numeric(DRESS.get(subject, this.outcome)),
                        DRESS.mean(vote(features(subject, this.numericals, this.categoricals), numNumerical, this.trees, false))
                    ]));
                }
            },
            importance() {
                const features = this.numericals.concat(this.categoricals);
                const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
                let gain = (node, impurity) => {
                    informationGain.set(node.feature, (informationGain.get(node.feature) || 0) + impurity - node.impurity);
                    if (!Array.isArray(node.left)) {
                        gain(node.left, node.impurity);
                    }
                    if (!Array.isArray(node.right)) {
                        gain(node.right, node.impurity);
                    }
                };
                const informationGain = new Map();
                this.trees.map((tree) => {
                    gain(tree, this.impurity);
                });
                return Array.from(informationGain).sort((a, b) => b[1] - a[1]).map(([index, value]) => {
                    return {
                        feature: features[index],
                        value,
                        text: DRESS.padEnd(features[index], pad) + ': ' + DRESS.clamp(value)
                    };
                });
            }
        };
    };
    /**
     * @summary Build a Stochastic Gradient Boosting model
     *
     * @description This method builds a stochastic gradient boosting model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=true] - Model type. Default to classification. Set to false to build a regression model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minSize, maxDepth, numTree, samplingRate, and learningRate.
     * @returns {object} A random forest model containing the following properties:
     *   seed (the random generate seed value),
     *   outcome (the outcome of the model),
     *   numericals (the numerical features used to create the model),
     *   categoricals (the categorical features used to create the model),
     *   classes (a list of distinct classes, only available in a classification model),
     *   trees (an array of decision trees),
     *   impurities (an array of impurity values used for computing feature importance),
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects as a parameter),
     *   importance (a method for reporting feature importance).
     */
    DRESS.gradientBoosting = (subjects, outcome, numericals, categoricals, classification = true, hyperparameters = {}) => {
        const minSize = hyperparameters.size || (classification ? 1 : 5);
        const maxDepth = hyperparameters.depth || 3;
        const numTree = hyperparameters.trees || (classification ? 50 : 100);
        const samplingRate = hyperparameters.sampling || 0.75;
        const learningRate = hyperparameters.learning || 0.2;
        let seed;
        let trees;
        let impurities;
        let classes;
        if (Array.isArray(subjects)) {
            seed = DRESS.SEED;
            const numSubject = subjects.length;
            const rows = new Array(numSubject);
            classes = [];
            if (classification) {
                subjects.map((subject, index) => {
                    const value = DRESS.categoric(DRESS.get(subject, outcome));
                    let cls = classes.indexOf(value);
                    if (cls === -1) {
                        cls = classes.push(value) - 1;
                    }
                    rows[index] = [...features(subject, numericals, categoricals), 0, 0, cls];
                });
            }
            else {
                subjects.map((subject, index) => {
                    const value = DRESS.numeric(DRESS.get(subject, outcome));
                    rows[index] = [...features(subject, numericals, categoricals), value * learningRate, value];
                });
            }
            const numNumerical = numericals.length;
            const numColumn = numNumerical + categoricals.length;
            const numColumn_1 = numColumn + 1;
            const columns = [...Array(numColumn).keys()];
            let fit = (rows) => {
                const trees = [];
                const impurities = [mse(rows, numColumn)];
                while ((trees.length < numTree) && (impurities[trees.length] > 0)) {
                    const start = DRESS.randi(numSubject);
                    const end = Math.floor(start + numSubject * samplingRate);
                    const section = (end > numSubject) ? rows.slice(start, numSubject).concat(rows.slice(0, numSubject - end)) : rows.slice(start, end);
                    const tree = stump(section, columns, numNumerical, numColumn, false, impurities[trees.length], 0, maxDepth, minSize);
                    if (!Array.isArray(tree)) {
                        trees.push(tree);
                        let i = rows.length;
                        while (i--) {
                            rows[i][numColumn_1] -= DRESS.sum(vote(rows[i], numNumerical, [tree], false));
                            rows[i][numColumn] = rows[i][numColumn_1] * learningRate;
                        }
                        impurities.push(mse(rows, numColumn));
                    }
                }
                return [trees, impurities];
            };
            trees = [];
            impurities = [];
            if (classification) {
                classes.map((cls, index) => {
                    rows.map(row => row[numColumn] = (row[numColumn_1] = (row[numColumn_1 + 1] === index) ? 1 : 0) * learningRate);
                    const model = fit(rows);
                    trees[index] = model[0];
                    impurities[index] = model[1];
                });
            }
            else {
                const model = fit(rows);
                trees.push(model[0]);
                impurities.push(model[1]);
            }
        }
        else {
            seed = subjects['seed'] || 0;
            outcome = subjects['outcome'] || '';
            numericals = subjects['numericals'] || [];
            categoricals = subjects['categoricals'] || [];
            classes = subjects['classes'] || [];
            trees = subjects['trees'] || [];
            impurities = subjects['impurities'] || [];
        }
        return {
            seed,
            outcome,
            numericals,
            categoricals,
            classes,
            trees,
            impurities,
            text: '[' + outcome + '] seed: ' + seed,
            predict(subject) {
                if (this.classes.length) {
                    return this.classes.map((cls, index) => [cls, DRESS.sum(vote(features(subject, this.numericals, this.categoricals), this.numericals.length, this.trees[index], false))])
                        .sort((a, b) => a[1] - b[1]).pop()[0];
                }
                else {
                    return DRESS.sum(vote(features(subject, this.numericals, this.categoricals), this.numericals.length, this.trees[0], false));
                }
            },
            roc(subjects, roc = DRESS.roc) {
                if (this.classes.length) {
                    const numSubject = subjects.length;
                    const numNumerical = this.numericals.length;
                    const expectations = new Array(numSubject);
                    const votes = new Array(numSubject);
                    subjects.map((subject, index) => {
                        expectations[index] = DRESS.categoric(DRESS.get(subject, this.outcome));
                        votes[index] = this.classes.map((cls, clsIndex) => DRESS.sum(vote(features(subject, this.numericals, this.categoricals), numNumerical, this.trees[clsIndex], false)));
                    });
                    return this.classes.map((cls, clsIndex) => {
                        const predictions = new Array(numSubject);
                        expectations.map((expectation, index) => {
                            predictions[index] = [(expectation === cls) ? 1 : 0, votes[index][clsIndex]];
                        });
                        return roc({ predictions }, [cls], ['gradientBoosting']);
                    });
                }
                return null;
            },
            performance(subjects) {
                if (this.classes.length) {
                    return DRESS.accuracies(subjects.map(subject => [
                        DRESS.categoric(DRESS.get(subject, this.outcome)),
                        this.predict(subject)
                    ]));
                }
                else {
                    return DRESS.errors(subjects.map(subject => [
                        DRESS.numeric(DRESS.get(subject, this.outcome)),
                        this.predict(subject)
                    ]));
                }
            },
            importance() {
                const features = this.numericals.concat(this.categoricals);
                const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
                let gain = (node, impurity) => {
                    informationGain.set(node.feature, (informationGain.get(node.feature) || 0) + impurity - node.impurity);
                    if (!Array.isArray(node.left)) {
                        gain(node.left, node.impurity);
                    }
                    if (!Array.isArray(node.right)) {
                        gain(node.right, node.impurity);
                    }
                };
                const informationGain = new Map();
                let trees = [];
                let impurities = [];
                if (this.classes.length) {
                    let i = this.classes.length;
                    while (i--) {
                        trees = trees.concat(this.trees[i]);
                        impurities = impurities.concat(this.impurities[i]);
                    }
                }
                else {
                    trees = this.trees[0];
                    impurities = this.impurities[0];
                }
                trees.map((tree, index) => {
                    gain(tree, impurities[index]);
                });
                return Array.from(informationGain).sort((a, b) => b[1] - a[1]).map(([index, value]) => {
                    return {
                        feature: features[index],
                        value,
                        text: DRESS.padEnd(features[index], pad) + ': ' + DRESS.clamp(value)
                    };
                });
            }
        };
    };
})(DRESS || (DRESS = {}));
