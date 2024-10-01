var DRESS;
(function (DRESS) {
    /**
     * @ignore
     */
    const gini = (rows, column) => {
        const length = rows.length;
        if (length) {
            const counts = new Map();
            let i = length;
            while (i--) {
                const value = rows[i][column];
                counts.set(value, (counts.get(value) || 0) + 1);
            }
            let gini = 0;
            counts.forEach(count => gini += Math.pow((count / length), 2));
            return 1 - gini;
        }
        return 0;
    };
    /**
     * @ignore
     */
    const mse = (rows, column) => {
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
    const split = (rows, feature, numNumerical, outcome, classification, cutoff) => {
        const isNumerical = feature < numNumerical;
        let leftPointer = -1;
        let rightPointer = rows.length - 1;
        while (leftPointer !== rightPointer) {
            if (isNumerical ? (rows[rightPointer][feature] < cutoff) : (rows[rightPointer][feature] === cutoff)) {
                const row = rows[++leftPointer];
                rows[leftPointer] = rows[rightPointer];
                rows[rightPointer] = row;
            }
            else {
                rightPointer--;
            }
        }
        const leftBranch = rows.slice(0, ++leftPointer);
        const rightBranch = rows.slice(leftPointer);
        const leftImpurity = classification ? gini(leftBranch, outcome) : mse(leftBranch, outcome);
        const rightImpurity = classification ? gini(rightBranch, outcome) : mse(rightBranch, outcome);
        return [
            leftBranch,
            rightBranch,
            leftImpurity,
            rightImpurity,
            (leftBranch.length * leftImpurity + rightBranch.length * rightImpurity) / rows.length
        ];
    };
    /**
     * @ignore
     */
    const sprout = (rows, features, numNumerical, outcome, classification, impurity, depth, maxDepth, minSize, maxAttempt) => {
        const length = rows.length;
        if ((impurity > 0) && (length > minSize) && (depth < maxDepth)) {
            let optimalFeature;
            let optimalCutoff;
            let optimalBranch = [null, null, null, null, Number.POSITIVE_INFINITY];
            let reAttempts = ~~(maxAttempt);
            while ((reAttempts--) && (optimalBranch[4 /* BRANCH.IMPURITY */] >= impurity)) {
                let feature = features[DRESS.randi(features.length)];
                let attempts = ~~(maxAttempt);
                while (attempts--) {
                    let cutoff;
                    if (feature < numNumerical) {
                        cutoff = DRESS.rand();
                        cutoff = rows[DRESS.randi(length)][feature] * cutoff + rows[DRESS.randi(length)][feature] * (1 - cutoff);
                    }
                    else {
                        cutoff = rows[DRESS.randi(length)][feature];
                    }
                    if (cutoff !== optimalCutoff) {
                        const branch = split(rows, feature, numNumerical, outcome, classification, cutoff);
                        if (branch[0 /* BRANCH.LEFT */].length && branch[1 /* BRANCH.RIGHT */].length && (branch[4 /* BRANCH.IMPURITY */] < optimalBranch[4 /* BRANCH.IMPURITY */])) {
                            optimalFeature = feature;
                            optimalCutoff = cutoff;
                            optimalBranch = branch;
                        }
                    }
                }
            }
            if (optimalBranch[4 /* BRANCH.IMPURITY */] < impurity) {
                return [
                    optimalFeature,
                    optimalCutoff,
                    optimalBranch[4 /* BRANCH.IMPURITY */],
                    sprout(optimalBranch[0 /* BRANCH.LEFT */], features, numNumerical, outcome, classification, optimalBranch[2 /* BRANCH.LEFT_IMPURITY */], depth + 1, maxDepth, minSize, maxAttempt),
                    sprout(optimalBranch[1 /* BRANCH.RIGHT */], features, numNumerical, outcome, classification, optimalBranch[3 /* BRANCH.RIGHT_IMPURITY */], depth + 1, maxDepth, minSize, maxAttempt)
                ];
            }
        }
        return fruit(rows, outcome, classification, impurity);
    };
    /**
     * @ignore
     */
    const fruit = (rows, outcome, classification, impurity) => {
        const values = rows.map(row => row[outcome]);
        return [-1, classification ? DRESS.mode(values) : DRESS.mean(values), impurity, null, null];
    };
    /**
     * @ignore
     */
    const harvest = (row, numNumerical, trees) => {
        return trees.map(tree => {
            while (true) {
                tree = (((tree[0 /* TREE.FEATURE */] < numNumerical) ? (row[tree[0 /* TREE.FEATURE */]] < tree[1 /* TREE.CUTOFF */]) : (row[tree[0 /* TREE.FEATURE */]] === tree[1 /* TREE.CUTOFF */])) ? tree[3 /* TREE.LEFT */] : tree[4 /* TREE.RIGHT */]);
                if (Array.isArray(tree)) {
                    if (tree[0 /* TREE.FEATURE */] === -1) {
                        return tree[1 /* TREE.CUTOFF */]; // mean or mode
                    }
                }
                else {
                    return null;
                }
            }
        });
    };
    /**
     * @summary Build a Random Forest model
     *
     * @description This method builds a random forest model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation. An outcome cannot be an array.
     *
     * Internally, this method implements the extremely randomized tree (ExtraTrees) algorithm instead of the true random forest algorithm to reduce computational complexity.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minimal node size (size), maximal tree depth (depth), number of trees (tree), and sampling rate (sampling).
     * @returns {object} A random forest model containing the following properties:
     *   - seed (the randomly generated seed value),
     *   - outcome (the outcome of the model),
     *   - numericals (the numerical features used to create the model),
     *   - categoricals (the categorical features used to create the model),
     *   - classes (a list of distinct classes, only available in a classification model),
     *   - trees (an array of decision trees),
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model),
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the mode, accepts an array of subjects as a parameter).
     */
    DRESS.randomForest = (subjects, outcome = null, numericals = [], categoricals = [], classification = false, hyperparameters = {}) => {
        //
        const fortify = (tree, rows, features, numNumerical, outcome, classification, impurity, depth, maxDepth, minSize, maxAttempt) => {
            // If it is a node
            if (tree[0 /* TREE.FEATURE */] > -1) {
                if (depth < maxDepth) {
                    // Try to split rows based on existing feature-cutoff.
                    let branch = split(rows, tree[0 /* TREE.FEATURE */], numNumerical, outcome, classification, tree[1 /* TREE.CUTOFF */]);
                    // If the impurity of the new split is higher than the existing impurity (i.e. new training samples have more heterogeneity)
                    if (branch[4 /* BRANCH.IMPURITY */] > tree[2 /* TREE.IMPURITY */]) {
                        // Try to find a better split (with lower impurity than existing impurity)
                        const node = sprout(rows, features, numNumerical, outcome, classification, tree[2 /* TREE.IMPURITY */], 0, 1, minSize, maxAttempt);
                        // If a better split is found.
                        if (node[0 /* TREE.FEATURE */] > -1) {
                            // Split the rows based on the new feature-cutoff.
                            branch = split(rows, node[0 /* TREE.FEATURE */], numNumerical, outcome, classification, node[1 /* TREE.CUTOFF */]);
                            // Attached existing tree to branch with lower impurity
                            node[branch[2 /* BRANCH.LEFT_IMPURITY */] < branch[3 /* BRANCH.RIGHT_IMPURITY */] ? 3 /* TREE.LEFT */ : 4 /* TREE.RIGHT */] = tree;
                            tree = node;
                        }
                        // If a better split is NOT found, do nothing and use the existing split.
                    }
                    tree[3 /* TREE.LEFT */] = fortify(tree[3 /* TREE.LEFT */], branch[0 /* BRANCH.LEFT */], features, numNumerical, outcome, classification, branch[2 /* BRANCH.LEFT_IMPURITY */], depth + 1, maxDepth, minSize, maxAttempt);
                    tree[4 /* TREE.RIGHT */] = fortify(tree[4 /* TREE.RIGHT */], branch[1 /* BRANCH.RIGHT */], features, numNumerical, outcome, classification, branch[3 /* BRANCH.RIGHT_IMPURITY */], depth + 1, maxDepth, minSize, maxAttempt);
                }
                else {
                    // Prune the tree                                      
                    let i = rows.length;
                    if (i > minSize) {
                        const votes = Array(i);
                        while (i--) {
                            votes[i] = harvest(rows[i], numNumerical, [tree]);
                        }
                        tree = fruit(votes, 0, classification, classification ? gini(votes, 0) : mse(votes, 0));
                    }
                }
            }
            else {
                if (rows.length > minSize) {
                    // If impurity of new rows are higher
                    if (impurity > tree[2 /* TREE.IMPURITY */]) {
                        // Try to split the new rows.
                        tree = sprout(rows, features, numNumerical, outcome, classification, impurity, depth, maxDepth, minSize, maxAttempt);
                    }
                    else {
                        // Replace the leaf with the new rows.
                        tree = fruit(rows, outcome, classification, impurity);
                    }
                }
            }
            return tree;
        };
        //
        const XY = (subjects, outcome, numericals, categoricals, classes) => {
            return classes ?
                DRESS.tabulate(subjects, numericals, categoricals, [(subject) => DRESS.classify(DRESS.get(subject, outcome), classes)]) :
                DRESS.tabulate(subjects, numericals, categoricals, [(subject) => DRESS.numeric(DRESS.get(subject, outcome))]);
        };
        //
        const randomForest = (trees, rows, outcome, numericals, categoricals, classes, hyperparameters) => {
            if (rows === null) {
                return null;
            }
            //
            const classification = Array.isArray(classes);
            //
            const { size: minSize = classification ? 1 : 3, depth: maxDepth = 5, tree: maxTree = 200, sampling: samplingRate = 0.75, attempt: maxAttempt = 10 } = hyperparameters;
            //
            const seed = DRESS.SEED;
            const numNumerical = numericals.length;
            const numFeature = numNumerical + categoricals.length;
            const features = Array.from(Array(numFeature).keys());
            const impurity = classification ? gini(rows, numFeature) : mse(rows, numFeature);
            // Sprout existing trees
            let t = trees.length;
            while (t--) {
                const columns = DRESS.shuffle(features).slice(-Math.ceil(numFeature * samplingRate));
                trees[t] = fortify(trees[t], rows, columns, numNumerical, numFeature, classification, impurity, 0, maxDepth, minSize, maxAttempt);
            }
            // Plant new trees
            t = ~~(maxTree - trees.length);
            while (t--) {
                const columns = DRESS.shuffle(features).slice(-Math.ceil(numFeature * samplingRate));
                const tree = sprout(rows, columns, numNumerical, numFeature, classification, impurity, 0, maxDepth, minSize, maxAttempt);
                if (tree[0 /* TREE.FEATURE */] > -1) {
                    trees.push(tree);
                }
            }
            //
            return {
                seed,
                outcome,
                numericals,
                categoricals,
                classes,
                trees,
                hyperparameters,
                text: '[' + outcome + ' = ' + numericals.concat(categoricals).join(' + ') + '] seed: ' + seed,
            };
        };
        //        
        let rows = null;
        let classes = classification ? [] : null;
        if (Array.isArray(subjects)) {
            rows = XY(subjects, outcome, numericals, categoricals, classes);
        }
        //
        let model = randomForest([], rows, outcome, numericals, categoricals, classes, hyperparameters);
        if (!model) {
            model = subjects;
        }
        //
        return Object.assign(Object.assign({}, model), { async: DRESS.nameof(() => DRESS.randomForest), 
            /**
             * @summary Fit the prepopulated X and Y arrays to the existing model.
             *
             * @param {any[][]} X
             * @param {any[]} Y
             */
            fit(X, Y) {
                const classes = this.classes;
                const rows = classes ?
                    X.map((row, i) => row.concat(DRESS.classify(Y[i], classes))) :
                    X.map((row, i) => row.concat(Y[i]));
                //            
                DRESS.SEED = this.seed;
                const model = randomForest(this.trees, rows, this.outcome, this.numericals, this.categoricals, classes, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @sumarry Train one or more additional subjects against the existing model.
             *
             * @param {object[]} subjects - The subjects to be processed.
             */
            train(subjects) {
                const outcome = this.outcome;
                const numericals = this.numericals;
                const categoricals = this.categoricals;
                const classes = this.classes;
                //
                let rows = null;
                if (Array.isArray(subjects)) {
                    rows = XY(subjects, outcome, numericals, categoricals, classes);
                }
                //
                DRESS.SEED = this.seed;
                const model = randomForest(this.trees, rows, outcome, numericals, categoricals, classes, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @summary Obtain a vote from every tree within the model
             *
             * @description This method computes a prediction (a vote) from each tree within the model.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {any[]} An array of votes.
             */
            vote(subject) {
                const numericals = this.numericals;
                const categoricals = this.categoricals;
                let numNumerical = numericals.length;
                let numCategorical = categoricals.length;
                //
                const row = Array(numNumerical + numCategorical);
                while (numCategorical--) {
                    row[numNumerical + numCategorical] = DRESS.categoric(DRESS.get(subject, categoricals[numCategorical]));
                }
                while (numNumerical--) {
                    row[numNumerical] = DRESS.numeric(DRESS.get(subject, numericals[numNumerical]));
                }
                return harvest(row, numericals.length, this.trees);
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
                if (this.classes) {
                    const votes = this.vote(subject);
                    const estimates = Array(this.classes.length).fill(0);
                    let i = votes.length;
                    const weight = 1 / i;
                    while (i--) {
                        estimates[votes[i]] += weight;
                    }
                    return estimates;
                }
                else {
                    const features = this.numericals.concat(this.categoricals);
                    const numFeature = features.length;
                    const estimates = Array(numFeature + 1);
                    let i = numFeature;
                    while (i--) {
                        const value = DRESS.get(subject, features[i]);
                        DRESS.set(subject, features[i], null);
                        estimates[i + 1] = DRESS.mean(this.vote(subject));
                        DRESS.set(subject, features[i], value);
                    }
                    estimates[0] = DRESS.mean(this.vote(subject));
                    return estimates;
                }
            },
            /**
             * @summary Make a prediction based on the model
             *
             * @description This method computes the predicted outcome based on a test subject.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {number} The predicted outcome.
             */
            predict(subject) {
                return this.classes ? this.classes[DRESS.mode(this.vote(subject))] : DRESS.mean(this.vote(subject));
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
     * @summary Build a Stochastic Gradient Boosting model
     *
     * @description This method builds a stochastic gradient boosting model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation. An outcome cannot be an array.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minimal node size (size), maximal tree depth (depth), number of trees (tree), sampling rate (sampling), and learning rate (learning).
     * @returns {object} A random forest model containing the following properties:
     *   - seed (the randomly generated seed value),
     *   - outcome (the outcome of the model),
     *   - numericals (the numerical features used to create the model),
     *   - categoricals (the categorical features used to create the model),
     *   - classes (a list of distinct classes, only available in a classification model),
     *   - trees (an array of decision trees),
     *
     *   - train (a method for training one or more subjects against the existing model),
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the mode, accepts an array of subjects as a parameter).
     */
    DRESS.gradientBoosting = (subjects, outcome = null, numericals = [], categoricals = [], classification = false, hyperparameters = {}) => {
        //
        const boost = (trees, rows, numNumerical, outcome, maxDepth, minSize, maxTree, maxAttempt, samplingRate, learningRate) => {
            const features = Array.from(Array(outcome).keys());
            //        
            let numTree = trees.length;
            for (let t = 0; t < maxTree; t++) {
                const someRows = DRESS.shuffle(rows).slice(-~~(rows.length * samplingRate));
                let tree = null;
                if (t < numTree) {
                    tree = trees[t];
                    // Split new samples based on existing feature-cutoff.
                    const branch = split(someRows, tree[0 /* TREE.FEATURE */], numNumerical, outcome, false, tree[1 /* TREE.CUTOFF */]);
                    // If the impurity of the new split is higher than the existing impurity (i.e. new training samples have more heterogeneity)
                    if (branch[4 /* BRANCH.IMPURITY */] > tree[2 /* TREE.IMPURITY */]) {
                        // Rebuild existing tree
                        tree = null;
                    }
                }
                if (tree === null) {
                    // Create a new tree based on new samples.
                    tree = sprout(someRows, features, numNumerical, outcome, false, mse(someRows, outcome), 0, maxDepth, minSize, maxAttempt);
                    if (tree[0 /* TREE.FEATURE */] > -1) {
                        if (t < numTree) {
                            // Replace existing tree.
                            trees[t] = tree;
                        }
                        else {
                            // Add new tree.
                            trees.push(tree);
                        }
                    }
                    else {
                        // Unable to create new tree. Use existing tree.
                        if (t < numTree) {
                            tree = trees[t];
                        }
                        else {
                            tree = null;
                        }
                    }
                }
                if (tree) {
                    // Update outcome.
                    const outcome_1 = outcome + 1;
                    let i = rows.length;
                    while (i--) {
                        const row = rows[i];
                        row[outcome] = (row[outcome_1] -= harvest(row, numNumerical, [tree])[0]) * learningRate;
                    }
                }
            }
            return trees;
        };
        //
        const XY = (subjects, outcome, numericals, categoricals, classes) => {
            return classes ?
                DRESS.tabulate(subjects, numericals, categoricals, [() => 0, () => 0, (subject) => DRESS.classify(DRESS.get(subject, outcome), classes)]) :
                DRESS.tabulate(subjects, numericals, categoricals, [() => 0, (subject) => DRESS.numeric(DRESS.get(subject, outcome))]);
        };
        //
        const gradientBoosting = (trees, rows, outcome, numericals, categoricals, classes, hyperparameters) => {
            if (rows === null) {
                return null;
            }
            //
            const classification = Array.isArray(classes);
            //
            const { size: minSize = classification ? 1 : 5, depth: maxDepth = 5, tree: maxTree = classification ? 25 : 50, sampling: samplingRate = 0.75, learning: learningRate = 0.4, attempt: maxAttempt = 10 } = hyperparameters;
            //        
            const seed = DRESS.SEED;
            const numRow = rows.length;
            const numNumerical = numericals.length;
            const numFeature = numNumerical + categoricals.length;
            if (classification) {
                let clsIndex = classes.length;
                while (clsIndex--) {
                    const numFeature_1 = numFeature + 1;
                    const numFeature_2 = numFeature + 2;
                    let i = numRow;
                    while (i--) {
                        const row = rows[i];
                        row[numFeature] = (row[numFeature_1] = (row[numFeature_2] === clsIndex) ? 1 : 0) * learningRate;
                    }
                    trees[clsIndex] = boost(trees[clsIndex] ? trees[clsIndex] : [], rows, numNumerical, numFeature, maxDepth, minSize, maxTree, maxAttempt, samplingRate, learningRate);
                }
            }
            else {
                const numFeature_1 = numFeature + 1;
                let i = numRow;
                while (i--) {
                    rows[i][numFeature] = rows[i][numFeature_1] * learningRate;
                }
                trees[0] = boost(trees[0] ? trees[0] : [], rows, numNumerical, numFeature, maxDepth, minSize, maxTree, maxAttempt, samplingRate, learningRate);
            }
            //
            return {
                seed,
                outcome,
                numericals,
                categoricals,
                classes,
                trees,
                hyperparameters,
                text: '[' + outcome + ' = ' + numericals.concat(categoricals).join(' + ') + '] seed: ' + seed,
            };
        };
        //                        
        let rows = null;
        let classes = classification ? [] : null;
        if (Array.isArray(subjects)) {
            rows = XY(subjects, outcome, numericals, categoricals, classes);
        }
        //
        let model = gradientBoosting([], rows, outcome, numericals, categoricals, classes, hyperparameters);
        if (!model) {
            model = subjects;
        }
        //
        return Object.assign(Object.assign({}, model), { async: DRESS.nameof(() => DRESS.gradientBoosting), 
            /**
             * @summary Fit the prepopulated X and Y arrays to the existing model.
             *
             * @param {any[][]} X
             * @param {any[]} Y
             */
            fit(X, Y) {
                const classes = this.classes;
                const rows = classes ?
                    X.map((row, i) => row.concat(0, 0, DRESS.classify(Y[i], classes))) :
                    X.map((row, i) => row.concat(0, Y[i]));
                //            
                DRESS.SEED = this.seed;
                const model = gradientBoosting(this.trees, rows, this.outcome, this.numericals, this.categoricals, classes, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @sumarry Train one or more additional subjects against the existing model.
             *
             * @param {object[]} subjects - The subjects to be processed.
             */
            train(subjects) {
                const outcome = this.outcome;
                const numericals = this.numericals;
                const categoricals = this.categoricals;
                const classes = this.classes;
                //
                let rows = null;
                if (Array.isArray(subjects)) {
                    rows = XY(subjects, outcome, numericals, categoricals, classes);
                }
                //
                DRESS.SEED = this.seed;
                const model = gradientBoosting(this.trees, rows, outcome, numericals, categoricals, classes, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @summary Obtain a vote from every tree within the model
             *
             * @description This method computes a prediction (a vote) from each tree within the model.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {any[]} An array of votes.
             */
            vote(subject, trees) {
                const numericals = this.numericals;
                const categoricals = this.categoricals;
                let numNumerical = numericals.length;
                let numCategorical = categoricals.length;
                //
                const row = Array(numNumerical + numCategorical);
                while (numCategorical--) {
                    row[numNumerical + numCategorical] = DRESS.categoric(DRESS.get(subject, categoricals[numCategorical]));
                }
                while (numNumerical--) {
                    row[numNumerical] = DRESS.numeric(DRESS.get(subject, numericals[numNumerical]));
                }
                return harvest(row, numericals.length, trees);
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
                if (this.classes) {
                    let clsIndex = this.classes.length;
                    const estimates = Array(clsIndex);
                    while (clsIndex--) {
                        estimates[clsIndex] = DRESS.sum(this.vote(subject, this.trees[clsIndex]));
                    }
                    return estimates;
                }
                else {
                    const features = this.numericals.concat(this.categoricals);
                    const numFeature = features.length;
                    const estimates = Array(numFeature + 1);
                    let i = numFeature;
                    while (i--) {
                        const value = DRESS.get(subject, features[i]);
                        DRESS.set(subject, features[i], null);
                        estimates[i + 1] = DRESS.sum(this.vote(subject, this.trees[0]));
                        DRESS.set(subject, features[i], value);
                    }
                    estimates[0] = DRESS.sum(this.vote(subject, this.trees[0]));
                    return estimates;
                }
            },
            /**
             * @summary Make a prediction based on the model
             *
             * @description This method computes the predicted outcome based on a test subject.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {number} The predicted outcome.
             */
            predict(subject) {
                if (this.classes) {
                    return this.classes[this.estimate(subject).reduce((max, p, i, P) => P[max] > p ? max : i, 0)];
                }
                else {
                    return DRESS.sum(this.vote(subject, this.trees[0]));
                }
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
})(DRESS || (DRESS = {}));
