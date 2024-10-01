declare namespace DRESS {
    /**
     * @summary Generate ASCII histograms
     *
     * @description This method generates an ASCII histogram for each of the specified numerical or categorical features. It also displays the number and percentage of non-null values for each specified feature.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} numericals - An array of numerical features to be analyzed.
     * @param {string[]} categoricals - An array of categorical features to be analyzed.
     * @param {number} [width=20] - The width of the histogram. Default to 20.
     *
     * @returns {object[]} An array of result objects, one for each specified numerical or categorical feature, containing the following properties:
     *   - feature (the feature being evaluated),
     *   - count (the number of non-null values),
     *   - histogram (the histogram, which contains an array of ticks, values, and texts),
     *   - text.
     */
    const histograms: (subjects: object[], numericals?: string[], categoricals?: string[], width?: number) => {
        feature: string;
        count: number;
        histogram: {
            tick: any;
            value: number;
            text: string;
        }[];
        text: string;
    }[];
    /**
     * @summary Generate a heatmap from a correlation matrix and optionally compare the values to a second correlation matrix
     *
     * @description This method is designed to convert the result objects returned by DRESS.correlations into a heatmap.
     * If two correlation matrices of the same size are specified, the differences between two corresponding correlation coefficients are reported and the statistical signifiance of the difference is calculated using the Fisher Z-Transformation.
     *
     * @param {object[]} matrix - The correlation matrix.
     * @param {object[]} [matrix2=null] - Optional, a second correlation matrix for comparison.
     *
     * @returns {string} An HTML formatted text that renders a heatmap representation of the specified correlation matrix.
     */
    const heatmap: (matrix: ReturnType<typeof DRESS.correlations>, matrix2?: ReturnType<typeof DRESS.correlations>) => string;
}
