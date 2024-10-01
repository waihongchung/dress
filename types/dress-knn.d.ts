declare namespace DRESS {
    type Nearest = [
        neighbor: any[],
        distance: number
    ];
    /**
     * @summary Build a K-nearest-neighbor Model
     *
     * @description This method builds k-nearest neighbor imputation using a modified algorithm that accepts both numerical and categorical features as classifiers.
     * Each feature should be a property of the subject or be accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This algorithm takes into account the relative distribution of each categorical value and the absolute difference in the relative distribution between two categorical values is used to compute the Manhattan distance.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification. If the outcome is set as null, then the subject is used as the outcome value.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included importances (an array of relative importances of each feature).
     * It can be set to an array of numbers that is the same size as the total number of numerical and categorical classifiers.
     *
     * @returns {object[]} A K-nearest-neighbor model containing the following properties:
     *   - numericals (the numerical features used to create the model),
     *   - categoricals (the categorical features used to create the model),
     *   - importances (the relative importance of the features),
     *
     *   - train (a method for training additional subjects to the existing model),
     *   - predict (a method for making a prediction based on the model, accepts a subject, an outcome, a classification/regression flag, and the k-value as parameters),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects, and the k-value as parameters. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the model, accepts an array of subjects, an outcome, a classification/regression flag, and the k-value as parameters),
     *   - impute (a method for performing kNN imputation, accepts an array of subjects, an array of features, a categorical/numerical flag, and the k-value as parameters),
     *   - match (a method for performing kNN matching with the subjects used to build the model are considered as controls. The method accepts an array of samples, the k-value, and a greedy/optimal search flag).
     */
    export const kNN: (subjects: object | object[], outcome?: string, numericals?: string[], categoricals?: string[], classification?: boolean, hyperparameters?: {
        importances?: number[];
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
         * @summary Locate the k-nearest neighbor(s) within the model for the specified test subject.
         *
         * @param {object} subject - The test subject.
         * @param {number} [k=5]  - The number of neighbors to locate. Default to 5.
         *
         * @returns {[object, number][]} An array containing the k-nearest neighbor(s) and the corresponding distance measurement(s).
         */
        nearest(subject: object, k?: number): Nearest[];
        /**
         * @summary Obtain the votes from the nearest neighbors.
         *
         * @description This method computes a prediction (a vote) from the k-neasest neighbors within the model.
         *
         * @param {object} subject - A test subject.
         * @param {number} [k=5] - The number of neighbors to consider. Default to 0, which uses the Sturges' rule.
         * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
         *
         * @returns {[any[], number[]]} An array of votes and the associated weights of the votes.
         */
        vote(subject: object, k?: number, unweighted?: boolean): [outcomes: any[], weights: number[]];
        /**
         * @summary Compute one or more outcome estimates based on the model.
         *
         * @description This method computes an array of outcome estimates on the model.
         *
         * @param {object} subject - A test subject.
         * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
         * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
         *
         * @returns {number} The outcome estimates.
         */
        estimate(subject: object, k?: number, unweighted?: boolean): number[];
        /**
         * @summary Make a prediction based on the model
         *
         * @description This method computes the predicted outcome based on a test subject.
         *
         * @param {object} subject - A test subject.
         * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
         * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
         *
         * @returns {number} The predicted outcome.
         */
        predict(subject: object, k?: number, unweighted?: boolean): any;
        /**
         * @summary Compute the area under the curve for a classification model.
         *
         * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
         *
         * @param {object[]} subjects - An array of test subjects
         * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
         * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
         * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
         *
         * @returns A ROC or PR curve
         */
        auc(subjects: object[], k?: number, unweighted?: boolean, curve?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
         * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
         * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
         *
         * @returns The performance of the model.
         */
        validate(subjects: object[], k?: number, unweighted?: boolean): {
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
        numericals: string[];
        categoricals: string[];
        classes: string[];
        numericalScales: [min: number, max: number][];
        categoricalScales: [category: string, count: number][][];
        neighbors: any[][];
        hyperparameters: any;
        text: string;
    };
    export {};
}
