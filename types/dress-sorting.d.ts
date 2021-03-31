declare namespace DRESS {
    /**
     * @summary Multilevel mixed data type sorting.
     *
     * @description This method performs multilevel mixed data type sorting on an array of subjects based on the specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation.
     *
     * Sorting precedence is defined by the features array. Null values are considered smaller than non-null values.
     * Numerical values are considered smaller than non-numerical values. Non-array values are considered smaller than array values.
     *
     * Two array values are sorted based on the values of individual elements within the arrays.
     * If the recursevie flag is set to true, then the elements within an array is sorted first, before the array itself is sorted.
     *
     * By default, sorting is performed in ascending order, but it can be changed to a descending order by setting the reverses flags to true on individual feature.
     *
     * @param {object[]} subjects - The subjects to be sorted.
     * @param {string[]} features - One or more features (or levels) on which the sorting algorithm is applied.
     * @param {boolean[]} [reverses=null] - An array of boolean that specifies the direction of sorting. It MUST be of the same length as the features array.
     * @param {boolean} [recursive=false] - Recursively sort elements within an array before the array itself is sorted.
     * @returns An array of sorting parameters for debugging purposes. For each specified feature, the following parameters are returned:
     *   feature (the feature),
     *   reverse (the direction of sorting),
     *   text
     */
    let sort: (subjects: object[], features: string[], reverses?: boolean[], recursive?: boolean) => {
        feature: string;
        reverse: boolean;
        text: string;
    }[];
}
