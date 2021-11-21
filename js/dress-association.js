var DRESS;
(function (DRESS) {
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
    DRESS.oddsRatios = (subjects, outcomes, exposures) => {
        const pad = exposures.reduce((max, exposure) => Math.max(max, exposure.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        const events = [];
        const nonevents = [];
        let i = subjects.length;
        while (i--) {
            (outcomes.every(outcome => DRESS.numeric(DRESS.get(subjects[i], outcome))) ? events : nonevents).push(subjects[i]);
        }
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
                const oddsRatio = (exposedEvent * unexposedNonevent) / (unexposedEvent * exposedNonevent);
                const se = Math.sqrt(1 / exposedEvent + 1 / exposedNonevent + 1 / unexposedEvent + 1 / unexposedNonevent);
                const z = Math.log(oddsRatio) / se;
                const p = DRESS.norm(z);
                const ci = [Math.exp(Math.log(oddsRatio) - zCI * se), Math.exp(Math.log(oddsRatio) + zCI * se)];
                return {
                    exposure: exposure,
                    exposedEvent: exposedEvent,
                    exposedNonevent: exposedNonevent,
                    unexposedEvent: unexposedEvent,
                    unexposedNonevent: unexposedNonevent,
                    oddsRatio: oddsRatio,
                    ci: ci,
                    z: z,
                    p: p,
                    text: DRESS.padEnd(exposure, pad) + ': ' + DRESS.clamp(oddsRatio) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        + '	[' + exposedEvent + '/' + exposedNonevent + ' : ' + unexposedEvent + '/' + unexposedNonevent + ']'
                };
            }),
            text: '[' + outcomes.join(', ') + '] - [' + events.length + ' : ' + nonevents.length + ']'
        };
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
    DRESS.riskRatios = (subjects, outcomes, exposures) => {
        const pad = exposures.reduce((max, exposure) => Math.max(max, exposure.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        const events = subjects.filter(subject => outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome))));
        return {
            outcomes: outcomes,
            event: events.length,
            nonevent: subjects.length - events.length,
            exposures: exposures.map(exposure => {
                const exposed = subjects.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const unexposed = subjects.length - exposed;
                const exposedEvent = events.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const unexposedEvent = events.length - exposedEvent;
                //
                const riskRatio = (exposedEvent * unexposed) / (unexposedEvent * exposed);
                const se = Math.sqrt(1 / exposedEvent + 1 / unexposedEvent - 1 / exposed - 1 / unexposed);
                const z = Math.log(riskRatio) / se;
                const p = DRESS.norm(z);
                const ci = [Math.exp(Math.log(riskRatio) - zCI * se), Math.exp(Math.log(riskRatio) + zCI * se)];
                return {
                    exposure: exposure,
                    exposedEvent: exposedEvent,
                    exposed: exposed,
                    unexposedEvent: unexposedEvent,
                    unexposed: unexposed,
                    riskRatio: riskRatio,
                    ci: ci,
                    z: z,
                    p: p,
                    text: DRESS.padEnd(exposure, pad) + ': ' + DRESS.clamp(riskRatio) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci.map(v => DRESS.clamp(v)).join(' - ') + ')'
                        + '	z: ' + DRESS.signed(DRESS.clamp(z)) + '	p: ' + DRESS.clamp(p)
                        + '	[' + exposedEvent + '/' + exposed + ' : ' + unexposedEvent + '/' + unexposed + ']'
                };
            }),
            text: '[' + outcomes.join(', ') + '] - [' + events.length + ' : ' + (subjects.length - events.length) + ']'
        };
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
    DRESS.effectMeasures = (subjects, outcomes, exposures) => {
        const pad = exposures.reduce((max, exposure) => Math.max(max, exposure.length), 0);
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE);
        //
        const events = subjects.filter(subject => outcomes.every(outcome => DRESS.numeric(DRESS.get(subject, outcome))));
        return {
            outcomes: outcomes,
            event: events.length,
            nonevent: subjects.length - events.length,
            exposures: exposures.map(exposure => {
                const exposed = subjects.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const unexposed = subjects.length - exposed;
                const exposedEvent = events.filter(subject => DRESS.numeric(DRESS.get(subject, exposure))).length;
                const unexposedEvent = events.length - exposedEvent;
                //                
                const AR = (exposedEvent / exposed) - (unexposedEvent / unexposed);
                const AF = AR / (exposedEvent / exposed);
                const ARR = -AR;
                const RR = (exposedEvent * unexposed) / (unexposedEvent * exposed);
                //
                const SE_AR = Math.sqrt((events.length / subjects.length) * (1 - events.length / subjects.length) * (1 / exposed + 1 / unexposed));
                const SE_AF = SE_AR / AR;
                const SE_ARR = Math.sqrt((exposedEvent / exposed) * (1 - exposedEvent / exposed) / exposed + (unexposedEvent / unexposed) * (1 - unexposedEvent / unexposed) / unexposed);
                const SE_RR = Math.sqrt(1 / exposedEvent + 1 / unexposedEvent - 1 / exposed - 1 / unexposed);
                //
                const ci_AR = [AR - zCI * SE_AR, AR + zCI * SE_AR];
                const ci_AF = [AF * (1 - zCI * SE_AF), AF * (1 + zCI * SE_AF)];
                const ci_ARR = [ARR - zCI * SE_ARR, ARR + zCI * SE_ARR];
                const ci_RRR = [1 - Math.exp(Math.log(RR) + zCI * SE_RR), 1 - Math.exp(Math.log(RR) - zCI * SE_RR)];
                //
                const z_AR = AR / SE_AR;
                const z_AF = 1 / SE_AF;
                const z_ARR = ARR / SE_ARR;
                const z_RRR = Math.log(RR) / SE_RR;
                //
                const p_AR = DRESS.norm(z_AR);
                const p_AF = DRESS.norm(z_AF);
                const p_ARR = DRESS.norm(z_ARR);
                const p_RRR = DRESS.norm(z_RRR);
                return {
                    measures: [
                        {
                            measure: 'attributableRisk',
                            value: AR,
                            ci: ci_AR,
                            z: z_AR,
                            p: p_AR,
                            text: 'AR : ' + DRESS.clamp(AR) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci_AR.map(v => DRESS.clamp(v)).join(' - ') + ')'
                                + '	z: ' + DRESS.signed(DRESS.clamp(z_AR)) + '	p: ' + DRESS.clamp(p_AR)
                        },
                        {
                            measure: 'attributableFraction',
                            value: AF,
                            ci: ci_AF,
                            z: z_AF,
                            p: p_AF,
                            text: 'AF : ' + DRESS.clamp(AF) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci_AF.map(v => DRESS.clamp(v)).join(' - ') + ')'
                                + '	z: ' + DRESS.signed(DRESS.clamp(z_AF)) + '	p: ' + DRESS.clamp(p_AF)
                        },
                        {
                            measure: 'absoluteRiskReduction',
                            value: ARR,
                            ci: ci_ARR,
                            z: z_ARR,
                            p: p_ARR,
                            text: 'ARR: ' + DRESS.clamp(ARR) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci_ARR.map(v => DRESS.clamp(v)).join(' - ') + ')'
                                + '	z: ' + DRESS.signed(DRESS.clamp(z_ARR)) + '	p: ' + DRESS.clamp(p_ARR)
                        },
                        {
                            measure: 'relativeRiskReduction',
                            value: 1 - RR,
                            ci: ci_RRR,
                            z: z_RRR,
                            p: p_RRR,
                            text: 'RRR: ' + DRESS.clamp(1 - RR) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + ci_RRR.map(v => DRESS.clamp(v)).join(' - ') + ')'
                                + '	z: ' + DRESS.signed(DRESS.clamp(z_RRR)) + '	p: ' + DRESS.clamp(p_RRR)
                        }
                    ],
                    exposure: exposure,
                    text: DRESS.padEnd(exposure, pad) + ': '
                };
            }),
            text: '[' + outcomes.join(', ') + '] - [' + events.length + ' : ' + (subjects.length - events.length) + ']'
        };
    };
    /**
     * @summary Calculate the degree of correlation between the specified features.
     *
     * @description This method computes the degree of correlation between two or more specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is considered.
     * If the property is not an array, then the numeric value of the property is considered.
     *
     * By default, the degree of correlation is measured by means of the Pearson correlation coefficient.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} features - The features to be analyzed.
     * @param {boolean} [rank=false] - Use Spearman's rank correlation coefficient, default to false.
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
    DRESS.correlations = (subjects, features, rank = false) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const numSubject = subjects.length;
        const numFeature = features.length;
        const zCI = DRESS.anorm(DRESS.SIGNIFICANCE) / ((numSubject > 3) ? Math.sqrt(numSubject - 3) : 1);
        //
        const correlations = (new Array(numFeature)).fill(null).map(_ => new Array(numFeature));
        const values = (new Array(numFeature)).fill(null).map(_ => new Array(numSubject));
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
                const r = (numSubject * XY - X * Y) / (numSubject * Math.sqrt((X2 - X * X / numSubject) * (Y2 - Y * Y / numSubject)) + 1e-8);
                const zR = Math.log((1 + r) / (1 - r)) / 2;
                const ci = [(Math.exp(2 * (zR - zCI)) - 1) / (Math.exp(2 * (zR - zCI)) + 1), (Math.exp(2 * (zR + zCI)) - 1) / (Math.exp(2 * (zR + zCI)) + 1)];
                const t = r * Math.sqrt((numSubject - 2) / (1 - r * r));
                const p = DRESS.tdist(t, numSubject - 2);
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
                        text: DRESS.padEnd(features[col], pad) + ': ' + DRESS.signed(DRESS.clamp(correlation.r)) + '	(' + ((1 - DRESS.SIGNIFICANCE) * 100) + '% CI ' + correlation.ci.map(v => DRESS.signed(DRESS.clamp(v))).join(' - ') + ')'
                            + '	t: ' + DRESS.signed(DRESS.clamp(correlation.t)) + '	p: ' + DRESS.clamp(correlation.p)
                    } : null).filter(_ => _),
                text: '[' + feature + ']'
            };
        });
    };
})(DRESS || (DRESS = {}));
