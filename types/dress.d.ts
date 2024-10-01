declare namespace DRESS {
    /**
     * @summary Normal Distribution Function
     *
     * @description Calculate the two tailed probability of P(x ≤ -z ∪ x ≥ z) in normal distribution. https://www.math.ucla.edu/~tom/distributions/normal.html
     */
    const norm: (z: number) => number;
    /**
     * @summary Inverse Normal Distribution Function
     */
    const inorm: (p: number) => number;
    /**
     * @summary Chi Square Distribution Function
     *
     * @description Calculate the cumulative probability of P(x ≤ z) in Chi Square distribution.
     */
    const chi2: (z: number, a: number) => number;
    /**
     * @summary Inverse Chi Square Distribution Function
     */
    const ichi2: (p: number, a: number) => number;
    /**
     * @summary Student T Distribution Function
     *
     * @description Calculate the cumulative probability of P(x ≤ -z ∪ x ≥ z) in Student T distribution. https://www.math.ucla.edu/~tom/distributions/tDist.html
     */
    const studentt: (z: number, a: number) => number;
    /**
    * @summary Inverse Student T Distribution Function
    */
    const istudentt: (p: number, a: number) => number;
    /**
    * @summary Central F Distribution Function
    *
    * @description Calculate the cumulative probability of P(x ≤ z) in Central F distribution. https://www.math.ucla.edu/~tom/distributions/fDist.html
    */
    const centralf: (z: number, a: number, b: number) => number;
    /**
    * @summary Inverse Central F Distribution Function
    */
    const icentralf: (p: number, a: number, b: number) => number;
    /**
     * @type {number} Set the number of digits after the decimal points.
     */
    let PRECISION: number;
    /**
     * @type {number} Set the P value cutoff for statistical significance.
     */
    let SIGNIFICANCE: number;
    /**
    * @summary Set a numerical value to a fixed number of decimal points specified by DRESS.PRECISION.
    */
    const clamp: (n: number | string, p?: number) => string;
    /**
     * @summary Prepend the sign "+/-" to a string representation of a numerical value.
     */
    const sign: (n: number | string) => string;
    /**
     * @summary Pad a string to the specified length by appending spaces to the right.
     */
    const pad: (s: string, n: number) => string;
    /**
     * @summary Get the maximum length from an array of strings.
     */
    const longest: (strings: string[]) => number;
    /**
     * @summary Get the name of variable.
     */
    const nameof: (f: () => any) => string;
    /**
     * @summary Remove functions from an object's property.
     */
    const defunc: (object: any) => any;
    /**
     * @summary Restore an object's function property.
     */
    const enfunc: (object: any) => any;
    /**
     * @summary Get the value of an object's specified property, using the dot notation.
     */
    const get: (object: any, path: string) => any;
    /**
     * @summary Set an object's specified property to the specified value.
     */
    const set: (object: any, path: string, value: any) => void;
    /**
     * @summary Delete an object's specified property as well as the parent property if it is empty.
     */
    const del: (object: any, path: string) => void;
    /**
     * @summary Convert the specified value into a numerical value. If the value is an array, then return the length of the array.
     */
    const numeric: (value: any) => number;
    /**
     * @summary Convert the specified value into a categorical value. If the value is an array, the elements are sorted and is returned as a JSON string.
     */
    const categoric: (value: any) => string;
    /**
     * @summary Extract the specified features from an array of subjects and convert the values into an array of arrays.
     */
    const tabulate: (subjects: any[], numericals: string[], categoricals?: string[], functions?: ((subject?: any, index?: number) => any)[]) => any[][];
    /**
     * @summary Classify a categorical value.
     *
     * Use a simple array instead of a map because the number of classes is expected to be small.
     */
    const classify: (cls: string, classes: string[]) => number;
    /**
     * @type {number} Set the pseudo-random number generator seed.
     */
    let SEED: number;
    /**
     * @summary Generate the next pseudo-random number (0 ≤ x < 1).
     */
    const rand: () => number;
    /**
     * @summary Generate the next pseudo-random integer (0 ≤ x < max)
     */
    const randi: (max: number) => number;
    /**
     * @summary Generate the next normally distributed pseudo-random number.
     */
    const randn: () => number;
    /**
     * @summary Generate a UUID.
     */
    const uuid: () => string;
    /**
     * @summary Shuffle in place the elements in an array randomly.
     */
    const shuffle: (array: any[]) => any[];
    /**
     * @summary Return the sum (or the weighed sum) of the specified numerical values using the Kahan summation algorithm
     */
    const sum: (values: number[], weights?: number[]) => number;
    /**
     * @summary Return the arthrithmic mean (or the weighed arthrithmic mean) of the specified numerical values
     */
    const mean: (values: number[], weights?: number[]) => number;
    /**
     * @summary Return the statistical mode (or weighed statistical mode) from a list of specified values. Able to handle array as value.
     */
    const mode: (values: any[], weights?: number[]) => any;
    /**
     * @summary Return the mean, variance, skewness, excess kurtosis, and error of the specified numerical values.
     */
    const moments: (values: number[]) => [mean: number, variance: number, skewness: number, kurtosis: number, error: number];
    /**
     * @sumary Return the median, iqr, skewness, excess kurtosis, and an sorted array of the specified numerical values.
     */
    const quartiles: (values: number[]) => [median: number, iqr: number, skewness: number, kurtosis: number, values: number[]];
    /**
     * @summary Compute the root of any function between x0 and x1.
     */
    const root: (f: (x: number) => number, x0: number, x1: number) => number;
    /**
     * @summary Compute the minima of any function between x0 and x1.
     */
    const minima: (f: (x: number) => number, x0: number, x1: number) => number;
    /**
     * @summary Normalize the specified numerical values into a probability distribution using the softmax function.
     *
     * @description *** This method directly modifies the values of the specified array. ***
     */
    const softmax: (values: number[]) => number[];
    /**
     * @summary Binary search.
     *
     * @description Perform a binary search for index of the element closest to a given number in an ordered array that may contain null values.
     */
    const binary: (array: number[], target: number) => number;
    /**
     * @summary Hungarian algorithm for optimal matching.
     *
     * @description The number of columns in the cost matrix must be equal to or greater than the number of rows.
     */
    const hungarian: (matrix: number[][]) => number[];
    type Algorithm = (typeof DRESS.logistic | typeof DRESS.linear | typeof DRESS.polytomous | typeof DRESS.kNN | typeof DRESS.randomForest | typeof DRESS.gradientBoosting | typeof DRESS.multilayerPerceptron);
    type Model = ReturnType<Algorithm>;
    /**
    * @summary Internal method used by a classification/regression model to perform validation against an array of subjects.
    */
    const validate: (model: Model, subjects: object[], outcome: string, classes: any[], ...parameters: any[]) => {
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
        accuracy: number;
        balanced: number;
        f1: number;
        text: string;
    } | {
        r2: number;
        mae: number;
        rmse: number;
        text: string;
    };
    /**
     * @summary Internal method used by a classification/regression model to compute the area under the curve (AUC)  against an array of subjects..
     */
    const auc: (model: Model, subjects: object[], outcome: string, classes: any[], curve: typeof roc, ...parameters: any[]) => {
        outcomes: string[];
        classifiers: {
            classifier: string;
            coordinates: number[][];
            /**
             * @summary Inverse Chi Square Distribution Function
             */
            auc: number;
            ci: number[];
            z: number;
            p: number;
            cutoff: number;
            tpr: number;
            tnr: number;
            text: string;
        }[];
        text: string;
    }[];
    /**
     * @summary Compute the accuracy of an array of classification predictions. Able to handle array as value.
     */
    const accuracies: (predictions: [prediction: any, expectation: any][]) => {
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
        accuracy: number;
        balanced: number;
        f1: number;
        text: string;
    };
    /**
     * @summary Compute the coefficient of determination, the mean absolute error, and the root mean squared error of an array of regression predictions.
     */
    const errors: (predictions: [prediction: number, expectation: number][]) => {
        r2: number;
        mae: number;
        rmse: number;
        text: string;
    };
}
