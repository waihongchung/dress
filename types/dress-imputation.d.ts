declare namespace DRESS {
    /**
     * @summary Mean/mode imputation.
     *
     * @description This method performs simple imputation by replacing missing values of each specified feature with the mean (in case of numerical features) or mode (in case of categorical features or array features) of said feature from the rest of the subjects.
     * Each feature should be a property of the subject or be accessible using the dot notation. Any null value is considered missing. If the property is an array, it is treated as a categorical feature and the array of sorted and converted to a string for comparison.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be processed.
     * @param {string[]} categoricals - An array of categorical features to be processed.
     *
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   - feature (the feature imputed),
     *   - count (the number of missing values),
     *   - nulls (an array of subjects that were imputed),
     *   - value (the mean or mode used as a replacement),
     *   - text
     */
    const meanMode: (subjects: object[], numericals?: string[], categoricals?: string[]) => {
        feature: string;
        count: number;
        nulls: object[];
        value: any;
        text: string;
    }[];
    /**
     * @summary Last observation carried forward imputation.
     *
     * @description This method imputes null values using the last observation carried forward algorithm. If a null value is associated with the first observation, then the next non-null observation is carried backward (NOCB).
     * Each feature should be a property of the subject or be accessible using the dot notation.
     *
     * The subject array should be sorted in a logical fashion using other sorting algorithms before imputation is applied.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   - feature (the feature imputed),
     *   - count (the number of missing values),
     *   - nulls (an array of subjects that were imputed),
     *   - text
     */
    const locf: (subjects: object[], features: string[]) => {
        feature: string;
        count: number;
        nulls: object[];
        text: string;
    }[];
    /**
     * @summary Nearest neighbor imputation.
     *
     * @description This method imputes null values of the specified features using the average value, mean for numerical feature, mode for categorical feature, from the k-nearest neighbors to subject in question.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be processed.
     * @param {string[]} categoricals - An array of categorical features to be processed.
     * @param {number} [k=5] - The number of neighbors to consider. Default is 5.
     * @param {boolean} [unweighted=false] - All neighbors are weighted equally, instead of based on the absolute distance between the test subject and each neighbor. Default to false.
     * @param {any} [kNN=DRESS.kNN] - A k-nearest neighbor machine-learning algorithm. Default to DRESS.kNN.
     *
     * @returns An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   - feature (the feature imputed),
     *   - count (the number of missing values),
     *   - nulls (an array of subjects that were imputed),
     *   - text
     */
    const nearestNeighbor: (subjects: object[], numericals?: string[], categoricals?: string[], k?: number, unweighted?: boolean, kNN?: (subjects: object | object[], outcome?: string, numericals?: string[], categoricals?: string[], classification?: boolean, hyperparameters?: {
        importances?: number[];
    }) => {
        async: string;
        fit(X: any[][], Y: any[]): void;
        train(subjects: object[]): void;
        nearest(subject: object, k?: number): [neighbor: any[], distance: number][];
        vote(subject: object, k?: number, unweighted?: boolean): [outcomes: any[], weights: number[]];
        estimate(subject: object, k?: number, unweighted?: boolean): number[];
        predict(subject: object, k?: number, unweighted?: boolean): any;
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
    }) => {
        feature: string;
        count: number;
        nulls: object[];
        text: string;
    }[];
    /**
     * @summary Set the nullable values of the specified features to null.
     *
     * @description This method matches the value of the specified features in each subject against an array of nulls.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the value of the property matches one of the values defined in the nulls array, the property is set to `null`.
     * If the property is an array, then `null` is defined as the presence of one or more values within the null array within the property array.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} nullables - A list of values that are considered as `null`.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {boolean} [negate=false] - Negate the output value, i.e. the property is set to `null` in the absence of any values defined in the nulls array.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - count (the number of subjects that were set to null),
     *   - nulls (an array of subjects that were set to null),
     *   - text
     */
    const nullify: (subjects: object[], features: string[], nullables: any[], names?: string[], negate?: boolean) => {
        feature: string;
        name: string;
        count: number;
        nulls: object[];
        text: string;
    }[];
    /**
     * @summary Remove any subjects that contain a null value as one or more of the specified features.
     *
     * @description This method removes any subject that contains a null value in any of the specified features.
     *
     * NOTE: This method is destructive and directly alters the specified array of subjects.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns {object[]} Several transformation parameters for debugging purposes.
     *   - features (the feature considered),
     *   - count (the number of subject removed),
     *   - nulls (an array of subjects that were removed),
     *   - text.
     */
    const denullify: (subjects: object[], features: string[]) => {
        features: string[];
        count: number;
        nulls: object[];
        text: string;
    };
}
