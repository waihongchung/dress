declare namespace DRESS {
    /**
     * @summary Convert a list of comma-separated values into an array of objects.
     *
     * @description This method parses a string containing a list of comma-separated values (CSV) and returns an array of objects representing each row of values.
     * The CSV string MUST contain a row of headers as the first row. The headers are used as property names of each object. Each column represents a property and each subsequent row represents an object.
     * An empty cell is treated as a null value.
     *
     * @param {string} csv - A string containing a list of comma-separated values.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @param {string} [newline='\n'] - The newline character. Default to '\n'.
     *
     * @returns {object[]} An array of objects, each representing a row in the CSV string.
     */
    const fromCSV: (csv: string, separator?: string, newline?: string) => any[];
    /**
     * @summary Convert the subjects into a CSV string.
     *
     * @description This method flattens an array of subjects into a CSV string. Each row of the string represents an object. Each column represents a property of the object.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} [features=null] - A list of features to be included in the CSV. Default is `null`, in which case all enumerable properties of the first subject are used.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @param {string} [newline='\n'] - The newline character. Default to '\n'.
     *
     * @returns {string} A string containing a CSV representation of the subjects.
     */
    const toCSV: (subjects: object[], features?: string[], separator?: string, newline?: string) => string;
    /**
     * @summary Convert the specified features of the subjects into an array of values.
     *
     * @description This method loops through each subject and converts the value of the specified feature into an array of values.
     * Each feature should be a property of the subject or be accessible using the dot notation and each feature should be a CSV formatted string representing an array of values.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @param {string} [empty=[]] - A default value to represent an empty array. Default to an empty array.
     */
    const parseArray: (subjects: object[], features: string[], seperator?: string, empty?: any) => {
        feature: string;
        count: number;
        text: string;
    }[];
    /**
     * @summary Convert the specified features of the subjects into numeric values.
     *
     * @description This method loops through each subject and converts the value of the specified feature into a numeric value.
     * Each feature should be a property of the subject or be accessible using the dot notation.
     * If the property is an array, each of the values of the array is converted into a numeric value.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     */
    const parseNumeric: (subjects: object[], features: string[]) => {
        feature: string;
        count: number;
        text: string;
    }[];
}
