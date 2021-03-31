declare namespace DRESS {
    /**
     * @summary Calculate the degree of correlation between the specified features.
     *
     * @description This method computes the degree of correlation between two or more specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * By default, the degree of correlation is measured by means of the Spearman's rank correlation coefficient.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - The features to be analyzed.
     * @param {boolean} [rank=true] - Use Spearman's rank correlation coefficient. If set to false, then the Pearson correlation coefficient is used instead.
     * @returns {object[]} An array of result objects, each with the following parameters:
     *   feature (the feature being evaluated),
     *   correlations (an array of correlation results, one for each remaining feature),
     *   text.
     *   For each correlation result, the following properties are returned:
     *     feature (the other feature being evaluated),
     *     r (the Spearman's correlation coefficient or the Pearson correlaton coefficient),
     *     ci (confidence interval),
     *     t (t score),
     *     p (p value),
     *     text.
     */
    let correlations: (subjects: object[], features: string[], rank?: boolean) => {
        feature: string;
        correlations: {
            feature: string;
            r: any;
            ci: any;
            t: any;
            p: any;
            text: string;
        }[];
        text: string;
    }[];
}
