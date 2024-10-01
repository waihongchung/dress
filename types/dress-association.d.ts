declare namespace DRESS {
    /**
     * @summary Calculate the odds of an event in the exposed group relative to that in the unexposed group.
     *
     * @description This method calculates the odds ratios for an event associated with exposure amongst the subjects. An event is defined as the occurrence of all specified outcomes.
     * For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had a UTI AND were treated as an outpatient would be considered to have a positive event.
     * Each outcome and exposure should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then it would be converted to a numeric value and a positive outcome/exposure is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} exposures - An array of exposures to be analyzed.
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcomes (the array of outcomes that defines an event),
     *   - event (the number of subjects with a positive event),
     *   - nonevent (the number of subjects with a negative event),
     *   - exposures (an array of exposures, each containing the following properties),
     *   > - exposure (the exposure being considered),
     *   > - exposedEvent (the number of subjects with a positive event in the exposed group),
     *   > - exposedNonevent (the number of subjects with a negative event in the exposed group),
     *   > - unexposedEvent (the number of subjects with a positive event in the unexposed group),
     *   > - unexposedNonevent (the number of subjects with a negative event in the unexposed group),
     *   > - oddsRatio (odds of an event in the exposed group in relation to the unexposed group),
     *   > - ci (confidence interval of odds ratio based on (1 - DRESS.SIGNIFICANCE); default is 95%),
     *   > - z: z score,
     *   > - p: p-value,
     *   > - text.
     *   - text.
     */
    const oddsRatios: (subjects: object[], outcomes: string[], exposures: string[]) => {
        outcomes: string[];
        event: number;
        nonevent: number;
        exposures: {
            exposure: string;
            exposedEvent: number;
            exposedNonevent: number;
            unexposedEvent: number;
            unexposedNonevent: number;
            oddsRatio: number;
            ci: number[];
            z: number;
            p: number;
            text: string;
        }[];
        text: string;
    };
    /**
     * @summary Calculate the risk of an event in the exposed group relative to that in the unexposed group.
     *
     * @description This method calculates the risk ratios for an event associated with exposure amongst the subjects. An event is defined as the occurrence of all specified outcomes.
     * For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had a UTI AND were treated as an outpatient would be considered to have a positive event.
     * Each outcome and exposure should be a property of the subject or be accessible using the dot notation. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then it would be converted to a numeric value and a positive outcome/exposure is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} exposures - An array of exposures to be analyzed.
     *
     * @returns {object} A result object, containing the following properties:
     *   - outcomes (the array of outcomes that defines an event),
     *   - event (the number of subjects with a positive event),
     *   - nonevent (the number of subjects with a negative event),
     *   - exposures (an array of exposures, each containing the following properties),
     *   > - exposure (the exposure being considered),
     *   > - exposedEvent (the number of subjects with a positive event in the exposed group),
     *   > - exposedNonevent (the number of subjects with a negative event in the exposed group),
     *   > - unexposedEvent (the number of subjects with a positive event in the unexposed group),
     *   > - unexposedNonevent (the number of subjects with a negative event in the unexposed group),
     *   > - riskRatio (risk of an event in the exposed group in relation to the unexposed group),
     *   > - ci (confidence interval of risk ratio based on (1 - DRESS.SIGNIFICANCE); default is 95%),
     *   > - z: z score,
     *   > - p: p-value,
     *   > - text.
     *   - text.
     */
    const riskRatios: (subjects: object[], outcomes: string[], exposures: string[]) => {
        outcomes: string[];
        event: number;
        nonevent: number;
        exposures: {
            exposure: string;
            exposedEvent: number;
            exposed: number;
            unexposedEvent: number;
            unexposed: number;
            riskRatio: number;
            ci: number[];
            z: number;
            p: number;
            text: string;
        }[];
        text: string;
    };
    /**
     * @summary Calculate the degree of correlation between the specified features.
     *
     * @description This method computes the degree of correlation between two or more specified features.
     * Each feature should be a property of the subject or be accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * By default, the degree of correlation is measured by means of the Pearson correlation coefficient.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - The features to be analyzed.
     * @param {boolean} [rank=false] - Use Spearman's rank correlation coefficient, and default to false.
     *
     * @returns {object[]} An array of result objects, one for each specified feature, containing the following properties:
     *   - feature (the feature being evaluated),
     *   - correlations (an array of correlations, each containing the following properties),
     *   > - feature (the correlated feature being evaluated),
     *   > - r (the Spearman's correlation coefficient or the Pearson correlation coefficient),
     *   > - ci (confidence interval),
     *   > - t (t-score),
     *   > - p (p-value),
     *   > - text.
     *   - text.
     */
    const correlations: (subjects: object[], features: string[], rank?: boolean) => {
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
