var DRESS;
(function (DRESS) {
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
    DRESS.proportions = (subjects, outcomes, subjects2 = null) => {
        const pad = outcomes.reduce((max, outcome) => Math.max(max, outcome.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return outcomes.map(outcome => {
            const cases1 = subjects.filter(subject => Array.isArray(subject[outcome]) ? subject[outcome].length : +subject[outcome]);
            const n1 = subjects.length;
            const p1 = cases1.length / n1;
            const se1 = Math.sqrt(p1 * (1 - p1) / n1);
            const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
            //            
            if (subjects2) {
                const cases2 = subjects2.filter(subject => Array.isArray(subject[outcome]) ? subject[outcome].length : +subject[outcome]);
                const n2 = subjects2.length;
                const p2 = cases2.length / n2;
                const se2 = Math.sqrt(p2 * (1 - p2) / n2);
                const ci2 = [p2 - zCI * se2, p2 + zCI * se2];
                //
                const p12 = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
                const z = ((p1 - p2) / Math.sqrt(p12 * (1 - p12) * ((1 / n1) + (1 / n2))));
                const p = DRESS.norm(z);
                return {
                    outcome: outcome,
                    count: cases1.length,
                    proportion: p1,
                    ci: ci1,
                    count2: cases2.length,
                    proportion2: p2,
                    ci2: ci2,
                    z: z,
                    p: p,
                    text: DRESS.padEnd(outcome, pad) + ': [' + cases1.length + ']	' + DRESS.clamp(p1 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ') vs'
                        + '	[' + cases2.length + ']	' + DRESS.clamp(p2 * 100) + '%'
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                outcome: outcome,
                count: cases1.length,
                proportion: p1,
                ci: ci1,
                count2: null,
                proportion2: null,
                ci2: null,
                z: null,
                p: null,
                text: DRESS.padEnd(outcome, pad) + ': [' + cases1.length + ']	' + DRESS.clamp(p1 * 100) + '%'
                    + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
            };
        });
    };
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
    DRESS.frequencies = (subjects, outcomes, subjects2 = null, limit = 25) => {
        let count = (subjects, outcome) => {
            const counters = [];
            subjects.map(subject => {
                (Array.isArray(subject[outcome]) ? subject[outcome].filter((value, index, values) => values.indexOf(value) === index) : [subject[outcome]]).map(value => {
                    value = String(value).trim();
                    const counter = counters.find(counter => counter.value.toLowerCase() === value.toLowerCase());
                    if (!counter) {
                        counters.push({
                            value,
                            count: 1
                        });
                    }
                    else {
                        counter.count += 1;
                    }
                });
            });
            return counters.sort((a, b) => b.count - a.count);
        };
        //
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return outcomes.map(outcome => {
            const n1 = subjects.length;
            const counters1 = count(subjects, outcome).slice(0, limit);
            const pad = counters1.reduce((max, counter) => Math.max(max, counter.value.length), 0);
            if (subjects2) {
                const n2 = subjects2.length;
                const counters2 = count(subjects2, outcome);
                return {
                    outcome: outcome,
                    values: counters1.map(counter1 => {
                        var _a, _b;
                        const p1 = counter1.count / n1;
                        const se1 = Math.sqrt(p1 * (1 - p1) / n1);
                        const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
                        const counter2 = counters2.find(counter2 => counter1.value.toLowerCase() === counter2.value.toLowerCase());
                        const p2 = ((_a = counter2.count) !== null && _a !== void 0 ? _a : 0) / n2;
                        const se2 = Math.sqrt(p2 * (1 - p2) / n2);
                        const ci2 = [p2 - zCI * se2, p2 + zCI * se2];
                        //
                        const p12 = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
                        const z = ((p1 - p2) / Math.sqrt(p12 * (1 - p12) * ((1 / n1) + (1 / n2))));
                        const p = DRESS.norm(z);
                        return {
                            value: counter1.value,
                            count: counter1.count,
                            proportion: p1,
                            ci: ci1,
                            count2: counter2,
                            proportion2: p2,
                            ci2: ci2,
                            z: z,
                            p: p,
                            text: DRESS.padEnd(counter1.value, pad) + ': [' + counter1.count + ']	' + DRESS.clamp(p1 * 100) + '%'
                                + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')	vs'
                                + '	[' + ((_b = counter2.count) !== null && _b !== void 0 ? _b : 0) + ']	' + DRESS.clamp(p2 * 100) + '%'
                                + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                                + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        };
                    }),
                    text: '[' + outcome + ']'
                };
            }
            return {
                outcome: outcome,
                values: counters1.map(counter1 => {
                    const p1 = counter1.count / n1;
                    const se1 = Math.sqrt(p1 * (1 - p1) / n1);
                    const ci1 = [p1 - zCI * se1, p1 + zCI * se1];
                    return {
                        value: counter1.value,
                        count: counter1.count,
                        proportion: p1,
                        ci: ci1,
                        count2: null,
                        proportion2: null,
                        ci2: null,
                        z: null,
                        p: null,
                        text: DRESS.padEnd(counter1.value, pad) + ': [' + counter1.count + ']	' + DRESS.clamp(p1 * 100) + '%'
                            + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v * 100)).join(' - ') + ')'
                    };
                }),
                text: '[' + outcome + ']'
            };
        });
    };
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
    DRESS.means = (subjects, outcomes, subjects2 = null, skipNull = true) => {
        const pad = outcomes.reduce((max, outcome) => Math.max(max, outcome.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        return outcomes.map(outcome => {
            if (skipNull) {
                subjects = subjects.filter(subject => subject[outcome] !== null);
            }
            const values1 = subjects.map(subject => Array.isArray(subject[outcome]) ? subject[outcome].length : +subject[outcome]);
            const count1 = values1.length;
            const mean1 = values1.reduce((total, value) => total + value) / count1;
            const sd1 = Math.sqrt(values1.reduce((total, value) => total + (value - mean1) * (value - mean1), 0) / count1);
            const ci1 = [mean1 - zCI * sd1 / Math.sqrt(count1), mean1 + zCI * sd1 / Math.sqrt(count1)];
            //
            if (subjects2) {
                if (skipNull) {
                    subjects2 = subjects2.filter(subject => subject[outcome] !== null);
                }
                const values2 = subjects2.map(subject => Array.isArray(subject[outcome]) ? subject[outcome].length : +subject[outcome]);
                const count2 = values2.length;
                const mean2 = values2.reduce((total, value) => total + value) / count2;
                const sd2 = Math.sqrt(values2.reduce((total, value) => total + (value - mean2) * (value - mean2), 0) / count2);
                const ci2 = [mean2 - zCI * sd2 / Math.sqrt(count2), mean2 + zCI * sd2 / Math.sqrt(count2)];
                const z = (mean1 - mean2) / Math.sqrt(sd1 * sd1 / count1 + sd2 * sd2 / count2);
                const p = DRESS.norm(z);
                return {
                    outcome: outcome,
                    count: count1,
                    mean: mean1,
                    sd: sd1,
                    ci: ci1,
                    count2: count2,
                    mean2: mean2,
                    sd2: sd2,
                    ci2: ci2,
                    z: z,
                    p: p,
                    text: DRESS.padEnd(outcome, pad) + ': [' + count1 + ']	' + DRESS.clamp(mean1)
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(sd1) + '	vs'
                        + ' [' + count2 + ']	' + DRESS.clamp(mean2)
                        + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci2.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(sd2)
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                };
            }
            return {
                outcome: outcome,
                count: count1,
                mean: mean1,
                sd: sd1,
                ci: ci1,
                count2: null,
                mean2: null,
                sd2: null,
                ci2: null,
                z: null,
                p: null,
                text: DRESS.padEnd(outcome, pad) + ': [' + count1 + ']	' + DRESS.clamp(mean1)
                    + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci1.map(v => DRESS.clamp(v)).join(' - ') + ')	SD: ' + DRESS.clamp(sd1)
            };
        });
    };
})(DRESS || (DRESS = {}));
