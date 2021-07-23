declare namespace DRESS {
    interface Layer {
        W: number[][];
        mW: number[][];
        vW: number[][];
        B: number[];
        mB: number[];
        vB: number[];
        Z: number[];
        pA: number[];
        dA: number[];
        size: number;
        pSize: number;
        g: number;
    }
    /**
     * @summary Build a Multilayer Perceptron.
     *
     * @description This method builds a basic feedforward artificial neural network, also known as a multilayer perceptron. It can be used for either classification or regression purposes.
     * The netowork is trained on the specified subjects and the specified numerical features. Each feature/outcome should be a property of the subject or is accessible using the dot notation.
     * If a feature/outcome is an array, then the length of the array is used for computation.
     *
     * The neural network uses the ADAM optimizer and supports the following activation functions in the hidden layers: relu, leaky relu, sigmoid, tanh, and linear.
     * By default, the network contains one input layer (the size of which is the same as the number of features), one output layer (the size of which is dependent on the number of classes in a classification model, or 1 in a regression model).
     * The network also contains two hidden layers (the size of which are set heuristically based on the number of features and output). The layout of the hidden layers can be set as a numerical array in the hyperparameter.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} features - An array of features to be used as classifiers/regressors.
     * @param {boolean} [classification=true] - Model type. Default to classification. Set to false to build a regression model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included alpha, beta1, beta2, layout, activator, and epoch.
     * @returns A multilayer preceptron containing the following properties:
     *   seed (the random generate seed value),
     *   outcome (the outcome of the model),
     *   features (the features used to create the model),
     *   layers (an array of layers of neurons),
     *   classes (a list of distinct classes, only available in a classification model),
     *   text.
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects as a parameter).
     */
    export let neuralNetwork: (subjects: object | object[], outcome: string, features: string[], classification: boolean, hyperparameters?: any) => {
        seed: number;
        outcome: string;
        features: string[];
        layers: Layer[];
        classes: string[];
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
    };
    export {};
}
