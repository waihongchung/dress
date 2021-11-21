var DRESS;
(function (DRESS) {
    /**
     * @summary Perform exact matching.
     *
     * @description This method matches each subject to one or more controls based on the specified features.
     * In the exact mataching algorithm, all of the specified features between the subject and the control must be identical in order to be considered a match.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the array is sorted and the string representation of the array is considered.
     * If the property is not an array, then the raw value of the property is considered.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {object[]} controls - The pool of controls from which the matches will be selected.
     * @param {string[]} features - The features to be analyzed.
     * @param {number} [k=1] - The number of matches for each subject.
     * @returns {object[]} An array of matched controls.
     */
    DRESS.exact = (subjects, controls, features, k = 1) => {
        const numSubject = subjects.length;
        const numControl = controls.length;
        const checks = (new Array(numControl)).fill(false);
        while (k--) {
            let i = numSubject;
            while (i--) {
                const index = controls.findIndex((control, index) => (!checks[index] &&
                    features.every(feature => DRESS.categoric(DRESS.get(subjects[i], feature)) === DRESS.categoric(DRESS.get(control, feature)))));
                if (index > -1) {
                    checks[index] = true;
                }
            }
        }
        const matches = [];
        let i = numControl;
        while (i--) {
            if (checks[i]) {
                matches.push(controls[i]);
            }
        }
        return matches;
    };
    /**
     * @summary Perform propensity score matching.
     *
     * @description This method matches each subject to one or more controls based on the propensity score derived from the specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the feature.
     * If the property is not an array, then it would be converted to a numeric value.
     *
     * This method uses, internally, the DRESS.logistic method. Therefore, MUST include the dress-regression.js package.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {object[]} controls - The pool of controls from which the matches will be selected.
     * @param {string[]} features - The features to be analyzed.
     * @param {number} [k=1] - The number of matches for each subject.
     * @param {boolean} [greedy=true] - Greedy matching or optimal matching. Default to greedy.
     * @param {any} [logistic=DRESS.logistic] - A logistic regression algoritmh. Default to DRESS.logistic.
     * @returns {object[]} An array of matched controls.
     */
    DRESS.propensity = (subjects, controls, features, k = 1, greedy = true, logistic = DRESS.logistic) => {
        const numSubject = subjects.length;
        const numControl = controls.length;
        const model = logistic({
            X: subjects.concat(controls).map(subject => features.map(feature => DRESS.numeric(DRESS.get(subject, feature)))),
            Y: (new Array(numSubject)).fill(1).concat((new Array(numControl)).fill(0))
        }, ['propensity'], features);
        const subjectScores = new Array(numSubject);
        let i = numSubject;
        while (i--) {
            subjectScores[i] = [subjects[i], model.predict(subjects[i])];
        }
        const controlScores = new Array(numControl + 1);
        i = numControl;
        controlScores[i] = [{}, Number.POSITIVE_INFINITY];
        while (i--) {
            controlScores[i] = [controls[i], model.predict(controls[i])];
        }
        subjectScores.sort((a, b) => a[1] - b[1]);
        controlScores.sort((a, b) => a[1] - b[1]);
        const matches = [];
        if (!greedy) {
            const pairings = new Array(numControl + 1);
            let i = numControl + 1;
            while (i--) {
                pairings[i] = [null, Number.POSITIVE_INFINITY];
            }
            while (k--) {
                const orphans = [...Array(numSubject).keys()];
                while (orphans.length) {
                    const orphan = orphans.shift();
                    const score = subjectScores[orphan][1];
                    let min = Number.POSITIVE_INFINITY;
                    let index = controlScores.findIndex(controlScore => {
                        const diff = Math.abs(controlScore[1] - score);
                        if (diff > min) {
                            return true;
                        }
                        min = diff;
                        return false;
                    });
                    let before = index;
                    let beforeDiff = Number.POSITIVE_INFINITY;
                    while (--before >= 0) {
                        beforeDiff = Math.abs(controlScores[before][1] - score);
                        if (beforeDiff < pairings[before][1]) {
                            break;
                        }
                    }
                    let after = index;
                    let afterDiff = Number.POSITIVE_INFINITY;
                    while (after <= numControl) {
                        afterDiff = Math.abs(controlScores[after][1] - score);
                        if (afterDiff < pairings[after][1]) {
                            break;
                        }
                        ++after;
                    }
                    const pairing = (beforeDiff <= afterDiff) ? pairings[before] : pairings[after];
                    if (pairing[0] !== null) {
                        orphans.unshift(pairing[0]);
                    }
                    pairing[0] = orphan;
                    pairing[1] = (beforeDiff <= afterDiff) ? beforeDiff : afterDiff;
                }
            }
            i = numControl;
            while (i--) {
                if (pairings[i][0] !== null) {
                    matches.push(controlScores[i][0]);
                }
            }
        }
        else {
            while (k--) {
                let i = numSubject;
                while (i--) {
                    const score = subjectScores[i][1];
                    let min = Number.POSITIVE_INFINITY;
                    let index = controlScores.findIndex(controlScore => {
                        if (controlScore) {
                            const diff = Math.abs(controlScore[1] - score);
                            if (diff > min) {
                                return true;
                            }
                            min = diff;
                        }
                        return false;
                    });
                    let before = index;
                    while (--before >= 0) {
                        if (controlScores[before] !== null) {
                            break;
                        }
                    }
                    let after = index;
                    while (after <= numControl) {
                        if (controlScores[after] !== null) {
                            break;
                        }
                        ++after;
                    }
                    index = (Math.abs(controlScores[before][1] - score) <= Math.abs(controlScores[after][1] - score)) ? before : after;
                    matches.push(controlScores[index][0]);
                    controlScores[index] = null;
                }
            }
        }
        return matches;
    };
    /**
     * @summary Adaptive Synthetic Sampling
     *
     * @description This method creates new samples using a modified Adaptive Synthetic Sampling (ADASYN) approach, which belows to a family of Synthetic Minority Oversampling Technique (SMOTE).
     * The algorithm automatically identify the majority class and the minority classes, based on the values of the outcome variable.
     * It proceeds to build a kNN model in order to identify the nearest neighbors around each minority sample. It synthesizes new samples that are similar, but not identical to those minority samples by adding random noises.
     *
     * This implemention represents an improvement over vanilla ADASYN algorithm by enabling synthesis of categorical features and by considering the Euclidean distance between the samples,
     * in addition to their distributin densities.
     *
     * @param {object[]} subjects - The subjects to be processed.
    *  @param {string} outcome - A categorical outcome used to determine class membership.
     * @param {string[]} numericals - An array of numerical features to synthesize.
     * @param {string[]} categoricals - An array of categorical features to synthesize.
     * @param {number} [ratio=1] - The minimal ratio between the majority class and the minority class. Default to 1, which means the classes will be perfectly balanced.
     * @param {number} [k=5] - The number of neighbors to consider. Default to 5.
     * @param {any} [kNN=DRESS.kNN] - A kNN algorithm. Default to DRESS.kNN
     *
     * @returns - An array of newly synthesized samples.
     */
    DRESS.adaptiveSynthesis = (subjects, outcome, numericals, categoricals, ratio = 1, k = 5, kNN = DRESS.kNN) => {
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
        const minorities = [...classes.entries()].sort((a, b) => a[1].length - b[1].length);
        const majority = minorities.pop();
        // Build a kNN model
        const model = kNN(subjects, numericals, categoricals, true);
        const synthetics = [];
        minorities.map(minority => {
            const G = (majority[1].length * ratio - minority[1].length);
            if (G > 0) {
                const subjects = minority[1];
                const numSubject = subjects.length;
                const neighborhoods = new Array(numSubject).fill(null).map(_ => new Array());
                const Rs = new Array(numSubject).fill(0);
                let R = 0;
                let i = numSubject;
                while (i--) {
                    // Get nearest k subjects       
                    const nearests = model.nearest(subjects[i], k);
                    let j = nearests.length;
                    while (j--) {
                        const cls = DRESS.categoric(DRESS.get(nearests[j][0][0], outcome));
                        if (cls === minority[0]) {
                            // Add minority subject to neighborhoods
                            neighborhoods[i].push(nearests[j][0][0]);
                        }
                        else {
                            // Add inversed distance to Rs
                            Rs[i] += 1 / (nearests[j][1] + 1);
                        }
                    }
                    R += Rs[i];
                }
                i = numSubject;
                while (i--) {
                    // Number of synthetics to be made in this neighorhoods
                    let j = Math.round(R ? G * Rs[i] / R : G / numSubject);
                    while (j--) {
                        // Pick a random neighbor
                        const subject = subjects[i];
                        const neighbor = neighborhoods[i][Math.floor(neighborhoods[i].length * DRESS.random())];
                        const synthetic = {};
                        numericals.map(numerical => {
                            const rand = DRESS.random();
                            // Pick a random point between the subject and the random neighbor
                            DRESS.set(synthetic, numerical, DRESS.numeric(DRESS.get(subject, numerical)) * rand + DRESS.numeric(DRESS.get(neighbor, numerical)) * (1 - rand));
                        });
                        categoricals.map(categorical => {
                            // Pick a categorical value randomly.
                            DRESS.set(synthetic, categorical, (DRESS.random() > 0.5) ? DRESS.get(subject, categorical) : DRESS.get(neighbor, categorical));
                        });
                        DRESS.set(synthetic, outcome, minority[0]);
                        synthetics.push(synthetic);
                    }
                }
            }
        });
        return synthetics;
    };
})(DRESS || (DRESS = {}));
