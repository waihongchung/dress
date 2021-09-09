var DRESS;
(function (DRESS) {
    /**
     * @summary Build a K-nearest-neighbor Model
     *
     * @description This method builds k-nearest neighbor imputation using a modified algorithm that accepts both numerical and categorical features as classifiers.
     * Each feature should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This algorithm takes into account the relative distribution of each categorical value and the absolute difference in the relative distribution between two categorical values is used to compute the Manhattan distance.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers.
     * @param {boolean} [normalize=true] - Normalize classifiers prior to computation. Default to true.
     * @returns {object[]} A K-nearest-neighbor model containing the following properties:
     *   numericals (the numerical features used to create the model),
     *   categoricals (the categorical features used to create the model),
     *   numericalScales (the scaling factor used to normalize numerical features),
     *   categoricalScales (the scaling factor used to normalize categorical features),
     *   predict (a method for making a prediction based on the model, accepts a subject, an outcome, a classification/regression flag, and the k-value as parameters),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects, and the k-value as parameters. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects, an outcome, a classification/regression flag, and the k-value as parameters),
     *   impute (a method for performing kNN imputation, accepts an array of subject, an array of features, a categorical/numerical flag, and the k-value as parameters),
     *   match (a method for performing kNN matching with the subjects used to build the model are considered as controls. The method accepts an array of samples, the k-value, and a greed/optimal search flag).
     */
    DRESS.kNN = (subjects, numericals, categoricals, normalize = true) => {
        let numericalScales;
        let categoricalScales;
        let neighbors;
        if (Array.isArray(subjects)) {
            const numSubject = subjects.length;
            const numNumerical = numericals.length;
            const numCategorical = categoricals.length;
            numericalScales = (new Array(numNumerical)).fill(null).map(_ => [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
            categoricalScales = (new Array(numCategorical)).fill(null).map(_ => new Map());
            neighbors = new Array(numSubject);
            let i = numSubject;
            while (i--) {
                neighbors[i] = [
                    subjects[i],
                    numericals.map((numerical, index) => {
                        const value = DRESS.numeric(DRESS.get(subjects[i], numerical));
                        const scale = numericalScales[index];
                        if (value < scale[0 /* MIN */]) {
                            scale[0 /* MIN */] = value;
                        }
                        if (value > scale[1 /* RANGE */]) {
                            scale[1 /* RANGE */] = value;
                        }
                        return value;
                    }),
                    categoricals.map((categorical, index) => {
                        const value = DRESS.categoric(DRESS.get(subjects[i], categorical));
                        const scale = categoricalScales[index];
                        scale.set(value, (scale.get(value) || 0) + 1);
                        return value;
                    })
                ];
            }
            if (normalize) {
                i = numNumerical;
                while (i--) {
                    const scale = numericalScales[i];
                    scale[1 /* RANGE */] -= scale[0 /* MIN */];
                    if (scale[1 /* RANGE */] === 0) {
                        scale[1 /* RANGE */] = 1;
                    }
                }
                i = numCategorical;
                while (i--) {
                    const categoricalScale = categoricalScales[i];
                    const counts = Array.from(categoricalScale.values()).sort((a, b) => a - b);
                    const min = counts[0];
                    let range = counts[counts.length - 1] - min;
                    if (range === 0) {
                        range = 1;
                    }
                    Array.from(categoricalScale).map(([key, value]) => {
                        categoricalScale.set(key, (value - min) / range);
                    });
                }
                i = numSubject;
                while (i--) {
                    const neighbor = neighbors[i][1 /* NUMERICALS */];
                    let j = numNumerical;
                    while (j--) {
                        neighbor[j] -= numericalScales[j][0 /* MIN */];
                        neighbor[j] /= numericalScales[j][1 /* RANGE */];
                    }
                }
            }
            else {
                numericalScales = (new Array(numNumerical)).fill([0, 1]);
            }
        }
        else {
            numericals = subjects['numericals'];
            categoricals = subjects['categoricals'];
            numericalScales = subjects['numericalScales'];
            categoricalScales = subjects['categoricalScales'];
            neighbors = subjects['neighbors'];
        }
        return {
            numericals,
            categoricals,
            numericalScales,
            categoricalScales: categoricalScales.map(map => Array.from(map)),
            neighbors,
            text: '[' + numericals.concat(categoricals).join(', ') + '] ',
            nearest(subject, k) {
                const categoricalScales = this.categoricalScales.map(array => new Map(array));
                const numNumerical = this.numericals.length;
                const numericals = this.numericals.map((numerical, index) => {
                    let value = DRESS.numeric(DRESS.get(subject, numerical));
                    value -= this.numericalScales[index][0 /* MIN */];
                    value /= this.numericalScales[index][1 /* RANGE */];
                    return value;
                });
                const numCategorical = this.categoricals.length;
                const categoricals = this.categoricals.map(categorical => DRESS.categoric(DRESS.get(subject, categorical)));
                const nearest = new Array();
                let threshold = Number.POSITIVE_INFINITY;
                let i = neighbors.length;
                while (i--) {
                    let distance = 0;
                    const neighbor = this.neighbors[i];
                    if (neighbor[0 /* SUBJECT */] !== null) {
                        let j = numNumerical;
                        while (j--) {
                            distance += Math.abs(numericals[j] - neighbor[1 /* NUMERICALS */][j]);
                        }
                        if (distance < threshold) {
                            j = numCategorical;
                            while (j--) {
                                if (categoricals[j] !== neighbor[2 /* CATEGORICALS */][j]) {
                                    distance += 0.5 + Math.abs((categoricalScales[j].get(categoricals[j]) || 0) - categoricalScales[j].get(neighbor[2 /* CATEGORICALS */][j])) * 0.5;
                                }
                            }
                            if (distance < threshold) {
                                nearest.push([neighbor, distance]);
                                if (nearest.length > k) {
                                    nearest.sort((a, b) => b[1 /* DISTANCE */] - a[1 /* DISTANCE */]);
                                    nearest.shift();
                                    threshold = nearest[0][1 /* DISTANCE */];
                                }
                            }
                        }
                    }
                }
                if (threshold === Number.POSITIVE_INFINITY) {
                    nearest.sort((a, b) => b[1 /* DISTANCE */] - a[1 /* DISTANCE */]);
                }
                return nearest;
            },
            predict(subject, outcome, classification = true, k = 5) {
                const votes = this.nearest(subject, k).map(near => classification ? DRESS.categoric(DRESS.get(near[0 /* NEIGHBOR */][0 /* SUBJECT */], outcome)) : DRESS.numeric(DRESS.get(near[0 /* NEIGHBOR */][0 /* SUBJECT */], outcome)));
                return classification ? DRESS.mode(votes) : DRESS.mean(votes);
            },
            roc(subjects, outcome, k = 5, roc = DRESS.roc) {
                const numSubject = subjects.length;
                const expectations = new Array(numSubject);
                const votes = new Array(numSubject);
                const classes = [];
                subjects.map((subject, index) => {
                    const value = DRESS.categoric(DRESS.get(subject, outcome));
                    if (classes.indexOf(value) === -1) {
                        classes.push(value);
                    }
                    expectations[index] = value;
                    votes[index] = this.nearest(subject, k).map(near => DRESS.categoric(DRESS.get(near[0 /* NEIGHBOR */][0 /* SUBJECT */], outcome)));
                });
                return {
                    outcome,
                    k,
                    classes: classes.map(cls => {
                        const predictions = new Array(numSubject);
                        expectations.map((expectation, index) => {
                            predictions[index] = [(expectation === cls) ? 1 : 0, votes[index].filter(vote => vote === cls).length / votes[index].length];
                        });
                        return roc({ predictions }, [cls], ['kNN']);
                    }),
                    text: '[' + outcome + '] k: ' + k
                };
            },
            performance(subjects, outcome, classification = true, k = 5) {
                return classification ?
                    DRESS.accuracies(subjects.map(subject => [
                        DRESS.categoric(DRESS.get(subject, outcome)),
                        this.predict(subject, outcome, true, k)
                    ])) :
                    DRESS.errors(subjects.map(subject => [
                        DRESS.numeric(DRESS.get(subject, outcome)),
                        this.predict(subject, outcome, false, k)
                    ]));
            },
            impute(subjects, features, categorical = false, k = 5) {
                const numNeighbor = this.neighbors.length;
                const numSubject = subjects.length;
                const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
                return features.map(feature => {
                    const nulls = subjects.filter(subject => DRESS.get(subject, feature) === null);
                    nulls.map(subject => {
                        const neighbors = this.nearest(subject, numNeighbor).map(near => near[0 /* NEIGHBOR */][0 /* SUBJECT */]);
                        const votes = [];
                        while (votes.length < k) {
                            const value = DRESS.get(neighbors.pop(), feature);
                            if (value !== null) {
                                votes.push(value);
                            }
                        }
                        DRESS.set(subject, feature, categorical ? DRESS.mode(votes) : DRESS.mean(votes));
                    });
                    const count = nulls.length;
                    return {
                        feature,
                        count,
                        text: DRESS.padEnd(feature, pad) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
                    };
                });
            },
            match(subjects, k = 1, greedy = true) {
                const numNeighbor = this.neighbors.length;
                const neighbors = new Array(numNeighbor);
                let i = numNeighbor;
                while (i--) {
                    neighbors[i] = this.neighbors[i][0 /* SUBJECT */];
                    this.neighbors[i][0 /* SUBJECT */] = i;
                }
                const matches = [];
                if (!greedy) {
                    while (k--) {
                        let pairings = subjects.map(subject => [...this.nearest(subject, 1).pop(), subject]).sort((a, b) => a[1 /* DISTANCE */] - b[1 /* DISTANCE */]);
                        while (pairings.length) {
                            const pairing = pairings[0];
                            const id = pairing[0 /* NEIGHBOR */][0 /* SUBJECT */];
                            if (id === null) {
                                pairings = pairings.filter(pairing => pairing[2]).map(pairing => [...this.nearest(pairing[2], 1).pop(), pairing[2]]).sort((a, b) => a[1 /* DISTANCE */] - b[1 /* DISTANCE */]);
                            }
                            else {
                                matches.push(neighbors[id]);
                                pairing[0 /* NEIGHBOR */][0 /* SUBJECT */] = null;
                                pairing[2] = null;
                            }
                        }
                    }
                }
                else {
                    subjects.map(subject => {
                        this.nearest(subject, k).map(near => {
                            matches.push(neighbors[near[0 /* NEIGHBOR */][0 /* SUBJECT */]]);
                            near[0 /* NEIGHBOR */][0 /* SUBJECT */] = null;
                        });
                    });
                }
                i = numNeighbor;
                while (i--) {
                    this.neighbors[i][0 /* SUBJECT */] = neighbors[i];
                }
                return matches;
            }
        };
    };
})(DRESS || (DRESS = {}));
