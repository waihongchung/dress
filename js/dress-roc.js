var DRESS;
(function (DRESS) {
    /**
     * @summary Generate a nonparametric receiver operating characteristic curve based on one or more numerical classifiers.
     *
     * @description This method builds a nonparametric receiver operating characteristic curve for each numerical classifier in relation to the outcomes.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had a UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and classifier should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive outcome
     * is defined as a non-empty array, while the length of the array is considered as the value of the classifier.
     * If the property is not an array, then it would be converted to a numeric value and a positive outcome is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} classifiers - An array of classifiers to be analyzed.
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcomes (the array of outcomes that defines an event),
     *   - classifiers (an array of classifiers, each containing the following properties),
     *   > - classifier (the classifier being considered),
     *   > - coordinates (the x,y coordinates of the ROC curve for plotting purposes),
     *   > - auc (the area under the curve, or C-statistics),
     *   > - ci (AUC confidence interval),
     *   > - z (z score),
     *   > - p (p-value of AUC != 0.5)
     *   > - cutoff (optimal cutoff value based on Youden's Index),
     *   > - tpr (true positive rate at the optimal cutoff),
     *   > - tnr (true negative rate at the optimal cutoff),
     *   > - text.
     *   - text.
     */
    DRESS.roc = (subjects, outcomes, classifiers) => {
        let XY;
        if (Array.isArray(subjects)) {
            XY = DRESS.tabulate(subjects, classifiers, [], [(subject) => +outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome)))]);
        }
        else if (typeof subjects['predictions'] === 'object') {
            XY = subjects['predictions'];
        }
        else {
            return null;
        }
        const padding = DRESS.longest(classifiers);
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        const numRow = XY.length;
        const numClassifier = classifiers.length;
        const Y0L = XY.filter(row => !row[numClassifier]).length;
        const Y1L = numRow - Y0L;
        return {
            outcomes: outcomes,
            classifiers: classifiers.map((classifier, c) => {
                const points = [[0, 0, 0, Number.NEGATIVE_INFINITY]];
                XY.sort((a, b) => a[c] - b[c]);
                let k = numRow;
                let point = points[0];
                while (k--) {
                    const row = XY[k];
                    if (point[3] !== row[c]) {
                        points.push(point = [point[0], point[1], 0, row[c]]);
                    }
                    point[row[numClassifier]] += 1;
                }
                k = points.length;
                point = points[k - 1];
                let auc = 0;
                while (--k) {
                    const pointK = points[k];
                    pointK[2] = (pointK[1] /= Y1L) /* TPR */ - (pointK[0] /= Y0L) /* FPR */;
                    auc += (point[0] - pointK[0]) * (point[1] + pointK[1]) / 2;
                    point = pointK;
                }
                auc += point[0] * point[1] / 2;
                points.shift();
                //
                const se = Math.sqrt((auc * (1 - auc) + (Y1L - 1) * (auc / (2 - auc) - auc * auc) + (Y0L - 1) * (2 * auc * auc / (1 + auc) - auc * auc)) / (Y1L * Y0L));
                const z = (auc - 0.5) / se;
                const p = DRESS.norm(z);
                const ci = [auc - zCI * se, auc + zCI * se];
                const threshold = points.sort((a, b) => b[2] - a[2])[0];
                const coordinates = points.map(point => [point[0], point[1]]);
                return {
                    classifier,
                    coordinates,
                    auc,
                    ci,
                    z,
                    p,
                    cutoff: threshold[3],
                    tpr: threshold[1],
                    tnr: 1 - threshold[0],
                    text: DRESS.pad(classifier, padding) + ': ' + DRESS.clamp(auc) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                        + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        + '	cutoff: ' + DRESS.clamp(threshold[3]) + '	tpr: ' + DRESS.clamp(threshold[1]) + '	tnr: ' + DRESS.clamp(1 - threshold[0])
                };
            }),
            text: '[' + outcomes.join(' + ') + ']'
        };
    };
    /**
     * @summary Generate a nonparametric precision-recall curve based on one or more numerical classifiers.
     *
     * @description This method builds a nonparametric precision-recall curve for each numerical classifier in relation to the outcomes.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had a UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and classifier should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive outcome
     * is defined as a non-empty array, while the length of the array is considered as the value of the classifier.
     * If the property is not an array, then it would be converted to a numeric value and a positive outcome is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} classifiers - An array of classifiers to be analyzed.
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcomes (the array of outcomes that defines an event),
     *   - classifiers (an array of classifiers, each with the following properties),
         > - classifier (the classifier being considered),
     *   > - coordinates (the x,y coordinates of the PR curve for plotting purposes),
     *   > - auc (the area under the curve, or C-statistics),
     *   > - ci (AUC confidence interval),
     *   > - z (z score),
     *   > - p (p-value of AUC != 0.5)
     *   > - cutoff (optimal cutoff value based on F1 score),
     *   > - tpr (true positive rate or recall at the optimal cutoff),
     *   > - ppv (positive predictive value or precision at the optimal cutoff),
     *   > - text.
     *   - text.
     */
    DRESS.pr = (subjects, outcomes, classifiers) => {
        let XY;
        if (Array.isArray(subjects)) {
            XY = DRESS.tabulate(subjects, classifiers, [], [(subject) => +outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome)))]);
        }
        else if (typeof subjects['predictions'] === 'object') {
            XY = subjects['predictions'];
        }
        else {
            return null;
        }
        const padding = DRESS.longest(classifiers);
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        const numRow = XY.length;
        const numClassifier = classifiers.length;
        const Y0L = XY.filter(row => !row[numClassifier]).length;
        const Y1L = numRow - Y0L;
        return {
            outcomes: outcomes,
            classifiers: classifiers.map((classifier, c) => {
                const points = [[0, 0, 0, Number.NEGATIVE_INFINITY]];
                XY.sort((a, b) => a[c] - b[c]);
                let k = numRow;
                let point = points[0];
                while (k--) {
                    const row = XY[k];
                    if (point[3] !== row[c]) {
                        points.push(point = [point[0], point[1], 0, row[c]]);
                    }
                    point[row[numClassifier]] += 1;
                }
                k = points.length;
                point = points[k - 1];
                let auc = 0;
                while (--k) {
                    const pointK = points[k];
                    pointK[0] = pointK[1] / (pointK[0] + pointK[1] + Number.EPSILON); /* PPV */
                    pointK[1] /= Y1L; /* TPR */
                    pointK[2] = 2 * pointK[0] * pointK[1] / (pointK[0] + pointK[1] + Number.EPSILON);
                    auc += (point[1] - pointK[1]) * (point[0] + pointK[0]) / 2;
                    point = pointK;
                }
                auc += point[1] * (point[0] + 1) / 2;
                points.shift();
                //                
                const mu = Math.log(auc / (1 - auc));
                const tau = zCI / Math.sqrt(Y1L * auc * (1 - auc));
                const ci = [Math.exp(mu - tau) / (1 + Math.exp(mu - tau)), Math.exp(mu + tau) / (1 + Math.exp(mu + tau))];
                const se = (ci[1] - ci[0]) / (2 * zCI);
                const z = (auc - Y1L / numRow) / se;
                const p = DRESS.norm(z);
                const threshold = points.sort((a, b) => b[2] - a[2])[0];
                const coordinates = points.map(point => [point[1], point[0]]);
                return {
                    classifier,
                    coordinates,
                    auc,
                    ci,
                    z,
                    p,
                    cutoff: threshold[3],
                    tpr: threshold[1],
                    ppv: threshold[0],
                    text: DRESS.pad(classifier, padding) + ': ' + DRESS.clamp(auc) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                        + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        + '	cutoff: ' + DRESS.clamp(threshold[3]) + '	tpr: ' + DRESS.clamp(threshold[1]) + '	ppv: ' + DRESS.clamp(threshold[0])
                };
            }),
            text: '[' + outcomes.join(' + ') + ']'
        };
    };
})(DRESS || (DRESS = {}));
