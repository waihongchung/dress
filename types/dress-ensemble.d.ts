declare namespace DRESS {
    interface Node {
        feature: number;
        cutoff: any;
        impurity: number;
        left: Node | number[];
        right: Node | number[];
    }
    /**
     * @summary Build a Random Forest model
     *
     * @description This method builds a random forest model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * Internally, this method implements the extremely randomized tree (ExtraTrees) algorithm instead of the true random forest algorithm in order to reduce computational complexity.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=true] - Model type. Default to classification. Set to false to build a regression model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minSize, maxDepth, numTree, and samplingRate.
     * @returns {object} A random forest model containing the following properties:
     *   seed (the random generate seed value),
     *   outcome (the outcome of the model),
     *   numericals (the numerical features used to create the model),
     *   categoricals (the categorical features used to create the model),
     *   classes (a list of distinct classes, only available in a classification model),
     *   trees (an array of decision trees),
     *   impurity (the overall impurity of the model),
     *   text,
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects as a parameter),
     *   importance (a method for reporting feature importance).
     */
    export let randomForest: (subjects: object | object[], outcome: string, numericals: string[], categoricals: string[], classification?: boolean, hyperparameters?: any) => {
        seed: number;
        outcome: string;
        numericals: string[];
        categoricals: string[];
        classes: string[];
        trees: Node[];
        impurity: number;
        text: string;
        predict(subject: object): any;
        roc(subjects: object[], roc?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
        }): any;
        performance(subjects: object[]): {
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
        } | {
            r2: number;
            mae: number;
            rmse: number;
            text: string;
        };
        importance(): {
            feature: any;
            value: number;
            text: string;
        }[];
    };
    /**
     * @summary Build a Stochastic Gradient Boosting model
     *
     * @description This method builds a stochastic gradient boosting model, either a classification model or a regression model, trained on the specified subjects and the specified numerical and categorical features.
     * Each feature/outcome should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers/regressors.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers/regressors.
     * @param {boolean} [classification=true] - Model type. Default to classification. Set to false to build a regression model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included minSize, maxDepth, numTree, samplingRate, and learningRate.
     * @returns {object} A random forest model containing the following properties:
     *   seed (the random generate seed value),
     *   outcome (the outcome of the model),
     *   numericals (the numerical features used to create the model),
     *   categoricals (the categorical features used to create the model),
     *   classes (a list of distinct classes, only available in a classification model),
     *   trees (an array of decision trees),
     *   impurities (an array of impurity values used for computing feature importance),
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects as a parameter),
     *   importance (a method for reporting feature importance).
     */
    export let gradientBoosting: (subjects: object | object[], outcome: string, numericals: string[], categoricals: string[], classification?: boolean, hyperparameters?: any) => {
        seed: number;
        outcome: string;
        numericals: string[];
        categoricals: string[];
        classes: string[];
        trees: Node[][];
        impurities: number[][];
        text: string;
        predict(subject: object): any;
        roc(subjects: object[], roc?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
        }): any;
        performance(subjects: object[]): {
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
        } | {
            r2: number;
            mae: number;
            rmse: number;
            text: string;
        };
        importance(): {
            feature: any;
            value: number;
            text: string;
        }[];
    };
    export {};
}
