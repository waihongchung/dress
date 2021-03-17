declare namespace DRESS {
    /**
     * @summary Generate a nonparametic receiver operating characteristic curve based on one or more binary classifiers.
     *
     * @description This method builds a nonparametric receiver operating characteristic curve for each continous or categorical classifiers in relation to the outcomes.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and classifier should be a property of the subject that is accessible directly by subject[outcome] or subject[classifier]. If the property is an array, then a positive outcome
     * is defined as a non-empty array, while the length of the array is considered as the value of the classifier. If the property is not an array, then a positive outcome is defined as any non-null value, while the numeric value of the classifier is used in computation.
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
    let roc: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
}
