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
    let clamp: (n: number) => string;
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
}
