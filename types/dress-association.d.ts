declare namespace DRESS {
    /**
     * @summary Calculate the odds of an event in the exposed group relative to that in the unexposed group.
     *
     * @description This method calculates the odds ratios for an event associated with an exposure amongst the subjects. An event is defined as the occurrence of all specified outcomes.
     * For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positive event.
     * Each outcome and exposure should be a property of the subject or is accessible using the dot notation. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then it would be converted to a numeric value and a positive outcome/exposure is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} exposures - An array of exposures to be analyzed.
     * @returns {object} A result object, containing the following properties:
     *   outcomes (the array of outcomes that defines an event),
     *   event (the number of subjects with a positive event),
     *   nonevent (the number of subjects with a negative event),
     *   exposures (an array of result objects for each exposure),
     *   text.
     *   For each exposure, the following results are returned:
     *      exposure (the exposure being considered),
     *      exposedEvent (the number of subjects with a positive event in the exposed group),
     *      exposedNonevent (the number of subjects with a negative event in the exposed group),
     *      unexposedEvent (the number of subjects with a positive event in the unexposed group),
     *      unexposedNonevent (the number of subjects with a negative event in the unexposed group),
     *      oddsRatio (odds of an event in the exposed group in relation to the unexposed group),
     *      ci (confidence interval of odds ratio based on (1 - DRESS.SIGNIFICANCE); default is 95%),
     *      z: z score,
     *      p: p value,
     *      text.
     */
    let oddsRatios: (subjects: object[], outcomes: string[], exposures: string[]) => {
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
     * @description This method calculates the risk ratios for an event associated with an exposure amongst the subjects. An event is defined as the occurrence of all specified outcomes.
     * For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positive event.
     * Each outcome and exposure should be a property of the subject or is accessible using the dot notation. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then it would be converted to a numeric value and a positive outcome/exposure is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} exposures - An array of exposures to be analyzed.
     * @returns {object} A result object, containing the following properties:
     *   outcomes (the array of outcomes that defines an event),
     *   event (the number of subjects with a positive event),
     *   nonevent (the number of subjects with a negative event),
     *   exposures (an array of result objects for each exposure),
     *   text.
     *   For each exposure, the following results are returned:
     *      exposure (the exposure being considered),
     *      exposedEvent (the number of subjects with a positive event in the exposed group),
     *      exposed (the total number of subjects in the exposed group),
     *      unexposedEvent (the number of subjects with a positive event in the unexposed group),
     *      unexposed (the total number of subjects in the unexposed group),
     *      riskRatio (risk of an event in the exposed group in relation to the unexposed group),
     *      ci (confidence interval of risk ratio based on (1 - DRESS.SIGNIFICANCE); default is 95%),
     *      z: z score,
     *      p: p value,
     *      text.
     */
    let riskRatios: (subjects: object[], outcomes: string[], exposures: string[]) => {
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
     * @summary Computes a list of effect measures based on outcomes and exposures.
     *
     * @description This method computes a list of effect measures, including attributable risk, attributable fraction, absolute risk reduction, and relative risk reduction, for an event associated with an exposure amongst the subjects.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and exposure should be a property of the subject or is accessible using the dot notation. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then it would be converted to a numeric value and a positive outcome/exposure is defined as any non-zero value.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} exposures - An array of exposures to be analyzed.
     * @returns {object} A result object, containing the following properties:
     *   outcomes (the array of outcomes that defines an event),
     *   event (the number of subjects with a positive event),
     *   nonevent (the number of subjects with a negative event),
     *   exposures (an array of result objects for each exposure),
     *   text.
     *   For each exposure, the following results are returned:
     *      exposure (the exposure being considered),
     *      measures (an array of effect measures),
     *      text.
     *      For each effect measure, the following results are returned:
     *         measure (the name of the effect measure),
     *         value (the value of the effect measure),
     *         ci (confidence interval),
     *         z (z score),
     *         p (p value),
     *         text.
     */
    let effectMeasures: (subjects: object[], outcomes: string[], exposures: string[]) => {
        outcomes: string[];
        event: number;
        nonevent: number;
        exposures: {
            measures: {
                measure: string;
                value: number;
                ci: number[];
                z: number;
                p: number;
                text: string;
            }[];
            exposure: string;
            text: string;
        }[];
        text: string;
    };
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
