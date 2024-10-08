declare namespace DRESS {
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
    const roc: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
        outcomes: string[];
        classifiers: {
            classifier: string;
            coordinates: number[][];
            auc: number;
            ci: number[];
            z: number;
            p: number;
            cutoff: number;
            tpr: number;
            tnr: number;
            text: string;
        }[];
        text: string;
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
    const pr: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
        outcomes: string[];
        classifiers: {
            classifier: string;
            coordinates: number[][];
            auc: number;
            ci: number[];
            z: number;
            p: number;
            cutoff: number;
            tpr: number;
            ppv: number;
            text: string;
        }[];
        text: string;
    };
}
