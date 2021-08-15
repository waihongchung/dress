declare namespace DRESS {
    /**
     * @summary Generate ASCII histograms
     *
     * @description This method generates an ASCII histogram for each of the specified numerical or categorical features. It also displays the number and percentage of non-null values for each specified feature.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} numericals - An array of numerical features to be analyzed.
     * @param {string[]} categoricals - An array of categorical features to be analyzed.
     * @param {number} [bin=10] - The number of bins to used. Only relevant to numerical features. Default to 10.
     * @returns An arary of result objects, one for each specified numerical or categorical feature, containing the following properties:
     *   feature (the feature being evaluated),
     *   count (the number of non-null values),
     *   histogram (the histogram, which contains an array of ticks, values, and texts),
     *   text.
     */
    let histograms: (subjects: object[], numericals: string[], categoricals: string[], bin?: number) => {
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
     * @summary Generate a heatmap from a correlation matrix.
     *
     * @description This method is designed to convert the result objects returned by DRESS.correlations into a heatmap.
     *
     * @param {object[]} rows - The correlation matrix.
     * @returns An HTML formatted text that renders to a heatmap representation of the specified correlation matrix.
     */
    let heatmap: (rows: object[]) => string;
}
