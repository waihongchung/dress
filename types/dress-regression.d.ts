declare namespace DRESS {
    type Regression = (typeof DRESS.logistic | typeof DRESS.linear | typeof DRESS.polytomous);
    /**
     * @summary Multiple logistic regressions.
     *
     * @description This method builds a statistical model to predict the occurrence of an event based on a list of features.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had a UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive outcome is defined as a non-empty array, while the length of the array is used as the value of the feature.
     * If the property is not an array, then it would be converted to a numeric value and a positive outcome is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters include number of iteration (iteration), learning rate (learning), and regularization strength (regularization).
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcomes (the array of outcomes that defines an event),
     *   - deviance (the statistical deviance, or chi-square value of the model),
     *   - r2 (the McFadden pseudo-R2 value of the model),
     *   - aic (the Akaike Information Criteria of the model),
     *   - p (p-value, based on deviance),
     *   - features (an array of features containing the following properties),
     *   > - feature (the feature being considered),
     *   > - coefficient (the regression coefficient),
     *   > - z (z score),
     *   > - p (p-value),
     *   > - oddsRatio (oddsRatio),
     *   > - ci (confidence interval),
     *   > - text.
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model)
     *   - estimate (a method for computing an estimate, probability of the outcome being true, based on the model, accepts one subject as a parameter)
     *   - predict (a method for making a prediction based on the model, accepts one subject and a threshold probability, default is 0.5, as parameters),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the classification accuracy of the model, accepts an array of subjects and a threshold probability, default is 0.5, as parameters).
     */
    export const logistic: (subjects: object | object[], outcomes?: string[], features?: string[], hyperparameters?: {
        iteration?: number;
        learning?: number;
        regularization?: number;
    }) => {
        async: string;
        /**
         * @summary Fit the prepopulated X and Y arrays to the existing model.
         *
         * @param {number[][]} X
         * @param {number[]} Y
         */
        fit(X: number[][], Y: number[]): void;
        /**
         * @sumarry Train one or more subjects against the existing model.
         *
         * @param {object[]} subjects - The subjects to be processed.
         */
        train(subjects: object[]): void;
        /**
         * @summary Compute an estimate based on the model
         *
         * @description This method computes an estimate, probability of the outcome being positive, based on the model.
         *
         * @param {object} subject - A test subject.
         *
         * @returns {number} The outcome estimate.
         */
        estimate(subject: object): number;
        /**
         * @summary Make a prediction based on the model
         *
         * @description This method computes the predicted outcome based on a test subject.
         *
         * @param {object} subject - A test subject
         * @param {number} [threshold=0.5] - The probability threshold above which the predicted outcome is considered positive.
         *
         * @returns {number} The predicted outcome
         */
        predict(subject: object, threshold?: number): number;
        /**
         * @summary Compute the area under the curve for a classification model.
         *
         * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
         *
         * @param {object[]} subjects - An array of test subjects
         * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
         *
         * @returns A ROC or PR curve
         */
        auc(subjects: object[], curve?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
        }): {
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
         * @summary Validate the performance of the model.
         *
         * @description This method computes the accuracy of the model based on the specified test subjects and a specified threshold.
         *
         * @param {object[]} subjects - An array of test subjects
         * @param {number} [threshold=0.5] - The probability threshold above which the predicted outcome is considered positive.
         *
         * @returns The performance of the model.
         */
        validate(subjects: object[], threshold?: number): {
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
            accuracy: number;
            balanced: number;
            f1: number;
            text: string;
        };
        outcomes: string[];
        count: number;
        classes: any;
        deviance: number;
        r2: number;
        aic: number;
        p: number;
        features: {
            feature: string;
            mean: number;
            deviation: number;
            coefficient: number;
            oddsRatio: number;
            ci: number[];
            z: number;
            p: number;
            text: string;
        }[];
        hyperparameters: any;
        text: string;
    };
    /**
     * @summary Polytomous Logistic Regression
     *
     * @description This method builds a polytomous (or multinomial) classification model based on logistic regression on a list of features.
     * The outcome must be a categorical feature with two or more possible values. For instance, the outcome of 'smoking history' may be one of three values: 'current', 'former', and 'never'.
     * An outcome cannot be an array. Each outcome and feature should be a property of the subject or be accessible using the dot notation.  All features must be numerical.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcome - The outcome of the model.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters to be passed to the logistic regression algorithm.
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcome (the outcome of the model),
     *   - deviance (the statistical deviance, or chi-square value of the model),
     *   - r2 (the McFadden pseudo-R2 value of the model),
     *   - aic (the Akaike Information Criteria of the model),
     *   - p (p-value, based on deviance),
     *   - classes (a list of distinct classes)
     *   - features (an array of features, each containing the following properties),
     *   > - feature (the feature being considered),
     *   > - coefficients (the regression coefficients),
     *   > - p (p-value),
     *   > - text.
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model)
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the classification accuracy of the model, accepts an array of subjects as a parameter).
     */
    export const polytomous: (subjects: object | object[], outcome?: string, features?: string[], hyperparameters?: {
        iteration?: number;
        learning?: number;
        regularization?: number;
    }) => {
        async: string;
        /**
         * @summary Fit the prepopulated X and Y arrays to the existing model.
         *
         * @param {number[][]} X
         * @param {string[]} Y
         */
        fit(X: number[][], Y: string[]): void;
        /**
         * @sumarry Train one or more subjects against the existing model.
         *
         * @param {object[]} subjects - The subjects to be processed.
         */
        train(subjects: object | object[]): void;
        /**
         * @summary Compute the probabilities of each class for a test subject.
         *
         * @description This method computes the probabilities of each possible outcome with respect to the test subject.
         *
         * @param {object} subject - A test subject
         *
         * @returns {number[]} The predicted probability estimates.
         */
        estimate(subject: object): number[];
        /**
         * @summary Make a prediction based on the model
         *
         * @description This method computes the predicted outcome based on a test subject.
         *
         * @param {object} subject - A test subject
         *
         * @returns {number} The predicted outcome
         */
        predict(subject: object): any;
        /**
         * @summary Compute the area under the curve for a classification model.
         *
         * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
         *
         * @param {object[]} subjects - An array of test subjects
         * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
         *
         * @returns A ROC or PR curve
         */
        auc(subjects: object[], curve?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
        }): {
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
        }[];
        /**
         * @summary Validating the performance of the model.
         *
         * @description This method computes the accuracy of the model based on the specified test subjects.
         *
         * @param {object[]} subjects - An array of test subjects
         *
         * @returns The performance of the model.
         */
        validate(subjects: object[]): {
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
            accuracy: number;
            balanced: number;
            f1: number;
            text: string;
        } | {
            r2: number;
            mae: number;
            rmse: number;
            text: string;
        };
        outcome: string;
        count: number;
        classes: string[];
        deviance: number;
        r2: number;
        aic: number;
        p: number;
        features: {
            feature: string;
            mean: number;
            deviation: number;
            coefficients: number[];
            p: number;
            text: string;
        }[];
        hyperparameters: any;
        text: string;
    };
    /**
     * @summary Multiple linear regressions.
     *
     * @description This method builds a statistical model to predict the outcome values based on a list of features.
     * Each outcome and feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the outcome/feature.
     * If the property is not an array, then it would be converted to a numeric value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string} outcome - The outcome to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters include number of iteration (iteration), learning rate (learning), and regularization strength (regularization).
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcome (the outcome),
     *   - r2 (the R2 value of the model),
     *   - f (the F statistic of the model),
     *   - p (p-value, based on deviance),
     *   - features (an array of features containing the following properties),
     *   > - feature (the feature being considered),
     *   > - coefficient (the regression coefficient),
     *   > - t (t score),
     *   > - p (p-value),
     *   > - ci (confidence interval),
     *   > - text.
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model)
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - validate (a method for validating the regression accuracy of the model, accepts an array of subjects as a parameter).
     */
    export const linear: (subjects: object | object[], outcome?: string, features?: string[], hyperparameters?: {
        iteration?: number;
        learning?: number;
        regularization?: number;
    }) => {
        async: string;
        /**
         * @summary Fit the prepopulated X and Y arrays to the existing model.
         *
         * @param {number[][]} X
         * @param {number[]} Y
         */
        fit(X: number[][], Y: number[]): void;
        /**
         * @sumarry Train one or more subjects against the existing model.
         *
         * @param {object[]} subjects - The subjects to be processed.
         */
        train(subjects: object[]): void;
        /**
         * @summary Compute one or more outcome estimates based on the model.
         *
         * @description This method computes an array of outcome estimates on the model.
         *
         * @param {object} subject - A test subject.
         *
         * @returns {number} The outcome estimates.
         */
        estimate(subject: object): number[];
        /**
         * @summary Make a prediction based on the model
         *
         * @description This method computes the predicted outcome based on a test subject.
         *
         * @param {object} subject - A test subject
         *
         * @returns {number} The predicted outcome
         */
        predict(subject: object): number;
        /**
         * @summary Compute the area under the curve for a classification model.
         *
         * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
         *
         * @param {object[]} subjects - An array of test subjects
         * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
         *
         * @returns A ROC or PR curve
         */
        auc(subjects: object[], curve?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
        }): {
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
        }[];
        /**
         * @summary Validating the performance of the model.
         *
         * @description This method computes the accuracy of the model based on the specified test subjects.
         *
         * @param {object[]} subjects - An array of test subjects
         *
         * @returns The performance of the model.
         */
        validate(subjects: object[]): {
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
            accuracy: number;
            balanced: number;
            f1: number;
            text: string;
        } | {
            r2: number;
            mae: number;
            rmse: number;
            text: string;
        };
        outcome: string;
        count: number;
        classes: any;
        r2: number;
        aic: number;
        f: number;
        p: number;
        features: {
            feature: string;
            mean: number;
            deviation: number;
            coefficient: number;
            ci: number[];
            t: number;
            p: number;
            text: string;
        }[];
        hyperparameters: any;
        text: string;
    };
    /**
     * @summary Eliminate highly correlated features based on the variance inflation factor (VIF).
     *
     * @description This method iteratively computes the amount of collinearity (or multicollinearity) amongst a list of features based on the variance inflation factor (VIF).
     * The method eliminates the feature with the highest VIF that is above the specified cutoff value and repeats the process.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {number} [cutoff=5] - Default cutoff VIF value is 5.
     *
     * @returns {object} A result object containing the following properties:
     *   - steps (an array of elimination steps containing the following properties),
     *   > - features (an array of features being analyzed, each containing the following properties),
     *   >> - feature (name of feature),
     *   >> - vif (the variance inflation factor),
     *   > - text,
     *   - features (the final array of features after the elimination process).
     */
    export const collinearity: (subjects: object[], features: string[], cutoff?: number) => {
        steps: any[];
        features: string[];
        text: string;
    };
    /**
     * @summary Apply backward elimination algorithm on a set of features.
     *
     * @description This method applies the backward elimination feature selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accepts more than one feature can be used.
     *
     * The backward elimination algorithm starts with the full model and successively eliminates feature that has a p-value less than the significance cutoff, which is specified by the global variable DRESS.SIGNIFICANCE.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string | string[]} outcomes - An outcome or an array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     *
     * @returns {object} A result object containing the following properties:
     *   - steps (an array of elimination steps containing the following properties),
     *   > - features (an array of features being analyzed, each containing the following properties),
     *   >> - feature (name of feature)
     *   >> - p (p-value),
     *   > - text,
     *   - features (the final array of features after the elimination process),
     *   - model (the final regression model).
     
     */
    export const backward: (regression: Regression, subjects: object[], outcomes: string | string[], features: string[], ...rest: any[]) => {
        steps: any[];
        features: string[];
        model: any;
        text: string;
    };
    /**
     * @summary Apply forward selection algorithm on a set of features.
     *
     * @description This method applies the forward selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accepts more than one feature can be used.
     *
     * The forward selection algorithm starts with the null model and successively includes new features so that the Akaike Information Criteria (AIC) of the final model is minimized.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string | string[]} outcomes - An outcome or an array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     *
     * @returns {object} A result object containing the following properties:
     *   - steps (an array of selection steps containing the following properties),
     *   > - features (the features being analyzed),
     *   > - aic (the AIC of the model at the current step),
     *   > - text,
     *   - features (the final array of features after the selection process),
     *   - model (the final regression model).
     */
    export const forward: (regression: Regression, subjects: object[], outcomes: string | string[], features: string[], ...rest: any[]) => {
        steps: any[];
        features: any[];
        model: any;
        text: string;
    };
    export {};
}
