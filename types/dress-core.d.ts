declare namespace DRESS {
    /**
     * @type {number} Set the number of digits after the decimal points.
     */
    let PRECISION: number;
    /**
     * @type {number} Set the P value cutoff for statistical significance.
     */
    let SIGNIFICANCE: number;
    /**
    * @ignore
    */
    let clamp: (n: number | string) => string;
    /**
     * @ignore
     */
    let signed: (n: number | string) => string;
    /**
     * @ignore
     */
    let padEnd: (s: string, n: number) => string;
    /**
     * @ignore
     */
    let chiSq: (z: number, n: number) => number;
    /**
     * @ignore
     */
    let achiSq: (p: number, n: number) => number;
    /**
     * @ignore
     */
    let norm: (z: number) => number;
    /**
     * @ignore
     */
    let anorm: (p: number) => number;
    /**
     * @ignore
     */
    let snorm: (z: number) => number;
    /**
     * @ignore
     */
    let asnorm: (p: number) => number;
    /**
     * @ignore
     */
    let fdist: (f: number, n1: number, n2: number) => number;
    /**
     * @ignore
     */
    let afdist: (p: number, n1: number, n2: number) => number;
    /**
     * @ignore
     */
    let tdist: (z: number, n1: number) => number;
    /**
     * @ignore
     */
    let atdist: (p: number, n1: number) => number;
    /**
     * @ignore
     */
    let get: (object: any, path: string) => any;
    /**
     * @ignore
     */
    let set: (object: any, path: string, value: any) => void;
    /**
     * @ignore
     */
    let del: (object: any, path: string) => void;
    /**
     * @ignore
     */
    let numeric: (value: any) => number;
    /**
     * @ignore
     */
    let categoric: (value: any) => any;
    /**
     * @type {number} Set the random number generator seed.
     */
    let SEED: number;
    /**
     * @ignore
     */
    let random: () => number;
    /**
     * @ignore
     */
    let randi: (max: number) => number;
    /**
     * @ignore
     */
    let mode: (values: any[]) => any;
    /**
     * @ignore
     */
    let mean: (values: number[]) => number;
    /**
     * @ignore
     */
    let variance: (values: number[]) => number;
    /**
     * @ignore
     */
    let sum: (values: number[]) => number;
    /**
     * @ignore
     */
    let accuracies: (predictions: any[][]) => {
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
    /**
     * @ignore
     */
    let errors: (predictions: any[][]) => {
        r2: number;
        mae: number;
        rmse: number;
        text: string;
    };
    /**
     * @ignore
     */
    let root: (f: (x: number) => number, x0: number, x1: number) => number;
    /**
     * @ignore
     */
    let minima: (f: (x: number) => number, a: number, b: number) => number;
}
