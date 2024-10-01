declare namespace DRESS {
    type Layer = [
        W: number[][],
        mW: number[][],
        vW: number[][],
        B: number[],
        mB: number[],
        vB: number[],
        Z: number[],
        pA: number[],
        dA: number[],
        size: number,
        pSize: number,
        g: number
    ];
    /**
     * @summary Build a Multilayer Perceptron.
     *
     * @description This method builds a basic feedforward artificial neural network, also known as a multilayer perceptron. It can be used for either classification or regression purposes.
     * The network is trained on the specified subjects and the specified numerical features. Each feature/outcome should be a property of the subject or be accessible using the dot notation.
     * If a feature/outcome is an array, then the length of the array is used for computation.
     *
     * The neural network uses the ADAM optimizer and supports the following activation functions in the hidden layers: relu (0), leaky relu (1), sigmoid (2), tanh (3), linear (4), and softmax (5).
     * By default, the network contains one input layer (the size of which is the same as the number of features) and one output layer (the size of which is dependent on the number of classes in a classification model, or 1 in a regression model).
     * The network also contains two hidden layers (the size of which are set heuristically based on the number of features and output). The layout of the hidden layers can be set as a numerical array in the hyperparameter.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} features - An array of features to be used as classifiers/regressors.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included alpha (ADAM optimizer), beta1 (ADAM optimizer), beta2 (ADAM optimizer), layout (the size of each layer), activator, epoch, and dropout.
     * @returns A multilayer perceptron containing the following properties:
     *   - seed (the randomly generated seed value),
     *   - outcome (the outcome of the model),
     *   - features (the features used to create the model),
     *   - layers (an array of layers of neurons),
     *   - classes (a list of distinct classes, only available in a classification model),
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model),
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the mode, accepts an array of subjects as a parameter).
     */
    export const multilayerPerceptron: (subjects: object | object[], outcome?: string, features?: string[], classification?: boolean, hyperparameters?: {
        alpha?: number;
        beta1?: number;
        beta2?: number;
        epoch?: number;
        dropout?: number;
        layout?: number[];
        activator?: number;
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
         * @summary Apply the feature values of one subject through the forward pass of the neural network.
         *
         * @description This method scales the feature values of one subject, and applies the scaled values through the forward pass of the neural network.
         *
         * @param {object} subject - A test subject.
         *
         * @returns {any[]} The output values of the neural network.
         */
        forward(subject: object[]): any;
        /**
         * @summary Compute one or more outcome estimates based on the model.
         *
         * @description This method computes an array of outcome estimates on the model.
         *
         * @param {object} subject - A test subject.
         *
         * @returns {number} The outcome estimates.
         */
        estimate(subject: object): any;
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
         * @summary Validate the performance of the model.
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
        features: string[];
        classes: string[];
        scales: [min: number, max: number][];
        layers: Layer[];
        hyperparameters: any;
        text: string;
    };
    export {};
}
