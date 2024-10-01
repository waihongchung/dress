declare namespace DRESS {
    /**
     * @summary Permutation feature importances.
     *
     * @description This method computes the relative importance of each feature by randomly permuting the feature values, which breaks the relationship between the feature and the true outcome.
     * A feature is considered important if the permutation process increases the model error because this implies that the model relied on the feature for the prediction.
     *
     * * Note this is an asynchronous operation.
     *
     * @param {any} model - The model to be analyzed. Any regression or classification model that contains the method 'validate' is supported.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} [parameters=[]] - An array of parameters to be passed to the algorithm to 'validate' function of the model.
     * @param {number} [k=5] - The number of folds. The default is 5.
     * @param {any} [async=DRESS.async] - The asynchronous operator. The default is DRESS.async.
     *
     * @returns A Promise that can be resolved to a result object containing the following properties:
     *   - seed (the randomly generated seed),
     *   - features: (an array of features, each containing the following parameters),
     *   > - feature (the name of the feature),
     *   > - importance (the average feature importance),
     *   > - ci (the confidence interval of the feature importance),
     *   > - relative (the relative average feature importance),
     *   > - text.
     *   - text.
     */
    const importances: (model: Model, subjects: object[], parameters?: any[], k?: number, async?: (method: any, ...parameters: any[]) => Promise<any>) => Promise<{
        seed: number;
        features: {
            feature: string;
            importance: number;
            ci: number[];
            relative: number;
            text: string;
        }[];
        text: string;
    }>;
    /**
     * @summary K-fold cross validation.
     *
     * @description This method performs a k-fold cross-validation procedure based on the specified algorithm and the specified subjects.
     * The subjects are split into k groups; a model is created using k-1 groups as training data, while the remaining 1 group is used as validation data.
     * The process is repeated until each group has been used as validation once. The average performance across all models is reported.
     *
     * * Note this is an asynchronous operation.
     *
     * @param {Algorithm} algorithm - The algorithm used to create the models.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} training - An array of parameters to be passed to the algorithm to train a model.
     * @param {any[]} validating - An array of parameters to be passed to the algorithm to 'validate' function of the model.
     * @param {number} [k=5] - The number of folds. Default is 5.
     * @param {any} [async=DRESS.async] - The asynchronous operator. The default is DRESS.async.
     *
     * @returns A result object containing the following properties:
     *   - seed (the randomly generated seed),
     *   - metrics (an array of performance metrics, each with the following properties)
     *   > - metric (the name of the performance metric),
     *   > - mean (the mean model performance),
     *   > - ci (the confidence interval of the model performance),
     *   > - text.
     *   - text.
     */
    const crossValidate: (algorithm: Algorithm, subjects: object[], training?: any[], validating?: any[], k?: number, async?: (method: any, ...parameters: any[]) => Promise<any>) => Promise<{
        seed: number;
        metrics: {
            metric: string;
            mean: number;
            ci: number[];
            text: string;
        }[];
        text: string;
    }>;
    /**
     * @summary Automatic Hyperparameter Tuning
     *
     * @description This method performs hyperparameter optimization using a grid search approach with early stopping.
     * Internally, the method uses the crossValidate method to compute the resulting model's performance. The method iteratively alters the specified hyperparameters until there is no further increase in the model's performance.
     * Note it is possible for the method to be trapped in a local maxima. This can be avoided by varying the order in which the hyperparameters are specified.
     *
     * @param {object} initial - The starting hyperparameter values.
     * @param {object} eventual - The stopping hyperparameter values. Only specify hyperparameters that need to be optimized.
     * @param {string} metric - The performance metric based on which hyperparameter optimization is performed.
     * @param {Algorithm} algorithm - The algorithm used to create the models.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} training - One or more parameters to be passed to the algorithm to train a model.
     * @param {any[]} validating - One or more parameters to be passed to the algorithm to 'validate' function of the model.
     * @param {number} [k=5] - The number of folds used in cross-validation. Default is 5.
     * @param {number} [p=5] - The number of intervals between the starting and stopping values. Default is 5.
     * @param {any} [async=DRESS.async] - The asynchronous operator. The default is DRESS.async.
     *
     */
    const hyperparameters: (initial: object, eventual: object, metric: string, algorithm: Algorithm, subjects: object[], training?: any[], validating?: any[], k?: number, p?: number, async?: (method: any, ...parameters: any[]) => Promise<any>) => any;
}
