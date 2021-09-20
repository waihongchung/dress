declare namespace DRESS {
    /**
     * @summary Permutation feature importance.
     *
     * @description This method computes the relative importance of each feature by randomly permuting the feature values, which breaks the relationship between the feature and the true outcome.
     * A feature is considered important if the permutation process increases the model error, because in this implies that the model relied on the feature for the prediction.
     *
     * @param {any} model - The model to be analyzed. Any regression or classification model that contains the method 'performance' is supported.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} parameters - One or more parameters to be passed to the algorithm to 'performance' function of the model.
     * @returns An array of features used by the model. For each feature, the following parameters are returned:
     *   feature (the name of the feature),
     *   mean (the average feature importance).
     *   ci (the confidence interval of the feature importance),
     *   text.
     */
    let importance: (model: any, subjects: object[], ...parameters: any[]) => any;
    /**
     * @summary K-Fold Cross Validation
     *
     * @description This method performs a 5-fold cross validation procedure based on the specified algorithm and the specified subjects.
     * The subjects are split into 5 groups; a model is created using 4 of the 5 groups are used as training data, while the remaining 1 group is used as validation data.
     * The process is repeated until each group has been used as validation once. The average performance across all 5 models is reported.
     *
     * @param {string} algorithm - The name of the algorithm used to create the models.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {any[]} parameters - One or more parameters to be passed to the algorithm to create a model.
     * @param {any[]} parameters2 - One or more parameters to be passed to the algorithm to 'performance' function of the model.
     * @returns A result object containing the following properties:
     *   seed (the random generate seed),
     *   measure (the statistical measure used to determine a model's performance, either accuracy for classification models or R2 for regression models),
     *   mean (the average model performance).
     *   ci (the confidence interval of the model performance),
     *   text.
     */
    let crossValidate: (algorithm: any, subjects: object[], parameters?: any[], parameters2?: any[]) => {
        seed: number;
        measure: string;
        mean: number;
        ci: number[];
        text: string;
    };
    /**
     * @summary Automatic Hyperparameter Tuning
     *
     * @description This method simplifies the hyperparameter tuning process by automatically testing a range of hyperparameter values.
     *
     */
    let hypertune: (hyperparameters: object, properties: string[], intervals: number[], stops: number, algorithm: any, subjects: object[], ...parameters: any[]) => {
        hyperparameters: any;
        performance: any;
        text: string;
    };
}
