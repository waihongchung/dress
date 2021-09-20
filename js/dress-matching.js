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
        const controlScores = new Array(numControl);
        i = numControl;
        while (i--) {
            controlScores[i] = [controls[i], model.predict(controls[i])];
        }
        subjectScores.sort((a, b) => a[1] - b[1]);
        controlScores.sort((a, b) => a[1] - b[1]);
        controlScores.push([{}, Number.POSITIVE_INFINITY]);
        const matches = [];
        if (!greedy) {
            const pairings = new Array(numControl);
            let i = numControl;
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
                    ;
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
})(DRESS || (DRESS = {}));
