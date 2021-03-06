declare namespace DRESS {
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
    let backward: (regression: any, subjects: object[], outcomes: string[], features: string[], ...rest: any[]) => {
        steps: any[];
        model: any;
        text: string;
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
    let forward: (regression: any, subjects: object[], outcomes: string[], features: string[], ...rest: any[]) => {
        steps: any[];
        model: any;
        text: string;
    };
}
