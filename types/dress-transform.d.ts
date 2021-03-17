declare namespace DRESS {
    /**
     * @summary Normalize the specified features so that their values fall in the range of [0, 1].
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that all the values of said feature fall in the range of [0, 1].
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value before the normalization process.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   min (the minimum value of said feature found within the subjects),
     *   max (the maximal value of said feature found within the subjects),
     *   range (max - min),
     *   text
     */
    let normalize: (subjects: object[], features: string[], names?: string[]) => {
        feature: string;
        name: string;
        min: any;
        max: any;
        range: number;
        text: string;
    }[];
    /**
     * @summary Standardize the specified features so that their values have an arithmetic mean of 0 and a standard deviation of 1.
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that the values of said feature have a mean of 0 and a standard deviation of 1.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value before the standardization process.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   mean (the arithmatic mean of said feature found within the subjects),
     *   sd (the standard deviation of said feature found within the subjects),
     *   text
     */
    let standardize: (subjects: object[], features: string[], names?: string[]) => {
        feature: string;
        name: string;
        mean: number;
        sd: number;
        text: string;
    }[];
    /**
     * @summary Reduce the values of the specified feature into a boolean value (i.e. true or false).
     *
     * @description This method evaluates the value of the specified feature in each subject.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then logical TRUE is defined as the presence of one or more values within the truths array within the property array.
     * Otherwise, the logical TRUE is defined as the presence of the property value within the truths array.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - A feature to be processed.
     * @param {any[]} truths - A list of values that are considered as logical TRUE.
     * @param {string} [name=null] - A property name to be used to store the results.
     * @returns {object} An object containing the following transformation parameters for debugging purposes:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were considered as logical TRUE),
     *   text
     */
    let booleanize: (subjects: object[], feature: string, truths: any[], name?: string) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    };
    /**
     * @summary Categorize the values of the specified feature and encode the result using numerical values.
     *
     * @description This method categorizes the value of the specified feature in each subject by matching it to one of the specified categories.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then each value in the property is matched individually, and an empty array is returned if no match is found.
     * If the property is NOT an array, then the value is matched directly against the specified categories. If no match is found, then the property is set to null.
     *
     * The categories must be an array. Each element within the categories array can be a value or an array of values.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - A feature to be processed.
     * @param {any[]} categories - An array of categories. The index of each category is used for encoding.
     * @param {string} [name=null] - A property name to be used to store the results.
     * @returns {object} An object containing the following transformation parameters for debugging purposes:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were successfully categorized to one of the categories).
     *   text
     */
    let categorize: (subjects: object[], feature: string, categories: any[], name?: string) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    };
    /**
     * @summary Organize the subjects into groups based on the specified feature.
     *
     * @description This method loops through the each subject and assigns the subject into one of several groups based on the value of the specified feature.
     * The feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then the string representation of the array is used as the group identifier.
     * If the property is NOT an array, then the value is used directly as the group identifier.
     *
     * For example, this method can be used to organize subjects by gender or site id, or to organize hospital encounters by patient mrn.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - The grouping feature.
     * @param {string} name - The name of the property in the result object that holds the grouped subjects.
     * @returns {object[]} An array of objects with two properties: one in the name of the feature and contains the identifier of each group,
     * the other one in the specified name and contains the grouped subjects.
     */
    let organize: (subjects: object[], feature: string, name: string) => object[];
    /**
     * @sumary Synthesize an array of new objects by merging several arrays of objects based on the specified feature.
     *
     * @description This method loops through each array of objects and merges objects from one array to the next by the specified id.
     * The id should be a property of the subject that is accessible directly by object[id]. The id should uniquely identify an object within an array.
     *
     * Suppose there is an array of objects, called labs, containing the laboratory values of each study subject, and each object is identified by the subject id.
     * And suppose there is another array of objects, called demographics, containing the demographic information of each study subject, and each object is again identified by the subject id.
     * You can synthesize a new array of objects, each containing both the laboratory values and the demographic information, by calling synthesize('id', labs, demographics)
     *
     * @param {string} id - The id used to uniquely identify an object within an array.
     * @param {object[][]} arrays - Two or more arrays of objects.
     * @returns {object[]} An array of newly synthesized objects, each identified by a unique id and is created by merging related objects from the specified arrays.
     */
    let synthesize: (id: string, ...arrays: object[][]) => object[];
}
