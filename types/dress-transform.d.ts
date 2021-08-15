declare namespace DRESS {
    /**
     * @summary Normalize the specified features so that their values fall in the range of [0, 1].
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that all the values of said feature fall in the range of [0, 1].
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
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
        min: number;
        max: number;
        range: number;
        text: string;
    }[];
    /**
     * @summary Standardize the specified features so that their values have an arithmetic mean of 0 and a standard deviation of 1.
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that the values of said feature have a mean of 0 and a standard deviation of 1.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
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
     * @summary Reduce the values of the specified features into a boolean value (i.e. true or false).
     *
     * @description This method evaluates the value of the specified features in each subject.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then logical TRUE is defined as the presence of one or more values within the truths array within the property array.
     * Otherwise, the logical TRUE is defined as the presence of the property value within the truths array.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} truths - A list of values that are considered as logical TRUE.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were considered as logical TRUE),
     *   text
     */
    let booleanize: (subjects: object[], features: string[], truths: any[], names?: string[]) => {
        feature: string;
        name: string;
        count: number;
        text: string;
    }[];
    /**
     * @summary Categorize the values of the specified features and encode the result using numerical values.
     *
     * @description This method categorizes the value of the specified features in each subject by matching it to one of the specified categories.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then each value in the property is matched individually, and an empty array is returned if no match is found.
     * If the property is NOT an array, then the value is matched directly against the specified categories. If no match is found, then the property is set to null.
     *
     * The categories must be an array. Each element within the categories array can be a value or an array of values.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} categories - An array of categories. The index of each category is used for encoding.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   counts (an array representing the number of matched subjects in each category).
     *   text
     */
    let categorize: (subjects: object[], features: string[], categories: any[], names?: string[]) => {
        feature: string;
        name: string;
        counts: number[];
        text: string;
    }[];
    /**
     * @summary Generate a UUID for each subject.
     *
     * @description This method labels each subject with a universally unique identifier (UUID). It uses the Window.crypto API to generate a cryptographically secured random value in order to minimize the risk of a collision.
     * The UUID is designed in a way that each id is, for practical purposes, unique and the probability that there are duplicates is close enough to zero to be negligible.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} [name='id'] - Optional, the name of the property that holds the UUID. Default to 'uuid'.
     * @returns {object[]} - An array of labeled subjects.
     */
    let uuid: (subjects: object[], name?: string) => object[];
    /**
     * @summary Organize the subjects into groups based on the specified feature.
     *
     * @description This method assigns subjects into one of several groups based on the value of the specified feature.
     * The feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the string representation of the array is used as the group identifier.
     * If the property is NOT an array, then the value is used directly as the group identifier.
     *
     * For example, this method can be used to group subjects by gender or site id, or to group hospital encounters by patient mrn.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - The grouping feature.
     * @param {string} name - The name of the property in the result object that holds the grouped subjects.
     * @returns {object[]} An array of objects with two properties: one in the name of the feature and contains the identifier of each group,
     * the other one in the specified name and contains an array of grouped subjects.
     */
    let group: (subjects: object[], feature: string, name: string) => object[];
    /**
     * @sumary Create a new array of subjects by merging several arrays of subjects based on the values of the specified feature.
     *
     * @description This method merges subjects from multiple arrays using the values of the specified feature as the key.
     * The feature should be a property of the subject or is accessible using the dot notation. The values of the feature should uniquely identify a subject within each array of subjects.
     *
     * Suppose there is an array of objects, called labs, containing the laboratory values of each study subject, and each object is identified by the subject id.
     * And suppose there is another array of objects, called demographics, containing the demographic information of each study subject, and each object is again identified by the subject id.
     * You can create a new array of objects, each containing both the laboratory values and the demographic information, by calling merge('id', labs, demographics)
     *
     * @param {string} feature - The feature, whose value can be used to uniquely identify a subject within an array.
     * @param {object[][]} arrays - Two or more arrays of subjects.
     * @returns {object[]} An array of merged subjects.
     */
    let merge: (feature: string, ...arrays: object[][]) => object[];
    /**
     * @summary Create a new array of containing the values of the specified feature(s), and optionally add a back reference to the subject.
     *
     * @description This method creates a new array of containing the values of the specified feature(s), and optionally add a back reference to the subject.
     * The feature should be a property of the subject or is accessible using the dot notation.
     *
     * Suppose there is an array of study subjects, each suject has a feature called 'encounters', which is an array of hospital encounters associated with the subject.
     * You can create a new array of encounters, by calling pluck(subjects, ['encounters']). You can optionally create, as a property of each encounter object, a back reference, called 'subject' to the parent subject, by calling
     * pluck(subjects, ['encounters'], 'subject').
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - One or more features to be selected.
     * @param {string} [reference=null] - Optional, the name of the property that holds the back reference to the parent subject.
     * @returns {object[]} An array of feature values.
     */
    let pluck: (subjects: object[], features: string[], reference?: string) => any[];
}
