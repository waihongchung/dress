declare namespace DRESS {
    /**
     * @summary Perform Yeo-Johnson Power Transformation
     *
     * @description This method can be used to transform the specified features into a normal distribution (or close to normal distribution) by performing the Yeo-Johnson Transformation.
     * It is similar to the Box-Cox transformation, but is able to handle negative values as well.
     *
     * This method automatically searches for the ideal lambda (from -5 to 5) using the Brent optimization method based on the log-likelihood ratio of the transformed values.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   lambda (the optimal lambda value used),
     *   text
     */
    let johnson: (subjects: object[], features: string[], names?: string[]) => {
        feature: string;
        name: string;
        lambda: number;
        text: string;
    }[];
    /**
     * @summary Shapiro-Wilk test.
     *
     * @description This method performs the Shapiro-Wilk Normality test on the specified features.
     *
     * @param {object[]} subjects - The array of subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @returns An array of result objects, one for each specified features
     *   feature (the feature being considered),
     *   W (the test statistic),
     *   z (the Z-value),
     *   p (the p-value),
     *   text
     */
    let normalities: (subjects: object[], features: string[]) => {
        feature: string;
        W: any;
        z: any;
        p: any;
        text: string;
    }[];
}
