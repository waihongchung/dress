declare namespace DRESS {
    type Tree = [
        feature: number,
        cutoff: any,
        impurity: number,
        left: Tree,
        right: Tree
    ];
    /**
     * @summary Build a Random Forest model
     *
     * @description This method builds a random forest model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation. An outcome cannot be an array.
     *
     * Internally, this method implements the extremely randomized tree (ExtraTrees) algorithm instead of the true random forest algorithm to reduce computational complexity.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minimal node size (size), maximal tree depth (depth), number of trees (tree), and sampling rate (sampling).
     * @returns {object} A random forest model containing the following properties:
     *   - seed (the randomly generated seed value),
     *   - outcome (the outcome of the model),
     *   - numericals (the numerical features used to create the model),
     *   - categoricals (the categorical features used to create the model),
     *   - classes (a list of distinct classes, only available in a classification model),
     *   - trees (an array of decision trees),
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model),
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the mode, accepts an array of subjects as a parameter).
     */
    export const randomForest: (subjects: object | object[], outcome?: string, numericals?: string[], categoricals?: string[], classification?: boolean, hyperparameters?: {
        size?: number;
        depth?: number;
        tree?: number;
        sampling?: number;
        attempt?: number;
    }) => {
        async: string;
        /**
         * @summary Fit the prepopulated X and Y arrays to the existing model.
         *
         * @param {any[][]} X
         * @param {any[]} Y
         */
        fit(X: any[][], Y: any[]): void;
        /**
         * @sumarry Train one or more additional subjects against the existing model.
         *
         * @param {object[]} subjects - The subjects to be processed.
         */
        train(subjects: object[]): void;
        /**
         * @summary Obtain a vote from every tree within the model
         *
         * @description This method computes a prediction (a vote) from each tree within the model.
         *
         * @param {object} subject - A test subject.
         *
         * @returns {any[]} An array of votes.
         */
        vote(subject: object): any[];
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
         * @param {object} subject - A test subject.
         *
         * @returns {number} The predicted outcome.
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
        seed: number;
        outcome: string;
        numericals: string[];
        categoricals: string[];
        classes: string[];
        trees: Tree[];
        hyperparameters: any;
        text: string;
    };
    /**
     * @summary Build a Stochastic Gradient Boosting model
     *
     * @description This method builds a stochastic gradient boosting model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation. An outcome cannot be an array.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minimal node size (size), maximal tree depth (depth), number of trees (tree), sampling rate (sampling), and learning rate (learning).
     * @returns {object} A random forest model containing the following properties:
     *   - seed (the randomly generated seed value),
     *   - outcome (the outcome of the model),
     *   - numericals (the numerical features used to create the model),
     *   - categoricals (the categorical features used to create the model),
     *   - classes (a list of distinct classes, only available in a classification model),
     *   - trees (an array of decision trees),
     *
     *   - train (a method for training one or more subjects against the existing model),
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the mode, accepts an array of subjects as a parameter).
     */
    export const gradientBoosting: (subjects: object | object[], outcome?: string, numericals?: string[], categoricals?: string[], classification?: boolean, hyperparameters?: {
        size?: number;
        depth?: number;
        tree?: number;
        sampling?: number;
        learning?: number;
        attempt?: number;
    }) => {
        async: string;
        /**
         * @summary Fit the prepopulated X and Y arrays to the existing model.
         *
         * @param {any[][]} X
         * @param {any[]} Y
         */
        fit(X: any[][], Y: any[]): void;
        /**
         * @sumarry Train one or more additional subjects against the existing model.
         *
         * @param {object[]} subjects - The subjects to be processed.
         */
        train(subjects: object[]): void;
        /**
         * @summary Obtain a vote from every tree within the model
         *
         * @description This method computes a prediction (a vote) from each tree within the model.
         *
         * @param {object} subject - A test subject.
         *
         * @returns {any[]} An array of votes.
         */
        vote(subject: object, trees: Tree[]): any[];
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
         * @param {object} subject - A test subject.
         *
         * @returns {number} The predicted outcome.
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
        seed: number;
        outcome: string;
        numericals: string[];
        categoricals: string[];
        classes: string[];
        trees: Tree[][];
        hyperparameters: any;
        text: string;
    };
    export {};
}
