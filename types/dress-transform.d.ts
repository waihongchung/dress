declare namespace DRESS {
    /**
     * @summary Normalize the specified numerical features so that their values fall in the range of [lower, upper].
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that all the values of said feature fall in the range of [lower, upper].
     * By default the lower limit is 0 and the upper limit is 1. Each feature should be a property of the subject or be accessible using the dot notation.
     * If the property is an array, then each value in the array is normalized individually. A null value will remain as `null`.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number} [lower=0] - The lower limit. Default to 0.
     * @param {number} [upper=1] - The upper limit. Default to 1.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - min (the minimum value of said feature found within the subjects),
     *   - max (the maximal value of said feature found within the subjects),
     *   - text.
     */
    const normalize: (subjects: object[], features: string[], names?: string[], lower?: number, upper?: number) => {
        feature: string;
        name: string;
        min: number;
        max: number;
        text: string;
    }[];
    /**
     * @summary Standardize the specified numerical features so that their values have an arithmetic mean of 0 and a standard deviation of 1.
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that the values of said feature have a mean of 0 and a standard deviation of 1.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then each value in the array is standardized individually.
     * A null value will remain as `null`.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - mean (the arithmetic mean of said feature found within the subjects),
     *   - sd (the standard deviation of said feature found within the subjects),
     *   - text.
     */
    const standardize: (subjects: object[], features: string[], names?: string[]) => {
        feature: string;
        name: string;
        mean: number;
        sd: number;
        text: string;
    }[];
    /**
     * @summary Reduce the values of the specified categorical features into a boolean value (i.e. true or false).
     *
     * @description This method matches the value of the specified features in each subject against an array of truths.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then logical TRUE is defined as the presence of one or more values within the truths array within the property array.
     * Otherwise, the logical TRUE is defined as the presence of the property value within the truths array. A null value will remain as `null`.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} truths - A list of values that are considered as logical TRUE.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {boolean} [negate=false] - Negate the output boolean value, i.e. TRUE becomes FALSE and vice versa.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - count (the number of subjects that were considered as logical TRUE),
     *   - text.
     */
    const booleanize: (subjects: object[], features: string[], truths: any[], names?: string[], negate?: boolean) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    }[];
    /**
     * @summary Convert the values of the specified numerical features into discrete categorical values.
     *
     * @description This method converts the value of the specified numerical features in each subject into discrete categorical values based on the specified boundaries.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then each value in the property is converted individually.
     * The boundaries should be an array of ascending numerical values.  A null value will remain as `null`.
     *
     * For instance, if the specified boundaries are `[0.5, 1.5]`, any values less than 0.5 would be categorized as 0,
     * any values greater than or equal to 0.5 but less than 1.5 would be categorized as 1, and any values greater than or equal to 1.5 would be categorized as 2.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {number[]} boundaries - The boundaries of the categories, should be an array of ascending numerical values.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {boolean} [invert=false] - Invert the order of categories. Default to false.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - counts (an array representing the number of matched subjects in each category).
     *   - text.
     */
    const categorize: (subjects: object[], features: string[], boundaries: number[], names?: string[], invert?: boolean) => {
        feature: string;
        name: string;
        counts: number[];
        text: string;
    }[];
    /**
     * @summary Convert the values of the specified categorical features into numerical values.
     *
     * @description This method numericizes the value of the specified categorical features in each subject by matching it to one of the specified ordered categories.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then each value in the property is matched individually.
     * If a match is found, the property is set to the index of the matched category. If no match is found, then the property is set to `null`.
     *
     * The categories must be an array. Each element within the categories array can be a value or an array of values.
     *
     * For instance, if the specified categories are `['A', ['B', 'C'], 'D']`, then 'A' would be converted to 0, 'B' and 'C' would be converted to 1, and 'D' would be converted to 2.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} categories - An array of categories. The index of each category is used for encoding.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - counts (an array representing the number of matched subjects in each category).
     *   - text.
     */
    const numericize: (subjects: object[], features: string[], categories: any[], names?: string[]) => {
        feature: string;
        name: string;
        counts: number[];
        text: string;
    }[];
    /**
     * @summary Organize the subjects into groups based on the specified feature.
     *
     * @description This method assigns subjects into one of several groups based on the value of the specified feature.
     * The feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the string representation of the array is used as the group identifier.
     * If the property is NOT an array, then the value is used directly as the group identifier.
     *
     * For example, this method can be used to group subjects by gender or site id, or to group hospital encounters by patient MRN.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - The grouping feature.
     * @param {string} name - The name of the property in the result object that holds the grouped subjects.
     *
     * @returns {object[]} An array of objects with two properties:
     *   - [feature] (value of the grouping feature),
     *   - [name] (an array of subjects).
     */
    const group: (subjects: object[], feature: string, name: string) => object[];
    /**
     * @summary Create a new array containing the values of the specified feature, and optionally, label each value with the unique identifier of the subject.
     *
     * @description This method creates a new array containing the values of the specified feature, and optionally, labels each value with the unique identifier of the parent subject.
     * The feature should be a property of the subject or be accessible using the dot notation. If the id property is used, the values are converted into objects.
     *
     * Suppose there is an array of study subjects, each subject has a feature called 'encounters', which is an array of hospital encounters associated with the subject.
     * You can create a new array of encounters, by calling pluck(subjects, 'encounters'). If each subject is uniquely identified by the 'uuid' property, you can also label each encounter object by the uuid, by calling
     * pluck(subjects, 'encounters', 'uuid').
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - A feature to be selected.
     * @param {string} [id=null] - Optional, the feature to be used as a unique identifier of the parent subject.
     *
     * @returns {object[]} An array of feature values.
     */
    const pluck: (subjects: object[], feature: string, id?: string) => any[];
    /**
     * @sumary Create a new array of subjects by merging several arrays of subjects based on the values of the specified feature.
     *
     * @description This method merges subjects from multiple arrays using the values of the specified feature as the key.
     * The feature should be a property of the subject or be accessible using the dot notation. The values of the feature should uniquely identify a subject within each array of subjects.
     *
     * Suppose there is an array of objects, called labs, containing the laboratory values of each study subject, and each object is identified by the subject id.
     * And suppose there is another array of objects, called demographics, containing the demographic information of each study subject, and each object is again identified by the subject id.
     * You can create a new array of objects, each containing both the laboratory values and the demographic information, by calling merge('id', labs, demographics)
     *
     * @param {string} feature - The feature, whose value can be used to uniquely identify a subject within an array.
     * @param {object[][]} arrays - Two or more arrays of subjects.
     *
     * @returns {object[]} An array of merged subjects.
     */
    const merge: (feature: string, ...arrays: object[][]) => object[];
    /**
    * @summary Split an array of subjects into two arrays.
    *
    * @description This method splits an array of subjects by randomly assigning subjects into two partitions based on the specified ratio.
    * This method is typically used for splitting a dataset into a training dataset and a validation dataset.
    *
    * @param {object[]} subjects - The subjects to be analyzed.
    * @param {string} [outcome=null] - An outcome feature that is used to stratify the subjects before splitting. The default is null, which disables stratification.
    * @param {number} [ratio=0.8] - The ratio of subjects between the two partitions. Default to 0.8.
    *
    * @returns An array with two elements, each is an array of subjects.
    */
    const split: (subjects: object[], outcome?: string, ratio?: number) => [object[], object[]];
    /**
     * @summary Rename the specified feature.
     *
     * @description This method renames the specified feature from each subject.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the new name is set to `null`, then the feature is simply removed.
     *
     * NOTE: This method is destructive and directly alters the subjects.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - A feature to be renamed.
     * @param {string} name - The new name.
     *
     * @returns {object[]} A transformation parameter, with the following parameters, for debugging purposes.
     *   - feature (the feature removed),
     *   - count (the number of subjects processed),
     *   - text.
     */
    const rename: (subjects: object[], feature: string, name?: string) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    };
    /**
     * @summary Apply One-Hot Encoding on the specified features.
     *
     * @description This method applies the one-hot encoding method on the specified categorical features. Each feature should be a property of the subject or be accessible using the dot notation.
     * For each unique value of a categorical feature, a new label is created and is assigned `1` for the presence of that value and `0` for the absence of that value. If the property is an array,
     * then more than one label may be assigned as `1`.
     *
     * For instance, a feature `Tobacco_Use`, which may contain one of three values, `Current`, `Never`, or `Past`, would be converted into an object that contains three properties `Tobacco_Use.Current`,
     * `Tobacco_Use.Never`, and `Tobacco_Use.Past`. Depending on the original value of the `Tobacco_Use` feature, one of those three properties would be set to `1`, while the other two would be set to `0`.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - labels (an array of unique labels created for each feature),
     *   - text.
     */
    const oneHot: (subjects: object[], features: string[], names?: string[]) => {
        feature: string;
        name: string;
        labels: string[];
        text: string;
    }[];
    /**
     * @summary Reverse One-Hot Encoding on the specified features.
     *
     * @description This method reverses the one-hot encoding method on the specified categorical features. Each feature should be a property of the subject or be accessible using the dot notation.
     * The value of each feature must be a one-hot encoding object created by the oneHot encoding method.
     *
     * For instance, a one-hot encoded feature called `Tobacco_Use` may be an object with three properties `Tobacco_Use.Current`, `Tobacco_Use.Former`, and `Tobacco_Use.Never`. The values of these properties must be numerical.
     * If the threshold parameter is not set, then the property with the highest value (e.g. Tobacco_Use.Current = 0.9, Tobacco_Use.Former = 0.5, Tobacco_Use.Never = 0.2) will be selected as the decoded value (Tobacco_Use = Current).
     * If the threshold parameter is set, then any properties with a value higher than the threshold will be selected as the decode values.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number} [threshold=null] - The decoding threshold. Default to null, which means only the property with the highest value will be selected.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - text.
     */
    const hotOne: (subjects: object[], features: string[], names?: string[], threshold?: number) => {
        feature: string;
        name: string;
        text: string;
    }[];
}
