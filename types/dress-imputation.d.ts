declare namespace DRESS {
    /**
     * @summary Mean/mode imputation.
     *
     * @description This method performs simple imputation by replacing missing values of each specified feature with the mean (in case of numerical features) or mode (in case of categorical features) of said feature from the rest of the subjects.
     * Each feature should be a property of the subject or is accessible using the dot notation. Any null value is considered as missing. If the property is an array, then the array of sorted and converted to a string for comparison.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the imputed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   name (the name of property that store the imputed values),
     *   count (the number of missing values),
     *   value (the mean or mode used as replacement),
     *   text
     */
    let meanMode: (subjects: object[], features: string[], names?: string[]) => {
        feature: string;
        name: string;
        count: number;
        value: any;
        text: string;
    }[];
    /**
     * @summary Last observation carried forward imputation.
     *
     * @description This method imputes missing values using the last observation carried forward algorithm. If the missing value is associated with the first observation, then the next non-null observation is carried backforward (NOCB).
     * Each feature should be a property of the subject or is accessible using the dot notation. Any null value is considered as missing.
     *
     * The subjects array should be sorted properly using other sorting algorithms before imputation is applied.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the imputed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   name (the name of property that store the imputed values),
     *   count (the number of missing values),
     *   text
     */
    let locf: (subjects: object[], features: string[], names?: string[]) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    }[];
    /**
     * @summary K-nearest-neighbor imputation.
     *
     * @description This method performs k-nearest neighbor imputation using a modified algorithm that accepts both numerical and categorical features as classifiers.
     * Each feature should be a property of the subject or is accessible using the dot notation. If a numerical feature is an array, then the length of the array is used for computation.
     * If a categorical feature is an array, then the array is sorted and converted to a string for computation.
     *
     * This algorithm represents an improvement over the popular K-prototype algorithm, which also handles mixed data type. Instead of relying on simple matching (as in K-mode), however,
     * the relative distribution of each categorical value is taken into account and the absolute difference in the relative distribution between two categorical values is used to compute the Manhattan distance.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the imputed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} numericals - An array of numerical features to be used as classifiers.
     * @param {string[]} categoricals - An array of categorical features to be used as classifiers.
     * @param {string[]} features - An array of features to be imputed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number} [k=9] - The number of neighbors considered.
     * @param {boolean} [normalize=true] - Normalize numerical values prior to computation. Default to true.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   name (the name of property that store the imputed values),
     *   count (the number of missing values),
     *   text
     */
    let knn: (subjects: object[], numericals: string[], categoricals: string[], features: string[], names?: string[], k?: number, normalize?: boolean) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    }[];
}
