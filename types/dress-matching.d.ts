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
     * @param {any} [logistic=DRESS.logistic] - A logistic regression algoritmh. Default to DRESS.logistic.
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
    /**
     * @summary Adaptive Synthetic Sampling
     *
     * @description This method creates new samples using a modified Adaptive Synthetic Sampling (ADASYN) approach, which belows to a family of Synthetic Minority Oversampling Technique (SMOTE).
     * The algorithm automatically identify the majority class and the minority classes, based on the values of the outcome variable.
     * It proceeds to build a kNN model in order to identify the nearest neighbors around each minority sample. It synthesizes new samples that are similar, but not identical to those minority samples by adding random noises.
     *
     * This implemention represents an improvement over vanilla ADASYN algorithm by enabling synthesis of categorical features and by considering the Euclidean distance between the samples,
     * in addition to their distributin densities.
     *
     * @param {object[]} subjects - The subjects to be processed.
    *  @param {string} outcome - A categorical outcome used to determine class membership.
     * @param {string[]} numericals - An array of numerical features to synthesize.
     * @param {string[]} categoricals - An array of categorical features to synthesize.
     * @param {number} [ratio=1] - The minimal ratio between the majority class and the minority class. Default to 1, which means the classes will be perfectly balanced.
     * @param {number} [k=5] - The number of neighbors to consider. Default to 5.
     * @param {any} [kNN=DRESS.kNN] - A kNN algorithm. Default to DRESS.kNN
     *
     * @returns - An array of newly synthesized samples.
     */
    let adaptiveSynthesis: (subjects: object[], outcome: string, numericals: string[], categoricals: string[], ratio?: number, k?: number, kNN?: (subjects: object | object[], numericals?: string[], categoricals?: string[], normalize?: boolean) => {
        numericals: string[];
        categoricals: string[];
        numericalScales: [min: number, range: number][];
        categoricalScales: [string, number][][];
        neighbors: [subject: object, numericals: number[], categoricals: string[]][];
        text: string;
        nearest(subject: object, k: number): [neighbor: object, distance: number][];
        predict(subject: object, outcome: string, classification?: boolean, k?: number, weighted?: boolean): any;
        roc(subjects: object[], outcome: string, k?: number, weighted?: boolean, roc?: (subjects: object | object[], outcomes: string[], classifiers: string[]) => {
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
        }[];
        performance(subjects: object[], outcome: string, classification?: boolean, k?: number, weighted?: boolean): {
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
        } | {
            r2: number;
            mae: number;
            rmse: number;
            text: string;
        };
        impute(subjects: object[], features: string[], categorical?: boolean, k?: number, weighted?: boolean): {
            feature: string;
            count: number;
            text: string;
        }[];
        match(subjects: object[], k?: number, greedy?: boolean): any[];
    }) => object[];
}
