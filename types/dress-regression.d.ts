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
        roc(subjects: object[], roc?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
            outcomes: string[];
            classifiers: {
                classifier: string;
                coordinates: number[][];
                auc: number;
                ci: number[];
                z: number;
                p: any;
                cutoff: number;
                tpr: number;
                tnr: number;
                text: string;
            }[];
            text: string;
        }): {
            outcomes: string[];
            classifiers: {
                classifier: string;
                coordinates: number[][];
                auc: number;
                ci: number[];
                z: number;
                p: any;
                cutoff: number;
                tpr: number;
                tnr: number;
                text: string;
            }[];
            text: string;
        };
        performance(subjects: object[], threshold?: number): {
            accuracy: number;
            classes: {
                class: string;
                prevalence: number;
                tpr: number;
                tnr: number;
                ppv: number; /**
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
    /**
     * @summary Apply backward elimination algorithm on a set of features.
     *
     * @description This method applies the backward elimination feature selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accept more than one features can be used.
     *
     * The backward elimination algorithm starts with the full model and successively eliminates feature that has a p-value less thhan the significance cutoff, which is specified by the global variable DRESS.SIGNIFICANCE.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     * @returns {object} A result object containing the following properties:
     *   steps (the features analyzed during each step of the elimination process),
     *   model (the final regression model).
     *   For each step, the following results are returned:
     *     features (the features being analyzed),
     *     ps (the p-values of each feature),
     *     text.
     */
    let backward: (regression: any, subjects: object[], outcomes: string[], features: string[], ...rest: any[]) => {
        steps: any[];
        model: any;
        text: string;
    };
    /**
     * @summary Apply forward selection algorithm on a set of features.
     *
     * @description This method applies the forward selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accept more than one features can be used.
     *
     * The forward selection algorithm starts with the null model and successively includes new feature so that the Akaike Information Criteria (AIC) of final model is minimized.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An outcome or an array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     * @returns {object} A result object containing the following properties:
     *   steps (the features included during each step of the selection process),
     *   model (the final regression model).
     *   For each step, the following results are returned:
     *     features (the features being analyzed),
     *     aic (the AIC of model at the current step),
     *     text.
     */
    let forward: (regression: any, subjects: object[], outcomes: string | string[], features: string[], ...rest: any[]) => {
        steps: any[];
        model: any;
        text: string;
    };
}
