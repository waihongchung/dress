var DRESS;
(function (DRESS) {
    /**
     * @summary Build a K-nearest-neighbor Model
     *
     * @description This method builds k-nearest neighbor imputation using a modified algorithm that accepts both numerical and categorical features as classifiers.
     * Each feature should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This algorithm takes into account the relative distribution of each categorical value and the absolute difference in the relative distribution between two categorical values is used to compute the Manhattan distance.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification. If the outcome is set as null, then the subject is used as the outcome value.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included importances (an array of relative importances of each feature).
     * It can be set to an array of numbers that is the same size as the total number of numerical and categorical classifiers.
     *
     * @returns {object[]} A K-nearest-neighbor model containing the following properties:
     *   - numericals (the numerical features used to create the model),
     *   - categoricals (the categorical features used to create the model),
     *   - importances (the relative importance of the features),
     *
     *   - train (a method for training additional subjects to the existing model),
     *   - predict (a method for making a prediction based on the model, accepts a subject, an outcome, a classification/regression flag, and the k-value as parameters),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects, and the k-value as parameters. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the model, accepts an array of subjects, an outcome, a classification/regression flag, and the k-value as parameters),
     *   - impute (a method for performing kNN imputation, accepts an array of subjects, an array of features, a categorical/numerical flag, and the k-value as parameters),
     *   - match (a method for performing kNN matching with the subjects used to build the model are considered as controls. The method accepts an array of samples, the k-value, and a greedy/optimal search flag).
     */
    DRESS.kNN = (subjects, outcome = null, numericals = [], categoricals = [], classification = false, hyperparameters = {}) => {
        //
        const XY = (subjects, outcome, numericals, categoricals, classes) => {
            return outcome ?
                (classes ?
                    DRESS.tabulate(subjects, numericals, categoricals, [(subject) => DRESS.classify(DRESS.get(subject, outcome), classes)]) :
                    DRESS.tabulate(subjects, numericals, categoricals, [(subject) => DRESS.numeric(DRESS.get(subject, outcome))])) :
                (DRESS.tabulate(subjects, numericals, categoricals, [(subject) => subject]));
        };
        //
        const kNN = (rows, outcome, numericals, categoricals, classes, neighbors, numericalScales, categoricalScales, hyperparameters) => {
            if (rows === null) {
                return null;
            }
            // Convert arrays to maps
            const categoricalMaps = categoricalScales.map(scale => new Map(scale));
            const numNumerical = numericalScales.length;
            const numCategorical = categoricalMaps.length;
            let i = rows.length;
            while (i--) {
                // Update numerical scales
                let j = numNumerical;
                while (j--) {
                    const value = rows[i][j];
                    const scale = numericalScales[j];
                    if (value < scale[0]) {
                        scale[0] = value;
                    }
                    if (value > scale[1]) {
                        scale[1] = value;
                    }
                }
                // Update categorical maps
                j = numCategorical;
                while (j--) {
                    const value = rows[i][j + numNumerical];
                    const map = categoricalMaps[j];
                    map.set(value, (map.get(value) || 0) + 1);
                }
            }
            // Convert maps to arrays
            categoricalScales = categoricalMaps.map(map => Array.from(map));
            // attach new rows to existing neighbors 
            neighbors = neighbors.concat(rows);
            return {
                outcome,
                numericals,
                categoricals,
                classes,
                numericalScales,
                categoricalScales,
                neighbors,
                hyperparameters,
                text: '[' + outcome + ' = ' + numericals.concat(categoricals).join(' + ') + '] ' + neighbors.length,
            };
        };
        //
        let rows = null;
        let classes = classification ? [] : null;
        if (Array.isArray(subjects)) {
            rows = XY(subjects, outcome, numericals, categoricals, classes);
        }
        let model = kNN(rows, outcome, numericals, categoricals, classes, [], Array(numericals.length).fill(null).map(() => [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]), Array(categoricals.length).fill(null).map(() => []), hyperparameters);
        if (!model) {
            model = subjects;
        }
        return Object.assign(Object.assign({}, model), { async: DRESS.nameof(() => DRESS.kNN), 
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
                const model = kNN(rows, this.outcome, this.numericals, this.categoricals, this.classes, this.neighbors, this.numericalScales, this.categoricalScales, this.hyperparameters);
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
                const model = kNN(rows, outcome, numericals, categoricals, classes, this.neighbors, this.numericalScales, this.categoricalScales, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @summary Locate the k-nearest neighbor(s) within the model for the specified test subject.
             *
             * @param {object} subject - The test subject.
             * @param {number} [k=5]  - The number of neighbors to locate. Default to 5.
             *
             * @returns {[object, number][]} An array containing the k-nearest neighbor(s) and the corresponding distance measurement(s).
             */
            nearest(subject, k = 0) {
                const numericalRanges = this.numericalScales.map(scale => (scale[1] === scale[0]) ? 1 : (scale[1] - scale[0]));
                const categoricalMaps = this.categoricalScales.map(scale => new Map(scale));
                const numericals = this.numericals.map(numerical => DRESS.numeric(DRESS.get(subject, numerical)));
                const numNumerical = numericals.length;
                const categoricals = this.categoricals.map(categorical => DRESS.categoric(DRESS.get(subject, categorical)));
                const numCategorical = categoricals.length;
                const outcomeColumn = numNumerical + numCategorical;
                const { importances = Array(numNumerical + numCategorical).fill(1) } = this.hyperparameters;
                const neighbors = this.neighbors;
                const numNeighbor = neighbors.length;
                const nearests = [];
                let threshold = Number.POSITIVE_INFINITY;
                let i = numNeighbor;
                while (i--) {
                    let distance = 0;
                    const neighbor = neighbors[i];
                    if (neighbor[outcomeColumn] !== null) {
                        // Compute and add numerical distances
                        let j = numNumerical;
                        while (j--) {
                            distance += importances[j] * Math.abs(numericals[j] - neighbor[j]) / numericalRanges[j];
                        }
                        // Compute and add categorical distances
                        j = numCategorical;
                        while (j--) {
                            // If the distance is already above the threshold, then break.
                            if (distance >= threshold)
                                break;
                            if (categoricals[j] !== neighbor[numNumerical + j]) {
                                const categoricalMap = categoricalMaps[j];
                                const numCategory = categoricalMap.size;
                                distance += importances[numNumerical + j] * ((1 / numCategory) + (1 - 1 / numCategory) * Math.abs((categoricalMap.get(categoricals[j]) || 0) - categoricalMap.get(neighbor[numNumerical + j])) / numNeighbor);
                            }
                        }
                        if (distance < threshold) {
                            nearests.push([neighbor, distance]);
                            if (nearests.length > k) {
                                nearests.splice(nearests.findIndex(nearest => nearest[1 /* NEAREST.DISTANCE */] === threshold), 1);
                            }
                            if (nearests.length === k) {
                                threshold = nearests.reduce((max, nearest) => nearest[1 /* NEAREST.DISTANCE */] > max ? nearest[1 /* NEAREST.DISTANCE */] : max, Number.NEGATIVE_INFINITY);
                            }
                        }
                    }
                }
                return nearests;
            },
            /**
             * @summary Obtain the votes from the nearest neighbors.
             *
             * @description This method computes a prediction (a vote) from the k-neasest neighbors within the model.
             *
             * @param {object} subject - A test subject.
             * @param {number} [k=5] - The number of neighbors to consider. Default to 0, which uses the Sturges' rule.
             * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
             *
             * @returns {[any[], number[]]} An array of votes and the associated weights of the votes.
             */
            vote(subject, k = 5, unweighted = false) {
                const outcomeColumn = this.numericals.length + this.categoricals.length;
                const nearests = this.nearest(subject, k);
                const outcomes = nearests.map(nearest => nearest[0 /* NEAREST.NEIGHBOR */][outcomeColumn]);
                const weights = unweighted ? Array(k).fill(1 / k) : DRESS.softmax(nearests.map(nearest => -nearest[1 /* NEAREST.DISTANCE */]));
                return [outcomes, weights];
            },
            /**
             * @summary Compute one or more outcome estimates based on the model.
             *
             * @description This method computes an array of outcome estimates on the model.
             *
             * @param {object} subject - A test subject.
             * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
             * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
             *
             * @returns {number} The outcome estimates.
             */
            estimate(subject, k = 5, unweighted = false) {
                const [outcomes, weights] = this.vote(subject, k, unweighted);
                if (this.outcome) {
                    if (this.classes) {
                        const estimates = Array(this.classes.length).fill(0);
                        let i = outcomes.length;
                        while (i--) {
                            estimates[outcomes[i]] += weights[i];
                        }
                        return estimates;
                    }
                    return [DRESS.mean(outcomes, weights), ...outcomes];
                    //return [mean(outcomes, weights), ...outcomes.map((outcome, i) => [outcome, weights[i]]).sort(([, a], [, b]) => b - a).map(tuple => tuple[0])]
                }
                return weights;
            },
            /**
             * @summary Make a prediction based on the model
             *
             * @description This method computes the predicted outcome based on a test subject.
             *
             * @param {object} subject - A test subject.
             * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
             * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
             *
             * @returns {number} The predicted outcome.
             */
            predict(subject, k = 5, unweighted = false) {
                const [outcomes, weights] = this.vote(subject, k, unweighted);
                return this.outcome ? (this.classes ? this.classes[DRESS.mode(outcomes, weights)] : DRESS.mean(outcomes, weights)) : outcomes;
            },
            /**
             * @summary Compute the area under the curve for a classification model.
             *
             * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
             * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
             * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
             *
             * @returns A ROC or PR curve
             */
            auc(subjects, k = 5, unweighted = false, curve = DRESS.roc) {
                return DRESS.auc(this, subjects, this.outcome, this.classes, curve, k, unweighted);
            },
            /**
             * @summary Validate the performance of the model.
             *
             * @description This method computes the accuracy of the model based on the specified test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
             * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
             *
             * @returns The performance of the model.
             */
            validate(subjects, k = 5, unweighted = false) {
                return DRESS.validate(this, subjects, this.outcome, this.classes, k, unweighted);
            } });
    };
})(DRESS || (DRESS = {}));
