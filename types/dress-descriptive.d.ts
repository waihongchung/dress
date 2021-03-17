declare namespace DRESS {
    /**
     * @summary Calculate the proportion of subjects that a positive outcome, and optionally compare the result to that of a second group of subjects.
     *
     * @description This method loops through the outcomes array and counts the number of subject that has a positive outcome.
     * Each outcome should be a property of the subject that is accessible directly by subject[outcome]. If the property is an array, then a positive outcome
     * is defined as a non-empty array. If the property is not an array, then a positive outcome is defined as any non-null value.
     *
     * If a comparison group, subjects2, is provided, then this method also calculates the Z score, using the Two Proportions Z Test
     * ({@link https://www.socscistatistics.com/tests/ztest/}) and the corresponding P value for each outcome.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {object[]} [subjects2=null] - Optional, a comparison group of subjects.
     * @returns {object[]} An array of result objects, one for each outcome. For each outcome, the following results are returned:
     *   outcome (the outcome being considered),
     *   count (the number of subject with a positive outcome),
     *   proportion (the proportion of subject with a positive outcome),
     *   ci (the confidence interval of the proportion),
     *   count2 (the number of subject with a positive outcome within the comparison group, only applicable if subjects2 is specified),
     *   proportion2 (the proportion of subject with a positive outcome within the comparison group, only applicable if subjects2 is specified),
     *   ci2 (the confidence interval of the proportion in the comparison group, only applicable if subjects2 is specified),
     *   z (z score, only applicable if subjects2 is specified),
     *   p (p value, only applicable if subjects2 is specified),
     *   text.
     */
    let proportions: (subjects: object[], outcomes: string[], subjects2?: object[]) => {
        outcome: string;
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
     * @summary Calculate the frequency of occurrence for each outcome value, and optionally compare the result to that of a second groups of subjects.
     *
     * @description This method loops through each outcome, tabulates all possible outcome values, and counts the frequency of occurrence of
     * each outcome value by looping through each subject.
     * Each outcome should be a property of the subject that is accessible directly by subject[outcome]. If the property is an array, then each value within the array
     * is converted to a string. If the property is not an array, then the entire value is converted into a string. Outcome values are compared as case-insensitive strings.
     *
     * If a comparison group, subjects2, is provided, then this method also calculates the Z score, using the Two Proportions Z Test
     * ({@link https://www.socscistatistics.com/tests/ztest/}) and the corresponding P value for each outcome.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {object[]} [subjects2=null] - Optional, a comparison group of subjects.
     * @param {number} [limit=25] - Optional, maximum number of outcome values to be analyzed.
     * @returns {object[]} An array of result objects, one for each outcome. For each outcome, the following results are returned:
     *   outcome (the outcome being considered),
     *   values (an array of possible outcome values),
     *   text.
     *   For each outcome value, the following results are returned:
     *     count (the number of subject with said outcome value),
     *     proportion (the proportion of subject with said outcome value),
     *     ci (the confidence interval of the proportion),
     *     count2 (the number of subject with said outcome value within the comparison group, only applicable if subjects2 is specified),
     *     proportion2 (the proportion of subject with said outcome value within the comparison group, only applicable if subjects2 is specified),
     *     ci2 (the confidence interval of the proportion in the comparison group, only applicable if subjects2 is specified),
     *     z (z score, only applicable if subjects2 is specified),
     *     p (p value, only applicable if subjects2 is specified),
     *     text.
     */
    let frequencies: (subjects: object[], outcomes: string[], subjects2?: object[], limit?: number) => {
        outcome: string;
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
    /**
     * @summary Calculate the statistical mean for each outcome, and optionally compare the result to that of a second group of subjects.
     *
     * @description This method loops through each outcome and calculates its statistical mean.
     * Each outcome should be a property of the subject that is accessible directly by subject[outcome]. If the property is an array, then the length of the array is used as a value.
     * If the property is not an array, then the value is converted into a number.
     *
     * If a comparison group of subjects, subjects2, is provided, then this method also calculates the Z score, using the Z Test for Two Means
     * ({@link https://mathcracker.com/z-test-for-two-means}) and the corresponding P value for each outcome.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {object[]} [subjects2=null] - Optional, a comparison group of subjects.
     * @param {boolean} [skipNull=true] - Optional, when set to true, null values are ignored.
     * @returns {object[]} An array of result objects, one for each outcome. For each outcome, the following results are returned:
     *   outcome (the outcome being considered),
     *   count (the number of subject with a non-null outcome),
     *   mean (the arithmetic mean of the outcome values),
     *   sd (the standard deviation of the outcome values),
     *   ci (the confidence interval of the mean),
     *   count2 (the number of subject with a non-null outcome within the comparison group of subjects, only applicable if subjects2 is specified),
     *   mean2 (the arithmetic mean of the outcome values within the comparison group of subjects, only applicable if subjects2 is specified),
     *   sd2 (the standard deviation of the outcome values within the comparison group of subjects, only applicable if subjects2 is specified),
     *   ci2 (the confidence interval of the mean within the comparison group of subjects, only applicable if subjects2 is specified),
     *   z (z score, only applicable if subjects2 is specified),
     *   p (p value, only applicable if subjects2 is specified),
     *   text.
     */
    let means: (subjects: object[], outcomes: string[], subjects2?: object[], skipNull?: boolean) => {
        outcome: string;
        count: number;
        mean: number;
        sd: number;
        ci: number[];
        count2: number;
        mean2: number;
        sd2: number;
        ci2: number[];
        z: number;
        p: number;
        text: string;
    }[];
}
