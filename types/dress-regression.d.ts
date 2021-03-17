declare namespace DRESS {
    /**
     * @summary Perform multiple logistic regressions.
     *
     * @description This method builds a statistical model to predict the occurrence of an event based on a list of features.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and feature should be a property of the subject that is accessible directly by subject[outcome] or subject[feature]. If the property is an array, then a positive outcome
     * is defined as a non-empty array, while the length of the array is used as the value of the feature. If the property is not an array, then a positive outcome is defined as any non-null value, while the numeric value of the feature is used in computation.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {any} [roc=null] - The method used to compute the ROC curve. Can be set to DRESS.roc (or another custom ROC generating method). Default to null.
     * @returns {object} A result object, containing the following properties:
     *   outcomes (the array of outcomes that defines an event),
     *   deviance (the statistical deviance, or chi-square value of the model),
     *   r2 (the McFadden pseudo-R2 value of the model),
     *   aic (the Akaike Information Criteria of the model),
     *   p (p value, based on deviance),
     *   features (an array of features),
     *   roc (the ROC curve),
     *   text.
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      z (z score),
     *      p (p value),
     *      oddsRatio (oddsRatio),
     *      ci (confidence interval),
     *      text.
     */
    let logistic: (subjects: object | object[], outcomes: string[], features: string[], roc?: any) => {
        outcomes: string[];
        deviance: number;
        r2: number;
        aic: number;
        p: number;
        features: {
            feature: string;
            coefficient: number;
            z: number;
            p: number;
            oddsRatio: number;
            ci: number[];
            text: string;
        }[];
        roc: any;
        text: string;
    };
    /**
     * @summary Perform multiple linear regressions.
     *
     * @description This method builds a statistical model to predict the outcome values based on a list of features.
     * Each outcome and feature should be a property of the subject that is accessible directly by subject[outcome] or subject[feature].
     * If the property is an array, then the length of the array is used as the value of the outcome/feature. If the property is not an array, then the numeric value of the outcome/feature is used in computation.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string} outcome - The outcome to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {boolean} [origin=false] - Force intercept to past through the origin. Default to false.
     * @returns {object} A result object, containing the following properties:
     *   outcome (the outcome),
     *   r2 (the R2 value of the model),
     *   ar2 (the adjusted R2 value of the model)
     *   f (the F statistic of the model),
     *   p (p value, based on deviance),
     *   features (an array of features),
     *   text.
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      t (t score),
     *      p (p value),
     *      ci (confidence interval),
     *      text.
     */
    let linear: (subjects: object | object[], outcome: string, features: string[], origin?: boolean) => object;
    /**
     * @summary Perform simple polynomial regressions.
     *
     * @description This method builds a statistical model to predict the outcome values based on a feature using a polynomial equation.
     * Each outcome and feature should be a property of the subject that is accessible directly by subject[outcome] or subject[feature].
     * If the property is an array, then the length of the array is used as the value of the outcome/feature. If the property is not an array, then the numeric value of the outcome/feature is used in computation.
     *
     * Internally, this method uses the linear regression method to perform the actual regression.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string} outcome - The outcome to be analyzed.
     * @param {string} feature - The feature to be analyzed.
     * @param {number} degree - The maximum degree of the polynomial.
     * @param {boolean} [origin=false] - Force intercept to past through the origin. Default to false.
     * @returns {object} A result object, containing the following properties:
     *   outcome (the outcome),
     *   r2 (the R2 value of the model),
     *   ar2 (the adjusted R2 value of the model)
     *   f (the F statistic of the model),
     *   p (p value, based on deviance),
     *   features (based on the degree of the polynomial),
     *   text.
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      t (t score),
     *      p (p value),
     *      ci (confidence interval),
     *      text.
     */
    let polynomial: (subjects: object | object[], outcome: string, feature: string, degree: number, origin?: boolean) => object;
}
