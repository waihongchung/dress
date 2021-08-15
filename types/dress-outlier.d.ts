declare namespace DRESS {
    /**
     * @summary Outlier detection using boxplot.
     *
     * @description This method computes a boxplot, reporting the minimum, first quartile, median, third quartile, and maximum, for each specified feature using a non-parametric algorithm.
     * It also computes the upper and lower whiskers, which is set by default as 1.5 times the interquartile range. Any values that lie outside the whiskers are considered as outliers.
     * Optionally, the outliers can be set to null, so that they can be further processed using an imputation algorithm.
     *
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value. Null values are ignored.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {boolean} [nullify=false] - Optional, set outliers to null. Default to false.
     * @param {number} [cutoff=1.5] - Optional, the distance of the whiskers. Default to 1.5 times the interquartile range.
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   feature (the feature being evaluated),
     *   count (the number of non-null values),
     *   quartiles (minimum, first quartile, median, third quartile, and maximum),
     *   whiskers (lower and upper whiskers),
     *   outliers (an array of outliers),
     *   text.
     */
    let boxplot: (subjects: object[], features: string[], nullify?: boolean, cutoff?: number) => {
        feature: string;
        count: number;
        quartiles: number[];
        whiskers: number[];
        outliers: any[];
        p: number;
        text: string;
    }[];
    /**
     * @summary Outlier detection using the Grubbs' test.
     *
     * @description This method applies the Grubbs' test repetitively to detect outliers for each specified feature. Optionally, the outliers can be set to null, so that they can be further processed using an imputation algorithm.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value. Null values are ignored.
     *
     * Note that the algorithm assumes that the values of the feature is normally distributed. The algorithm should only be applied to normally distributed values.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {boolean} [nullify=false] - Optional, set outliers to null. Default to false.
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   feature (the feature being evaluated),
     *   count (the number of non-null values),
     *   outliers (an array of outliers),
     *   text.
     */
    let grubbs: (subjects: object[], features: string[], nullify?: boolean) => {
        feature: string;
        count: number;
        outliers: any[];
        p: number;
        text: string;
    }[];
}
