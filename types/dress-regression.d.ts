declare namespace DRESS {
    /**
     * @summary Multiple logistic regressions.
     *
     * @description This method builds a statistical model to predict the occurrence of an event based on a list of features.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then a positive outcome is defined as a non-empty array, while the length of the array is used as the value of the feature.
     * If the property is not an array, then it would be converted to a numeric value and a positive outcome is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @returns {object} A result object, containing the following properties:
     *   outcomes (the array of outcomes that defines an event),
     *   deviance (the statistical deviance, or chi-square value of the model),
     *   r2 (the McFadden pseudo-R2 value of the model),
     *   aic (the Akaike Information Criteria of the model),
     *   p (p value, based on deviance),
     *   features (an array of features),
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the classification accuracy of the model, accepts an array of subjects and a threshold probability, default is 0.5, as parameters).
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      z (z score),
     *      p (p value),
     *      oddsRatio (oddsRatio),
     *      ci (confidence interval),
     *      text.
     */
    let logistic: (subjects: object | object[], outcomes: string[], features: string[]) => {
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
        text: string;
        predict(subject: object): number;
        roc(subjects: object[], roc?: any): any;
        performance(subjects: object[], threshold?: number): {
            accuracy: number;
            classes: {
                class: string;
                prevalence: number;
                tpr: number;
                tnr: number;
                ppv: number;
                npv: number;
                f1: number;
                text: string;
            }[];
            text: string;
        };
    };
    /**
     * @summary Multiple linear regressions.
     *
     * @description This method builds a statistical model to predict the outcome values based on a list of features.
     * Each outcome and feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the outcome/feature.
     * If the property is not an array, then it would be converted to a numeric value.
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
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   performance (a method for evaluting the regression accuracy of the model, accepts an array of subjects as a parameter).
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      t (t score),
     *      p (p value),
     *      ci (confidence interval),
     *      text.
     */
    let linear: (subjects: object | object[], outcome: string, features: string[], origin?: boolean) => {
        outcome: string;
        r2: number;
        ar2: number;
        aic: number;
        f: number;
        p: number;
        features: {
            feature: string;
            coefficient: number;
            t: number;
            p: number;
            ci: number[];
            text: string;
        }[];
        text: string;
        predict(subject: object): number;
        performance(subjects: object[]): {
            r2: number;
            mae: number;
            rmse: number;
            text: string;
        };
    };
    /**
     * @summary Simple polynomial regression.
     *
     * @description This method builds a statistical model to predict the outcome values based on a feature using a polynomial equation.
     * Each outcome and feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the outcome/feature.
     * If the property is not an array, then it would be converted to a numeric value.
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
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   performance (a method for evaluting the regression accuracy of the model, accepts an array of subjects as a parameter).
     *   For each feature, the following results are returned:
     *      feature (the feature being considered),
     *      coefficient (the regression coefficient),
     *      t (t score),
     *      p (p value),
     *      ci (confidence interval),
     *      text.
     */
    let polynomial: (subjects: object | object[], outcome: string, feature: string, degree: number, origin?: boolean) => {
        outcome: string;
        r2: number;
        ar2: number;
        aic: number;
        f: number;
        p: number;
        features: {
            feature: string;
            coefficient: number;
            t: number;
            p: number;
            ci: number[];
            text: string;
        }[];
        text: string;
        predict(subject: object): number;
        performance(subjects: object[]): {
            r2: number;
            mae: number;
            rmse: number;
            text: string;
        };
    };
}
