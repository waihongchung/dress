declare namespace DRESS {
    /**
     * @summary Generate a concise summary of the specified array of subjects.
     *
     * @description This method loops through the specified array of subjects and generates a summary describing the names of the enumerable features, the data type (numeric vs categoric), and the number of `null` values found in these subjects.
     *
     * @param {object[]} subjects - An array of subjects to analyze.
     * @param {number} [limit=DRESS.PRECISION] - Display the first N unique values of the feature. Default to DRESS.PRECISION.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the name of the feature),
     *   - numeric (whether the feature is a numeric or categoric feature),
     *   - null (number of null values),
     *   - unique (number of unique values),
     *   - values (an array of unique non-null values),
     *   - text.
     */
    const summary: (subjects: object[], limit?: number) => {
        count: number;
        features: {
            feature: any;
            numeric: number;
            null: any;
            unique: any;
            values: unknown[];
            text: string;
        }[];
        text: string;
    };
    /**
     * @summary Calculate the arithmetic mean for each feature and optionally compare the result to that of a second group of subjects.
     *
     * @description This method computes the arithmetic means as well as the standard deviations of the specified features.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed),
     *   - count (the number of subjects),
     *   - mean (the arithmetic mean of the feature),
     *   - sd (the standard deviation of the feature),
     *   - skewness (the Fisher-Pearson coefficient of skewness),
     *   - kurtosis (the excess Kurtosis),
     *   - ci (the confidence interval of the mean),
     *   - count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   - mean2 (the arithmetic mean of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - sd2 (the standard deviation of the feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - skewness2 (the Fisher-Pearson coefficient of skewness, only applicable if subjects2 is specified),
     *   - kurtosis2 (the excess Kurtosis, only applicable if subjects2 is specified),
     *   - ci2 (the confidence interval of the mean for the second group of subjects, only applicable if subjects2 is specified),
     *   - z (z score, only applicable if subjects2 is specified),
     *   - p (p-value, only applicable if subjects2 is specified),
     *   - text.
     */
    const means: (subjects: object[], features: string[], subjects2?: object[]) => {
        feature: string;
        count: number;
        mean: number;
        sd: number;
        skewness: number;
        kurtosis: number;
        ci: number[];
        count2: number;
        mean2: number;
        sd2: number;
        ci2: number[];
        skewness2: number;
        kurtosis2: number;
        z: number;
        p: number;
        text: string;
    }[];
    /**
     * @summary Locate the medians of the specified features and optionally compare the result to that of a second group of subjects.
     *
     * @description This method computes the medians as well as the interquartile ranges of the specified features.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * Z score is calculated using the Mann–Whitney U test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed),
     *   - count (the number of subjects),
     *   - median (the median value),
     *   - iqr (the interquartile range, which equals the value of the 75th percentile minus that of the 25th percentile),
     *   - skewness (the Galton skewness),
     *   - kurtosis (the excess percentile kurtosis),
     *   - count2 (the number of subjects for the second group of subjects, only applicable if subjects2 is specified),
     *   - median2 (the median values for the second group of subjects, only applicable if subjects2 is specified),
     *   - iqr2 (the interquartile range for the second group of subjects, only applicable if subjects2 is specified),
     *   - skewness2 (the Galton skewness for the second group of subjects, only applicable if subjects2 is specified),
     *   - kurtosis2 (the excess percentile kurtosis for the second group of subjects, only applicable if subjects2 is specified),
     *   - z (z score, only applicable if subjects2 is specified),
     *   - p (p-value, only applicable if subjects2 is specified),
     *   - text.
     */
    const medians: (subjects: object[], features: string[], subjects2?: object[]) => {
        feature: string;
        count: number;
        median: number;
        iqr: number;
        skewness: number;
        kurtosis: number;
        count2: number;
        median2: number;
        iqr2: number;
        skewness2: number;
        kurtosis2: number;
        z: number;
        p: number;
        text: string;
    }[];
    /**
     * @summary Calculate the proportion of subjects that have a positive feature and optionally compare the result to that of a second group of subjects.
     *
     * @description This method counts the number of subjects that has a positive feature.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive feature is defined as a non-empty array.
     * If the property is not an array, then it would be converted to a numeric value and a positive feature is defined as any non-zero value.
     *
     * Z score is calculated using the 2 proportions Z test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed),
     *   - count (the number of subjects with a positive feature),
     *   - proportion (the proportion of subject with a positive feature),
     *   - ci (the confidence interval of the proportion),
     *   - count2 (the number of subjects with a positive feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - proportion2 (the proportion of subjects with a positive feature for the second group of subjects, only applicable if subjects2 is specified),
     *   - ci2 (the confidence interval of the proportion for the second group of subjects, only applicable if subjects2 is specified),
     *   - z (z score, only applicable if subjects2 is specified),
     *   - p (p-value, only applicable if subjects2 is specified),
     *   - text.
     */
    const proportions: (subjects: object[], features: string[], subjects2?: object[]) => {
        feature: string;
        count: number;
        proportion: number;
        ci: number[];
        count2: number;
        proportion2: number;
        ci2: number[];
        z: number;
        p: number;
        text: string;
    }[];
    /**
     * @summary Calculate the frequency of occurrence for each feature value and optionally compare the result to that of a second group of subjects.
     *
     * @description This method tabulates all possible values for each feature and counts the frequency of occurrence of each feature value.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then each value within the array
     * is converted to a string. If the property is not an array, then the entire value is converted into a string.
     *
     * Z score is calculated using the 2 proportions Z test.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - An array of features to be analyzed.
     * @param {object[]} [subjects2=null] - Optional, a second group of subjects.
     * @param {number} [limit=25] - Optional, maximum number of feature values to be analyzed.
     *
     * @returns {object[]} An array of result objects, one for each feature. For each feature, the following results are returned:
     *   - feature (the feature being analyzed, with the following properties),
     *   > - count (the number of subjects with said feature value),
     *   > - proportion (the proportion of subject with said feature value),
     *   > - ci (the confidence interval of the proportion),
     *   > - count2 (the number of subjects with said feature value for the second group of subjects, only applicable if subjects2 is specified),
     *   > - proportion2 (the proportion of subject with said feature value for the second group of subjects, only applicable if subjects2 is specified),
     *   > - ci2 (the confidence interval of the proportion for the second group of subjects, only applicable if subjects2 is specified),
     *   > - z (z score, only applicable if subjects2 is specified),
     *   > - p (p-value, only applicable if subjects2 is specified),
     *   > - text.
     *   - values (an array of possible feature values),
     *   - text.
     */
    const frequencies: (subjects: object[], features: string[], subjects2?: object[], limit?: number) => {
        feature: string;
        values: {
            value: string;
            count: number;
            proportion: number;
            ci: number[];
            count2: any;
            proportion2: any;
            ci2: any;
            z: any;
            p: any;
            text: string;
        }[];
        text: string;
    }[];
}
