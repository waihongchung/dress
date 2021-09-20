declare namespace DRESS {
    /**
     * @summary Build a K-nearest-neighbor Model
     *
     * @description This method builds k-nearest neighbor imputation using a modified algorithm that accepts both numerical and categorical features as classifiers.
     * Each feature should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This algorithm takes into account the relative distribution of each categorical value and the absolute difference in the relative distribution between two categorical values is used to compute the Manhattan distance.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers.
     * @param {boolean} [normalize=true] - Normalize classifiers prior to computation. Default to true.
     * @returns {object[]} A K-nearest-neighbor model containing the following properties:
     *   numericals (the numerical features used to create the model),
     *   categoricals (the categorical features used to create the model),
     *   numericalScales (the scaling factor used to normalize numerical features),
     *   categoricalScales (the scaling factor used to normalize categorical features),
     *   predict (a method for making a prediction based on the model, accepts a subject, an outcome, a classification/regression flag, and the k-value as parameters),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects, and the k-value as parameters. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects, an outcome, a classification/regression flag, and the k-value as parameters),
     *   impute (a method for performing kNN imputation, accepts an array of subject, an array of features, a categorical/numerical flag, and the k-value as parameters),
     *   match (a method for performing kNN matching with the subjects used to build the model are considered as controls. The method accepts an array of samples, the k-value, and a greed/optimal search flag).
     */
    let kNN: (subjects: object | object[], numericals?: string[], categoricals?: string[], normalize?: boolean) => {
        numericals: string[];
        categoricals: string[];
        numericalScales: [min: number, range: number][];
        categoricalScales: [string, number][][];
        neighbors: [subject: object, numericals: number[], categoricals: string[]][];
        text: string;
        nearest(subject: object, k: number): [neighbor: object, distance: number][];
        predict(subject: object, outcome: string, classification?: boolean, k?: number, weighted?: boolean): any;
        roc(subjects: object[], outcome: string, k?: number, weighted?: boolean, roc?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
        }[];
        performance(subjects: object[], outcome: string, classification?: boolean, k?: number, weighted?: boolean): {
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
        impute(subjects: object[], features: string[], categorical?: boolean, k?: number, weighted?: boolean): {
            feature: string;
            count: number;
            text: string;
        }[];
        match(subjects: object[], k?: number, greedy?: boolean): any[];
    };
}
