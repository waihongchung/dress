var DRESS;
(function (DRESS) {
    /**
     * @summary Apply backward elimination algorithm on a set of features.
     *
     * @description This method applies the backward elimination feature selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accept more than one features can be used.
     *
     * The backward elimination algorithm starts with the full model and successively eliminates feature that has a p-value less thhan the significance cutoff, which is specified by the global variable DRESS.SIGNIFICANCE.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     * @returns {object} A result object containing the following properties:
     *   steps (the features analyzed during each step of the elimination process),
     *   model (the final regression model).
     *   For each step, the following results are returned:
     *     features (the features being analyzed),
     *     ps (the p-values of each feature),
     *     text.
     */
    DRESS.backward = (regression, subjects, outcomes, features, ...rest) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const steps = [];
        let model = null;
        while (true) {
            model = regression(subjects, outcomes, features, ...rest);
            const selections = model.features.filter(f => features.indexOf(f.feature) > -1).sort((a, b) => a.p - b.p);
            steps.push({
                features: selections.map(f => f.feature),
                ps: selections.map(f => f.p),
                text: selections.map(f => DRESS.padEnd(f.feature, pad) + ' (' + DRESS.clamp(f.p) + ')').join(' | ')
            });
            const selection = selections.pop();
            if (selection && (selection.p > DRESS.SIGNIFICANCE)) {
                features = features.filter(feature => feature !== selection.feature);
            }
            else {
                break;
            }
        }
        return {
            steps: steps,
            model: model,
            text: ''
        };
    };
    /**
     * @summary Apply forward selection algorithm on a set of features.
     *
     * @description This method applies the forward selection algorithm on a set of features using the designated multiple regression algorithm.
     * Any regression algorithms included in the DRESS.regression package that accept more than one features can be used.
     *
     * The forward selection algorithm starts with the null model and successively includes new feature so that the Akaike Information Criteria (AIC) of final model is minimized.
     *
     * @param {any} regression - A regression algorithm, such as DRESS.linear or DRESS.logistic.
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} outcomes - An array of outcomes that defines an event.
     * @param {string[]} features - An array of features to be analyzed.
     * @param  {...any} rest - Any other parameters to be passed to the regression algorithm.
     * @returns {object} A result object containing the following properties:
     *   steps (the features included during each step of the selection process),
     *   model (the final regression model).
     *   For each step, the following results are returned:
     *     features (the features being analyzed),
     *     aic (the AIC of model at the current step),
     *     text.
     */
    DRESS.forward = (regression, subjects, outcomes, features, ...rest) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const steps = [];
        const selections = [];
        let model = null;
        let aic = Number.POSITIVE_INFINITY;
        while (true) {
            const current = features.map(feature => regression(subjects, outcomes, [...selections, feature], ...rest)).sort((a, b) => b.aic - a.aic).pop();
            if (current && (current.aic < aic)) {
                model = current;
                aic = model.aic;
                const feature = model.features.find(f => features.indexOf(f.feature) > -1).feature;
                selections.push(feature);
                features = features.filter(f => f !== feature);
                steps.push({
                    features: selections,
                    aic: model.aic,
                    text: selections.map(f => DRESS.padEnd(f, pad)).join(' | ') + ' (' + DRESS.clamp(aic) + ')'
                });
            }
            else {
                break;
            }
        }
        return {
            steps: steps,
            model: model,
            text: ''
        };
    };
})(DRESS || (DRESS = {}));
