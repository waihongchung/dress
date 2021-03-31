declare namespace DRESS {
    /**
     * @summary Calculate the odds of an event in the exposed group relative to that in the unexposed group.
     *
     * @description This method loops through each exposure and calculates the associated odds ratios for an event. An event is defined as the occurrence of all specified outcomes.
     * For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and exposure should be a property of the subject that is accessible directly by subject[outcome] or subject[exposure]. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then a positive outcome/exposure is defined as any non-null value.
     *
     * Z Test for Odds Ratio ({@link https://www2.ccrb.cuhk.edu.hk/stat/confidence%20interval/CI%20for%20ratio.htm}) is used to calculate the Z score and p value. Confidence interval can be adjusted by
     * changing the value of DRESS.SIGNIFICANCE.
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
     * @description This method loops through each exposure and calculates the associated risk ratios for an event. An event is defined as the occurrence of all specified outcomes.
     * For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and exposure should be a property of the subject that is accessible directly by subject[outcome] or subject[exposure]. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then a positive outcome/exposure is defined as any non-null value.
     *
     * Z Test for Risk Ratio ({@link https://www2.ccrb.cuhk.edu.hk/stat/confidence%20interval/CI%20for%20relative%20risk.htm}) is used to calculate the Z score and p value. Confidence interval can be adjusted by
     * changing the value of DRESS.SIGNIFICANCE.
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
     * @description This method loops through each exposure and computes a list of effect measures, including attributable risk, attributable fraction, absolute risk reduction, and relative risk reduction.
     * An event is defined as the occurrence of all specified outcomes. For instance, if the specified outcomes were ['outpatient', 'uti'], then only subjects that had an UTI AND were treated as outpatient would be considered to have a positiven event.
     * Each outcome and exposure should be a property of the subject that is accessible directly by subject[outcome] or subject[exposure]. If the property is an array, then a positive outcome/exposure
     * is defined as a non-empty array. If the property is not an array, then a positive outcome/exposure is defined as any non-null value.
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
}