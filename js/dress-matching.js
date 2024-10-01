var DRESS;
(function (DRESS) {
    /**
     * @summary Perform exact matching.
     *
     * @description This method matches each subject to one or more controls based on the specified features.
     * In the exact matching algorithm, all of the specified features between the subject and the control must be identical in order to be considered a match.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the array is sorted and the string representation of the array is considered.
     * If the property is not an array, then the raw value of the property is considered.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {object[]} controls - The pool of controls from which the matches will be selected.
     * @param {string[]} features - The features to be analyzed.
     * @param {number} [k=1] - The number of matches for each subject.
     *
     * @returns {object[]} An array of matched controls.
     */
    DRESS.exact = (subjects, controls, features, k = 1) => {
        const numSubject = subjects.length;
        const numControl = controls.length;
        //
        if ((numSubject * k) > numControl) {
            return [];
        }
        //
        const matched = Array(numControl).fill(false);
        const controlValues = Array(numControl).fill(null);
        while (k--) {
            let i = numSubject;
            while (i--) {
                const index = controls.findIndex((control, index) => (!matched[index] &&
                    ((controlValues[index] === null) ? (controlValues[index] = features.map(feature => DRESS.categoric(DRESS.get(control, feature)))) : controlValues[index]).every((value, f) => DRESS.categoric(DRESS.get(subjects[i], features[f])) === value)));
                if (index > -1) {
                    matched[index] = true;
                }
            }
        }
        const matches = [];
        let i = numControl;
        while (i--) {
            if (matched[i]) {
                matches.push(controls[i]);
            }
        }
        return matches;
    };
    /**
     * @summary Perform propensity score matching.
     *
     * @description This method matches each subject to one or more controls based on the propensity score derived from the specified features.
     * Each feature should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This implementation represents an improvement over the vanilla propensity score matching algorithm by allowing categorical features to be specified.
     *
     * This method uses, internally, the DRESS.logistic algorithm (if only numerical features are specified) or the DRESS.gradientBoosting algorithm (if categorical features are specified),
     * to compute the propensity scores. Therefore, MUST include either the dress-regression.js package or the dress-tree.js package.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {object[]} controls - The pool of controls from which the matches will be selected.
     * @param {string[]} numericals - The numerical features to be analyzed.
     * @param {string[]} categoricals - The categorical features to be analyzed.
     * @param {number} [k=1] - The number of matches for each subject.
     * @param {boolean} [optimal=false] - Use optimal matching, instead of greedy matching. Default to false (greedy).
     * @param {any} [logistic=DRESS.logistic] - A logistic regression algorithm. Default to DRESS.logistic.
     * @param {any} [gradientBoosting=DRESS.gradientBoosting] - A Gradient Boosting machine-learning algorithm. Default to DRESS.gradientBoosting.
     *
     * @returns {object[]} An array of matched controls.
     */
    DRESS.propensity = (subjects, controls, numericals = [], categoricals = [], k = 1, optimal = false, logistic = DRESS.logistic, gradientBoosting = DRESS.gradientBoosting) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        //
        const numSubject = subjects.length;
        const numControl = controls.length;
        //
        if ((numSubject * k) > numControl) {
            return [];
        }
        // Build a propensity model
        let model;
        if (categoricals.length) {
            model = gradientBoosting([], 'propensity', numericals, categoricals, false);
            model.fit(DRESS.tabulate(subjects.concat(controls), numericals, categoricals), Array(numSubject + numControl).fill(1, 0, numSubject).fill(0, numSubject));
        }
        else {
            model = logistic([], ['propensity'], numericals);
            model.fit(DRESS.tabulate(subjects.concat(controls), numericals), Array(numSubject + numControl).fill(1, 0, numSubject).fill(0, numSubject));
        }
        //
        const matches = [];
        if (optimal) {
            const controlScores = Array(numControl);
            let i = numControl;
            while (i--) {
                controlScores[i] = model.predict(controls[i]);
            }
            //
            const matrix = Array(numSubject);
            i = numSubject;
            while (i--) {
                const subjectScore = model.predict(subjects[i]);
                const scores = Array(numControl);
                let j = numControl;
                while (j--) {
                    scores[j] = Math.abs(controlScores[j] - subjectScore);
                }
                matrix[i] = scores;
            }
            //
            while (k--) {
                DRESS.hungarian(matrix).forEach(match => {
                    matches.push(controls[match]);
                    i = numSubject;
                    while (i--) {
                        matrix[i][match] = Number.POSITIVE_INFINITY;
                    }
                });
            }
        }
        else {
            const controlScores = Array(numControl);
            let i = numControl;
            while (i--) {
                controlScores[i] = [i, model.predict(controls[i])];
            }
            const scores = controlScores.sort(([, a], [, b]) => a - b).map(([, score]) => score);
            //
            while (k--) {
                let i = numSubject;
                while (i--) {
                    const match = DRESS.binary(scores, model.predict(subjects[i]));
                    if (match > -1) {
                        matches.push(controls[controlScores[match][0]]);
                        scores[match] = null;
                    }
                }
            }
        }
        //
        return matches;
    };
    /**
    * @summary Perform proximity matching.
    *
    * @description This method matches each subject to one or more controls based on the proximity score derived from the specified features.
    * Each feature should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
    * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
    *
    * This method uses, internally, the DRESS.kNN method, to compute the proximity scores. Therefore, MUST include the dress-knn.js package.
    *
    * @param {object[]} subjects - The subjects to be analyzed.
    * @param {object[]} controls - The pool of controls from which the matches will be selected.
    * @param {string[]} numericals - The numerical features to be analyzed.
    * @param {string[]} categoricals - The categorical features to be analyzed.
    * @param {number} [k=1] - The number of matches for each subject.
    * @param {boolean} [optimal=false] - Use optimal matching, instead of greedy matching. Default to false (greedy).
    * @param {any} [kNN=DRESS.kNN] - A k-nearest neighbor machine-learning algorithm. Default to DRESS.kNN.
    *
    * @returns {object[]} An array of matched controls.
    */
    DRESS.proximity = (subjects, controls, numericals = [], categoricals = [], k = 1, optimal = false, kNN = DRESS.kNN) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        //
        const numSubject = subjects.length;
        const numControl = controls.length;
        const outcomeColumn = numericals.length + categoricals.length;
        //
        if ((numSubject * k) > numControl) {
            return [];
        }
        // Build a kNN model without specifying outcome
        const model = kNN(controls, null, numericals, categoricals);
        //
        const matches = [];
        if (optimal) {
            const subjectNearests = subjects.map(subject => model.nearest(subject, numControl));
            while (k--) {
                DRESS.hungarian(subjectNearests.map(nearests => nearests.map(nearest => nearest[1 /*NEAREST.DISTANCE*/]))).forEach((match, subject) => {
                    const nearest = subjectNearests[subject][match];
                    matches.push(nearest[0 /*NEAREST.NEIGHBOR*/][outcomeColumn]);
                    nearest[1 /*NEAREST.DISTANCE*/] = Number.POSITIVE_INFINITY;
                });
            }
        }
        else {
            let i = numSubject;
            while (i--) {
                model.nearest(subjects[i], k).forEach(nearest => {
                    matches.push(nearest[0 /*NEAREST.NEIGHBOR*/][outcomeColumn]);
                    nearest[0 /*NEAREST.NEIGHBOR*/][outcomeColumn] = null;
                });
            }
        }
        return matches;
    };
    /**
     * @summary Adaptive Synthetic Sampling
     *
     * @description This method creates new samples using a modified Adaptive Synthetic Sampling (ADASYN) approach, which belongs to a family of Synthetic Minority Oversampling Techniques (SMOTE).
     * The algorithm automatically identifies the majority class and the minority classes, based on the values of the outcome variable.
     * It proceeds to build a kNN model in order to identify the nearest neighbors around each minority sample. It synthesizes new samples that are similar, but not identical to those minority samples by adding random noises.
     *
     * This implementation represents an improvement over the vanilla ADASYN algorithm by enabling the synthesis of categorical features and by considering the Euclidean distance between the samples,
     * in addition to their distribution densities.
     *
     * @param {object[]} subjects - The subjects to be processed.
    *  @param {string} outcome - A categorical outcome used to determine class membership.
     * @param {string[]} numericals - An array of numerical features to synthesize.
     * @param {string[]} categoricals - An array of categorical features to synthesize.
     * @param {number} [ratio=1] - The minimum ratio between the majority class and the minority class. Default to 1, which means the classes will be perfectly balanced.
     * @param {number} [k=5] - The number of neighbors to consider. Default to 5.
     * @param {any} [kNN=DRESS.kNN] - A k-nearest neighbor machine-learning algorithm. Default to DRESS.kNN.
     *
     * @returns {object[]} - An array of newly synthesized samples.
     */
    DRESS.synthetic = (subjects, outcome, numericals = [], categoricals = [], ratio = 1, k = 5, kNN = DRESS.kNN) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        //
        const numSubject = subjects.length;
        // Distribute subjects by outcome classes
        const classes = new Map();
        let i = numSubject;
        while (i--) {
            const value = DRESS.categoric(DRESS.get(subjects[i], outcome));
            if (classes.has(value)) {
                classes.get(value).push(subjects[i]);
            }
            else {
                classes.set(value, [subjects[i]]);
            }
        }
        // Identify majority and minority classes
        const minorities = Array.from(classes).sort(([, a], [, b]) => a.length - b.length);
        const majority = minorities.pop();
        // Build a kNN model without specifying outcome
        const model = kNN(subjects, null, numericals, categoricals);
        const synthetics = [];
        minorities.forEach(minority => {
            const G = (majority[1].length * ratio - minority[1].length);
            if (G > 0) {
                const subjects = minority[1];
                const numSubject = subjects.length;
                const neighborhoods = Array(numSubject).fill(null).map(() => []);
                const Rs = Array(numSubject).fill(0);
                let R = 0;
                let i = numSubject;
                while (i--) {
                    // Get nearest k subjects       
                    model.nearest(subjects[i], k).forEach(nearest => {
                        const cls = DRESS.categoric(DRESS.get(nearest[0][0], outcome));
                        if (cls === minority[0]) {
                            // Add minority subject to neighborhoods
                            neighborhoods[i].push(nearest[0][0]);
                        }
                        else {
                            // Add inversed distance to Rs
                            Rs[i] += 1 / (nearest[1] + 1);
                        }
                    });
                    R += Rs[i];
                }
                i = numSubject;
                while (i--) {
                    // Number of synthetics to be made in this neighborhood.
                    let j = Math.round(R ? G * Rs[i] / R : G / numSubject);
                    while (j--) {
                        // Pick a random neighbor
                        const subject = subjects[i];
                        const neighbor = neighborhoods[i][~~(neighborhoods[i].length * DRESS.rand())];
                        const synthetic = {};
                        numericals.forEach(numerical => {
                            const random = DRESS.rand();
                            // Pick a random point between the subject and the random neighbor.
                            DRESS.set(synthetic, numerical, DRESS.numeric(DRESS.get(subject, numerical)) * random + DRESS.numeric(DRESS.get(neighbor, numerical)) * (1 - random));
                        });
                        categoricals.forEach(categorical => {
                            // Pick a categorical value randomly.
                            DRESS.set(synthetic, categorical, (DRESS.rand() > 0.5) ? DRESS.get(subject, categorical) : DRESS.get(neighbor, categorical));
                        });
                        DRESS.set(synthetic, outcome, DRESS.get(subject, outcome));
                        synthetics.push(synthetic);
                    }
                }
            }
        });
        return synthetics;
    };
})(DRESS || (DRESS = {}));
