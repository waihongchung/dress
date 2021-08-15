declare namespace DRESS {
    /**
     * @summary Mean/mode imputation.
     *
     * @description This method performs simple imputation by replacing missing values of each specified feature with the mean (in case of numerical features) or mode (in case of categorical features) of said feature from the rest of the subjects.
     * Each feature should be a property of the subject or is accessible using the dot notation. Any null value is considered as missing. If the property is an array, then the array of sorted and converted to a string for comparison.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {boolean} [categorical=false] - Treat features as categorical features. Default to false.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   count (the number of missing values),
     *   value (the mean or mode used as replacement),
     *   text
     */
    let meanMode: (subjects: object[], features: string[], categorical?: boolean) => {
        feature: string;
        count: number;
        text: string;
    }[];
    /**
     * @summary Last observation carried forward imputation.
     *
     * @description This method imputes null values using the last observation carried forward algorithm. If a null value is associated with the first observation, then the next non-null observation is carried backforward (NOCB).
     * Each feature should be a property of the subject or is accessible using the dot notation.
     *
     * The subjects array should be sorted in a logical fashion using other sorting algorithms before imputation is applied.
     *
     * NOTE: This method is destructive and directly alters the values of the specified feature.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @returns {object[]} An array of imputation parameters for debugging purposes. For each imputed feature, the following parameters are returned:
     *   feature (the feature imputed),
     *   count (the number of missing values),
     *   text
     */
    let locf: (subjects: object[], features: string[]) => {
        feature: string;
        count: number;
        text: string;
    }[];
    /**
     * @summary Set the nullable values of the specified features to null.
     *
     * @description This method evaluates the value of the specified features in each subject.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the value of the property matches one of the values defined in the nulls array, the property is set to null.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} truths - A list of values that are considered as null.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were set to null),
     *   text
     */
    let nullify: (subjects: object[], features: string[], nulls: any[], names?: string[]) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    }[];
    /**
     * @summary Remove any subjects that contains a null value as one of the specified features.
     *
     * @description This method creates a new array of subjects that contains only those subjects that do not have a null value in any of the specified features.
     *
     * @returns A new array of subjects.
     */
    let denullify: (subjects: object[], features: string[]) => object[];
}
