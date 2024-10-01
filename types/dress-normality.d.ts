declare namespace DRESS {
    /**
     * @summary Perform Box-Cox Power Transformation
     *
     * @description This method can be used to transform the specified features into a normal distribution (or close to normal distribution) by performing the Box-Cox Transformation.
     * If the smallest original value is negative, the original values are shifted so that the smallest pre-transformed value is at least 0.
     *
     * This method automatically searches for the ideal lambda (from -5 to 5) using the Brent optimization method based on the log-likelihood ratio of the transformed values.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number[]} [lambdas=null] - An array of predefined lambdas to be used for transformation. It MUST be of the same length as the features array. Specifying this parameter will disable automatic lambda search.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - lambda (the optimal lambda value used),
     *   - shift (the shift value used),
     *   - text.
     */
    const boxcox: (subjects: object[], features: string[], names?: string[], lambdas?: number[]) => {
        feature: string;
        name: string;
        lambda: number;
        shift: number;
        text: string;
    }[];
    /**
     * @summary Perform Yeo-Johnson Power Transformation
     *
     * @description This method can be used to transform the specified features into a normal distribution (or close to normal distribution) by performing the Yeo-Johnson Transformation.
     * It is similar to the Box-Cox transformation but can handle negative values as well.
     *
     * This method automatically searches for the ideal lambda (from -5 to 5) using the Brent optimization method based on the log-likelihood ratio of the transformed values.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @param {number[]} [lambdas=null] - An array of predefined lambdas to be used for transformation. It MUST be of the same length as the features array. Specifying this parameter will disable automatic lambda search.
     *
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   - feature (the feature transformed),
     *   - name (the name of the property that stores the transformed values),
     *   - lambda (the optimal lambda value used),
     *   - text.
     */
    const johnson: (subjects: object[], features: string[], names?: string[], lambdas?: number[]) => {
        feature: string;
        name: string;
        lambda: number;
        text: string;
    }[];
    /**
     * @summary Shapiro-Wilk/Shapiro-Francia Royston Test.
     *
     * @description This method performs the Shapiro-Wilk/Shaprio-Francia Royston Normality test on the specified features.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns An array of result objects, one for each specified features
     *   - feature (the feature being considered),
     *   - W (the test statistic),
     *   - z (the Z-value),
     *   - p (the p-value),
     *   - text.
     */
    const shapiro: (subjects: object[], features: string[]) => {
        feature: string;
        W: any;
        z: any;
        p: any;
        text: string;
    }[];
    /**
     * @summary d'Agostino-Pearson Test.
     *
     * @description This method performs the d'Agostino-Pearson Omnibus test on the specified features.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     *
     * @returns An array of result objects, one for each specified features
     *   - feature (the feature being considered),
     *   - K2 (the test statistic),
     *   - p (the p-value),
     *   - text.
     */
    const dagostino: (subjects: object[], features: string[]) => {
        feature: string;
        K2: any;
        p: any;
        text: string;
    }[];
}
