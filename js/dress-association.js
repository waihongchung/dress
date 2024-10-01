var DRESS;
(function (DRESS) {
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
    DRESS.oddsRatios = (subjects, outcomes, exposures) => {
        const padding = DRESS.longest(exposures);
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        const events = [];
        const nonevents = [];
        let i = subjects.length;
        while (i--) {
            (outcomes.every(outcome => DRESS.numeric(DRESS.get(subjects[i], outcome))) ? events : nonevents).push(subjects[i]);
        }
        //
        return {
            outcomes: outcomes,
            event: events.length,
            nonevent: nonevents.length,
            exposures: exposures.map(exposure => {
                const exposedEvent = events.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const exposedNonevent = nonevents.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const unexposedEvent = events.length - exposedEvent;
                const unexposedNonevent = nonevents.length - exposedNonevent;
                //
                const oddsRatio = (exposedEvent * unexposedNonevent) / (unexposedEvent * exposedNonevent + Number.EPSILON);
                const se = Math.sqrt(1 / (exposedEvent + Number.EPSILON) + 1 / (exposedNonevent + Number.EPSILON) + 1 / (unexposedEvent + Number.EPSILON) + 1 / (unexposedNonevent + Number.EPSILON));
                const z = Math.log(oddsRatio) / se;
                const p = DRESS.norm(z);
                const ci = [Math.exp(Math.log(oddsRatio) - zCI * se), Math.exp(Math.log(oddsRatio) + zCI * se)];
                return {
                    exposure,
                    exposedEvent,
                    exposedNonevent,
                    unexposedEvent,
                    unexposedNonevent,
                    oddsRatio,
                    ci,
                    z,
                    p,
                    text: DRESS.pad(exposure, padding) + ': ' + DRESS.clamp(oddsRatio) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                        + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        + '	[' + exposedEvent + '/' + exposedNonevent + ' : ' + unexposedEvent + '/' + unexposedNonevent + ']'
                };
            }),
            text: '[' + outcomes.join(' + ') + '] - [' + events.length + ' : ' + nonevents.length + ']'
        };
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
    DRESS.riskRatios = (subjects, outcomes, exposures) => {
        const padding = DRESS.longest(exposures);
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE);
        //
        const events = [];
        const nonevents = [];
        let i = subjects.length;
        while (i--) {
            (outcomes.every(outcome => DRESS.numeric(DRESS.get(subjects[i], outcome))) ? events : nonevents).push(subjects[i]);
        }
        //
        return {
            outcomes: outcomes,
            event: events.length,
            nonevent: nonevents.length,
            exposures: exposures.map(exposure => {
                const exposedEvent = events.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const unexposedEvent = events.length - exposedEvent;
                const exposed = exposedEvent + nonevents.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const unexposed = subjects.length - exposed;
                //
                const riskRatio = (exposedEvent * unexposed) / (unexposedEvent * exposed + Number.EPSILON);
                const se = Math.sqrt(1 / (exposedEvent + Number.EPSILON) + 1 / (unexposedEvent + Number.EPSILON) - 1 / (exposed + Number.EPSILON) - 1 / (unexposed + Number.EPSILON));
                const z = Math.log(riskRatio) / se;
                const p = DRESS.norm(z);
                const ci = [Math.exp(Math.log(riskRatio) - zCI * se), Math.exp(Math.log(riskRatio) + zCI * se)];
                return {
                    exposure,
                    exposedEvent,
                    exposed,
                    unexposedEvent,
                    unexposed,
                    riskRatio,
                    ci,
                    z,
                    p,
                    text: DRESS.pad(exposure, padding) + ': ' + DRESS.clamp(riskRatio) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                        + '	z: ' + DRESS.sign(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        + '	[' + exposedEvent + '/' + exposed + ' : ' + unexposedEvent + '/' + unexposed + ']'
                };
            }),
            text: '[' + outcomes.join(' + ') + '] - [' + events.length + ' : ' + nonevents.length + ']'
        };
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
    DRESS.correlations = (subjects, features, rank = false) => {
        const padding = DRESS.longest(features);
        const numSubject = subjects.length;
        const numFeature = features.length;
        const zCI = DRESS.inorm(DRESS.SIGNIFICANCE) / ((numSubject > 3) ? Math.sqrt(numSubject - 3) : 1);
        //
        const correlations = Array(numFeature).fill(null).map(() => Array(numFeature));
        const values = Array(numFeature).fill(null).map(() => Array(numSubject));
        let i = numFeature;
        while (i--) {
            const vals = values[i];
            const feature = features[i];
            let j = numSubject;
            while (j--) {
                vals[j] = DRESS.numeric(DRESS.get(subjects[j], feature));
            }
            if (rank) {
                const rank = vals.slice().sort((a, b) => a - b);
                j = numSubject;
                while (j--) {
                    vals[j] = rank.indexOf(vals[j]);
                }
            }
        }
        return features.map((feature, row) => {
            let col = numFeature;
            while (--col > row) {
                let X = 0;
                let Y = 0;
                let X2 = 0;
                let Y2 = 0;
                let XY = 0;
                i = numSubject;
                while (i--) {
                    const x = values[row][i];
                    const y = values[col][i];
                    X += x;
                    Y += y;
                    X2 += x * x;
                    Y2 += y * y;
                    XY += x * y;
                }
                const r = (numSubject * XY - X * Y) / (numSubject * Math.sqrt((X2 - X * X / numSubject) * (Y2 - Y * Y / numSubject)) + Number.EPSILON);
                const zR = Math.log((1 + r) / (1 - r)) / 2;
                const ci = [(Math.exp(2 * (zR - zCI)) - 1) / (Math.exp(2 * (zR - zCI)) + 1), (Math.exp(2 * (zR + zCI)) - 1) / (Math.exp(2 * (zR + zCI)) + 1)];
                const t = r * Math.sqrt((numSubject - 2) / (1 - r * r));
                const p = DRESS.studentt(t, numSubject - 2);
                correlations[row][col] = correlations[col][row] = {
                    r,
                    ci,
                    t,
                    p
                };
            }
            return {
                feature: feature,
                correlations: correlations[row].map((correlation, col) => (correlation) ?
                    {
                        feature: features[col],
                        r: correlation.r,
                        ci: correlation.ci,
                        t: correlation.t,
                        p: correlation.p,
                        text: DRESS.pad(features[col], padding) + ': ' + DRESS.sign(DRESS.clamp(correlation.r)) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + correlation.ci.map(v => DRESS.sign(DRESS.clamp(v))).join(' - ') + ')'
                            + '	t: ' + DRESS.sign(DRESS.clamp(correlation.t)) + '	p: ' + DRESS.clamp(correlation.p)
                    } : null).filter(_ => _),
                text: '[' + feature + ']'
            };
        });
    };
})(DRESS || (DRESS = {}));
