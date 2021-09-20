declare namespace DRESS {
    /**
     * @summary Perform exact matching.
     *
     * @description This method matches each subject to one or more controls based on the specified features.
     * In the exact mataching algorithm, all of the specified features between the subject and the control must be identical in order to be considered a match.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the array is sorted and the string representation of the array is considered.
     * If the property is not an array, then the raw value of the property is considered.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {object[]} controls - The pool of controls from which the matches will be selected.
     * @param {string[]} features - The features to be analyzed.
     * @param {number} [k=1] - The number of matches for each subject.
     * @returns {object[]} An array of matched controls.
     */
    let exact: (subjects: object[], controls: object[], features: string[], k?: number) => object[];
    /**
     * @summary Perform propensity score matching.
     *
     * @description This method matches each subject to one or more controls based on the propensity score derived from the specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array is used as the value of the feature.
     * If the property is not an array, then it would be converted to a numeric value.
     *
     * This method uses, internally, the DRESS.logistic method. Therefore, MUST include the dress-regression.js package.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {object[]} controls - The pool of controls from which the matches will be selected.
     * @param {string[]} features - The features to be analyzed.
     * @param {number} [k=1] - The number of matches for each subject.
     * @param {boolean} [greedy=true] - Greedy matching or optimal matching. Default to greedy.
     * @returns {object[]} An array of matched controls.
     */
    let propensity: (subjects: object[], controls: object[], features: string[], k?: number, greedy?: boolean, logistic?: (subjects: object | object[], outcomes: string[], features: string[]) => {
        outcomes: string[];
        deviance: number;
        r2: number;
        aic: number;
        p: number;
        features: {
            feature: string;
            coefficient: number;
            z: number;
            p: number;
            oddsRatio: number;
            ci: number[];
            text: string;
        }[];
        text: string;
        predict(subject: object): number;
        roc(subjects: object[], roc?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
            outcomes: string[];
            classifiers: {
                classifier: string;
                coordinates: number[][];
                auc: number;
                ci: number[];
                z: number;
                p: any;
                cutoff: number;
                tpr: number;
                tnr: number;
                text: string;
            }[];
            text: string;
        }): {
            outcomes: string[];
            classifiers: {
                classifier: string;
                coordinates: number[][];
                auc: number;
                ci: number[];
                z: number;
                p: any;
                cutoff: number;
                tpr: number;
                tnr: number;
                text: string;
            }[];
            text: string;
        };
        performance(subjects: object[], threshold?: number): {
            accuracy: number;
            classes: {
                class: string;
                prevalence: number;
                tpr: number;
                tnr: number;
                ppv: number;
                npv: number;
                f1: number;
                text: string;
            }[];
            text: string;
        };
    }) => object[];
}
