var DRESS;
(function (DRESS) {
    /**
     * @type {number} Set the number of digits after the decimal points.
     */
    DRESS.PRECISION = 2;
    /**
     * @type {number} Set the P value cutoff for statistical significance.
     */
    DRESS.SIGNIFICANCE = 0.05;
    /**
    * @ignore
    */
    DRESS.clamp = (n) => {
        return (+n).toFixed(DRESS.PRECISION);
    };
    /**
     * @ignore
     */
    DRESS.signed = (n) => {
        const numeric = +n;
        if (numeric < 0) {
            return '' + n;
        }
        if (numeric > 0) {
            return '+' + n;
        }
        return ' ' + DRESS.clamp(0);
    };
    /**
     * @ignore
     */
    DRESS.padEnd = (s, n) => {
        return s + (' ').repeat(n - s.length);
    };
    /**
     * @ignore
     */
    DRESS.chiSq = (z, n) => {
        let p = Math.exp(-0.5 * z);
        if (n & 1) {
            p *= Math.sqrt(2 * z / Math.PI);
        }
        let k = n;
        while (k >= 2) {
            p *= z / k;
            k -= 2;
        }
        let t = p;
        let a = n;
        while (t > (1e-15 * p)) {
            t *= z / (a += 2);
            p += t;
        }
        return 1 - p;
    };
    /**
     * @ignore
     */
    DRESS.achiSq = (p, n) => {
        let v = 0.5;
        let dv = 0.5;
        let z = 0;
        while (dv > 1e-15) {
            z = 1 / v - 1;
            dv /= 2;
            DRESS.chiSq(z, n) > p ? v -= dv : v += dv;
        }
        return z;
    };
    /**
     * @ignore
     */
    DRESS.norm = (z) => {
        z = Math.abs(z);
        const q = z * z;
        if (z > 7) {
            return (1 - 1 / q + 3 / (q * q)) * Math.exp(-q / 2) / (z * Math.sqrt(Math.PI / 2));
        }
        else {
            return DRESS.chiSq(q, 1);
        }
    };
    /**
     * @ignore
     */
    DRESS.anorm = (p) => {
        let v = 0.5;
        let dv = 0.5;
        let z = 0;
        while (dv > 1e-15) {
            z = 1 / v - 1;
            dv /= 2;
            DRESS.norm(z) > p ? v -= dv : v += dv;
        }
        return z;
    };
    /**
     * @ignore
     */
    DRESS.fdist = (f, n1, n2) => {
        let loop = (e, t, n, r) => {
            let i = 1;
            let o = 1;
            let a = t;
            while (a <= n) {
                o += i = i * e * a / (a - r);
                a += 2;
            }
            return o;
        };
        //
        const r = n2 / (n1 * f + n2);
        if ((n1 & 1) === 0) {
            return loop(1 - r, n2, n1 + n2 - 4, n2 - 2) * (Math.pow(r, (n2 / 2)));
        }
        if ((n2 & 1) === 0) {
            return 1 - loop(r, n1, n1 + n2 - 4, n1 - 2) * (Math.pow((1 - r), (n1 / 2)));
        }
        //
        const PID2 = Math.PI / 2;
        const i = Math.atan(Math.sqrt(n1 * f / n2));
        const sin = Math.sin(i);
        const cos = Math.cos(i);
        let o = i / PID2;
        if (n2 > 1) {
            o += sin * cos * loop(cos * cos, 2, n2 - 3, -1) / PID2;
        }
        if (n1 === 1) {
            return 1 - o;
        }
        let s = 4 * loop(sin * sin, n2 + 1, n1 + n2 - 4, n2 - 2) * sin * (Math.pow(cos, n2)) / Math.PI;
        if (n2 === 1) {
            return 1 - o + s / 2;
        }
        let u = 2;
        while (u <= (n2 - 1) / 2) {
            s = s * u / (u - 0.5);
            u += 1;
        }
        return 1 - o + s;
    };
    /**
     * @ignore
     */
    DRESS.afdist = (p, n1, n2) => {
        let v = 0.5;
        let dv = 0.5;
        let z = 0;
        while (dv > 1e-15) {
            z = 1 / v - 1;
            dv /= 2;
            DRESS.fdist(z, n1, n2) > p ? v -= dv : v += dv;
        }
        return z;
    };
    /**
     * @ignore
     */
    DRESS.tdist = (z, n1) => {
        let loop = (e, t, n, r) => {
            let i = 1;
            let o = 1;
            let a = t;
            while (a <= n) {
                o += i = i * e * a / (a - r);
                a += 2;
            }
            return o;
        };
        //
        const PID2 = Math.PI / 2;
        const n = Math.atan((z = Math.abs(z)) / Math.sqrt(n1));
        const sin = Math.sin(n);
        const cos = Math.cos(n);
        if (n1 === 1) {
            return 1 - n / PID2;
        }
        return ((n1 & 1) === 1) ? 1 - (n + sin * cos * loop(cos * cos, 2, n1 - 3, -1)) / PID2 : 1 - sin * loop(cos * cos, 1, n1 - 3, -1);
    };
    /**
     * @ignore
     */
    DRESS.atdist = (p, n1) => {
        let v = 0.5;
        let dv = 0.5;
        let z = 0;
        while (dv > 1e-15) {
            z = 1 / v - 1;
            dv /= 2;
            DRESS.tdist(z, n1) > p ? v -= dv : v += dv;
        }
        return z;
    };
    /**
     * @ignore
     */
    DRESS.get = (object, path) => path.split('.').reduce((object, segment) => ((object === null) || (typeof object[segment] === 'undefined')) ? null : object[segment], object);
    /**
     * @ignore
     */
    DRESS.set = (object, path, value) => {
        const segments = path.split('.');
        const segment = segments.pop();
        segments.reduce((object, segment) => (typeof object[segment] === 'undefined') ? (object[segment] = {}) : object[segment], object)[segment] = value;
    };
    /**
     * @ignore
     */
    DRESS.del = (object, path) => {
        const segments = path.split('.');
        while (segments.length) {
            const segment = segments.pop();
            const child = segments.reduce((object, segment) => (typeof object[segment] === 'undefined') ? (object[segment] = {}) : object[segment], object);
            delete child[segment];
            if (Object.keys(child).length) {
                break;
            }
        }
    };
    /**
     * @ignore
     */
    DRESS.numeric = (value) => Array.isArray(value) ? value.length : +value;
    /**
     * @ignore
     */
    DRESS.categoric = (value) => Array.isArray(value) ? value.sort().join() : value;
    /**
     * @type {number} Set the random number generator seed.
     */
    DRESS.SEED = 1 + Math.floor(Math.random() * 0x7FFFFFFE);
    /**
     * @ignore
     */
    DRESS.random = () => {
        DRESS.SEED = (DRESS.SEED * 16807) % 0x7FFFFFFF;
        return DRESS.SEED / 0x80000000;
    };
    /**
     * @ignore
     */
    DRESS.randi = (max) => Math.floor(DRESS.random() * max);
    /**
     * @ignore
     */
    DRESS.mode = (values) => {
        if (values.length === 0) {
            return null;
        }
        const counts = new Map();
        let i = values.length;
        while (i--) {
            counts.set(values[i], (counts.get(values[i]) || 0) + 1);
        }
        return Array.from(counts).sort((a, b) => a[1] - b[1]).pop()[0];
    };
    /**
     * @ignore
     */
    DRESS.mean = (values) => {
        if (values.length === 0) {
            return null;
        }
        return DRESS.sum(values) / values.length;
    };
    /**
     * @ignore
     */
    DRESS.sum = (values) => {
        let sum = 0;
        let i = values.length;
        while (i--) {
            sum += values[i];
        }
        return sum;
    };
    /**
     * @ignore
     */
    DRESS.accuracies = (predictions) => {
        const matrices = new Map();
        const length = predictions.length;
        let accuracy = 0;
        let i = length;
        while (i--) {
            const expectation = predictions[i][0];
            const prediction = predictions[i][1];
            if (expectation === prediction) {
                accuracy += 1;
            }
            const expect = matrices.get(expectation) || [0, 0, 0];
            expect[0] += 1;
            if (expectation === prediction) {
                expect[1] += 1;
            }
            else {
                const predict = matrices.get(prediction) || [0, 0, 0];
                predict[2] += 1;
                matrices.set(prediction, predict);
            }
            matrices.set(expectation, expect);
        }
        const pad = Array.from(matrices.keys()).reduce((max, cls) => Math.max(max, cls.length), 0);
        return {
            accuracy: accuracy / length,
            classes: Array.from(matrices).map(([cls, matrix]) => {
                const tp = matrix[1];
                const fp = matrix[2];
                const fn = matrix[0] - tp;
                const tn = length - tp - fp - fn;
                const tpr = tp / (tp + fn);
                const tnr = tn / (fp + tn);
                const ppv = tp / (tp + fp);
                const npv = tn / (fn + tn);
                const prevalence = (tp + fn) / length;
                const f1 = 2 * ppv * tpr / (ppv + tpr);
                return {
                    class: cls,
                    prevalence,
                    tpr,
                    tnr,
                    ppv,
                    npv,
                    f1,
                    text: DRESS.padEnd(cls, pad) + ': ' + DRESS.clamp(prevalence * 100) + '%'
                        + '	tpr: ' + DRESS.clamp(tpr) + '	tnr: ' + DRESS.clamp(tnr)
                        + '	ppv: ' + DRESS.clamp(ppv) + '	npv: ' + DRESS.clamp(npv) + '	f1: ' + DRESS.clamp(f1)
                };
            }),
            text: 'accuracy: ' + DRESS.clamp(accuracy / length * 100) + '%'
        };
    };
    /**
     * @ignore
     */
    DRESS.errors = (predictions) => {
        let sse = 0;
        let mae = 0;
        let X = 0;
        let Y = 0;
        let X2 = 0;
        let Y2 = 0;
        let XY = 0;
        const numPrediction = predictions.length;
        for (let i = 0; i < numPrediction; i++) {
            const x = predictions[i][0];
            const y = predictions[i][1];
            const error = Math.abs(x - y);
            sse += error * error;
            mae += error;
            //
            X += x;
            Y += y;
            X2 += x * x;
            Y2 += y * y;
            XY += x * y;
        }
        let r2 = (numPrediction * XY - X * Y) / (Math.sqrt(numPrediction * X2 - X * X) * Math.sqrt(numPrediction * Y2 - Y * Y));
        r2 *= r2;
        mae /= numPrediction;
        const rmse = Math.sqrt(sse / numPrediction);
        return {
            r2,
            mae,
            rmse,
            text: 'r2: ' + DRESS.clamp(r2) + '	mae: ' + DRESS.clamp(mae) + '	rmse: ' + DRESS.clamp(rmse)
        };
    };
})(DRESS || (DRESS = {}));
