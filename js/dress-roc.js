var DRESS;
(function (DRESS) {
    /**
     * @summary Generate a nonparametic receiver operating characteristic curve based on one or more numerical classifiers.
     *
     * @description This method builds a nonparametric receiver operating characteristic curve for each numerical classifiers in relation to the outcomes.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and classifier should be a property of the subject or is accessible using the dot notation. If the property is an array, then a positive outcome
     * is defined as a non-empty array, while the length of the array is considered as the value of the classifier.
     * If the property is not an array, then it would be converted to a numeric value and a positive outcome is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} classifiers - An array of classifiers to be analyzed.
     * @returns {object} A result object, containing the following properties:
     *   outcomes (the array of outcomes that defines an event),
     *   classifiers (an array of classifiers),
     *   text.
     *   For each classifier, the following results are returned:
     *      classifier (the classifier being considered),
     *      roc (the x,y coordinates of the ROC curve for plotting purposes),
     *      auc (the area under the ROC curve, or C-statistics),
     *      ci (AUC confidence interval),
     *      z (z score),
     *      p (p value of AUC != 0.5)
     *      cutoff (optimal cutoff value based on Youden's Index),
     *      tpr (true positive rate or sensitivty at the optimal cutoff),
     *      tnr (true negative rate or specificity at the optimal cutoff),
     *      text.
     */
    DRESS.roc = (subjects, outcomes, classifiers) => {
        let YX;
        if (Array.isArray(subjects)) {
            YX = subjects.map(subject => [
                +outcomes.every(outcome => {
                    const value = DRESS.get(subject, outcome);
                    return Array.isArray(value) ? value.length : +value;
                }),
                ...classifiers.map(classifier => {
                    const value = DRESS.get(subject, classifier);
                    return Array.isArray(value) ? value.length : +value;
                })
            ]);
        }
        else if (typeof subjects['predictions'] === 'object') {
            YX = subjects['predictions'];
        }
        else {
            return null;
        }
        const pad = classifiers.reduce((max, classifier) => Math.max(max, classifier.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        const Y0L = YX.filter(yx => !yx[0]).length;
        const Y1L = YX.length - Y0L;
        return {
            outcomes: outcomes,
            classifiers: classifiers.map((classifier, i) => {
                const j = i + 1;
                const points = YX.sort((a, b) => b[j] - a[j]).reduce((points, yx) => {
                    let point = points[points.length - 1];
                    if (point[0] !== yx[j]) {
                        points.push(point = [yx[j], point[1], point[2], 0]);
                    }
                    point[yx[0] + 1] += 1;
                    return points;
                }, [[Number.POSITIVE_INFINITY, 0, 0, 0]]);
                //
                points.map(point => {
                    point[3] = (point[2] /= Y1L) - (point[1] /= Y0L);
                });
                //
                let auc = 0;
                points.reduce((a, b) => {
                    auc += (b[1] - a[1]) * (b[2] + a[2]) / 2;
                    return b;
                });
                //
                const se = Math.sqrt((auc * (1 - auc) + (Y1L - 1) * (auc / (2 - auc) - auc * auc) + (Y0L - 1) * (2 * auc * auc / (1 + auc) - auc * auc)) / (Y1L * Y0L));
                const z = (auc - 0.5) / se;
                const p = DRESS.norm(z);
                const ci = [auc - zCI * se, auc + zCI * se];
                const youden = points.sort((a, b) => b[3] - a[3])[0];
                const coordinates = points.map(point => [point[1], point[2]]);
                return {
                    classifier: classifier,
                    coordinates: coordinates,
                    auc: auc,
                    ci: ci,
                    z: z,
                    p: p,
                    cutoff: youden[0],
                    tpr: youden[2],
                    tnr: 1 - youden[1],
                    text: DRESS.padEnd(classifier, pad) + ': ' + DRESS.clamp(auc) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        + '	cutoff: ' + DRESS.clamp(youden[0]) + '	tpr: ' + DRESS.clamp(youden[2]) + '	tnr: ' + DRESS.clamp(1 - youden[1])
                };
            }),
            text: '[' + outcomes.join(', ') + ']'
        };
    };
})(DRESS || (DRESS = {}));
