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
    DRESS.chi2 = (z, n) => {
        if ((z > 1000) || (n > 1000)) {
            const q = DRESS.norm((Math.pow((z / n), (1 / 3)) + 2 / (9 * n) - 1) / Math.sqrt(2 / (9 * n))) / 2;
            if (z > n) {
                return q;
            }
            else {
                return 1 - q;
            }
        }
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
    DRESS.achi2 = (p, n) => {
        let v = 0.5;
        let dv = 0.5;
        let z = 0;
        while (dv > 1e-15) {
            z = 1 / v - 1;
            dv /= 2;
            DRESS.chi2(z, n) > p ? v -= dv : v += dv;
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
            return DRESS.chi2(q, 1);
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
    DRESS.snorm = (z) => {
        return (z < 0) ? ((z < -10) ? 0 : DRESS.chi2(z * z, 1) / 2) : ((10 < z) ? 1 : 1 - DRESS.chi2(z * z, 1) / 2);
    };
    /**
     * @ignore
     */
    DRESS.asnorm = (p) => {
        return (0 === p) ? 0.5 : (0.5 < p) ? Math.sqrt(DRESS.achi2(2 * (1 - p), 1)) : -Math.sqrt(DRESS.achi2(2 * p, 1));
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
    DRESS.randn = () => {
        let u;
        let v;
        let s;
        do {
            u = DRESS.random() * 2 - 1;
            v = DRESS.random() * 2 - 1;
            s = u * u + v * v;
        } while ((s === 0) || (s > 1));
        return u * Math.sqrt(-2 * Math.log(s) / s);
    };
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
    DRESS.wmode = (values, weights) => {
        if ((values.length === 0) || (values.length !== weights.length)) {
            return null;
        }
        const counts = new Map();
        let i = values.length;
        while (i--) {
            counts.set(values[i], (counts.get(values[i]) || 0) + weights[i]);
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
    DRESS.wmean = (values, weights) => {
        if ((values.length === 0) || (values.length !== weights.length)) {
            return null;
        }
        return DRESS.wsum(values, weights) / DRESS.sum(weights);
    };
    /**
     * @ignore
     */
    DRESS.variance = (values) => {
        const count = values.length;
        if (count === 0) {
            return null;
        }
        let mean = 0;
        let variance = 0;
        for (let i = 0; i < count; i++) {
            const delta = values[i] - mean;
            mean += delta / (i + 1);
            variance += delta * (values[i] - mean);
        }
        return variance / count;
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
    DRESS.wsum = (values, weights) => {
        let sum = 0;
        let i = values.length;
        while (i--) {
            sum += values[i] * weights[i];
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
        let mean = 0;
        let sst = 0;
        let sse = 0;
        let mae = 0;
        const length = predictions.length;
        for (let i = 0; i < length; i++) {
            const expectation = predictions[i][0];
            const prediction = predictions[i][1];
            const delta = expectation - mean;
            mean += delta / (i + 1);
            sst += delta * (expectation - mean);
            const error = Math.abs(expectation - prediction);
            mae += error;
            sse += error * error;
        }
        let r2 = 1 - sse / sst;
        mae /= length;
        const rmse = Math.sqrt(sse / length);
        return {
            r2,
            mae,
            rmse,
            text: 'r2: ' + DRESS.clamp(r2) + '	mae: ' + DRESS.clamp(mae) + '	rmse: ' + DRESS.clamp(rmse)
        };
    };
    /**
     * @ignore
     */
    DRESS.root = (f, x0, x1) => {
        const ZERO = 1 / (Math.pow(10, (DRESS.PRECISION + 3)));
        let y0 = f(x0);
        let y1 = f(x1);
        let x;
        while (Math.abs(x1 - x0) > ZERO) {
            const x2 = (x0 + x1) / 2;
            const y2 = f(x2);
            x = x2 + (x2 - x0) * ((y0 > y1) ? 1 : -1) * y2 / Math.sqrt(Math.pow(y2, 2) - y0 * y1);
            const y = f(x);
            if (y * y2 < 0) {
                x0 = x2;
                y0 = y2;
                x1 = x;
                y1 = y;
            }
            else if (y * y1 < 1) {
                x0 = x;
                y0 = y;
            }
            else {
                x1 = x;
                y1 = y;
            }
        }
        return x;
    };
    /**
     * @ignore
     */
    DRESS.minima = (f, a, b) => {
        const ZERO = 1 / (Math.pow(10, (DRESS.PRECISION + 3)));
        const GOLDEN = 0.381966011250105097;
        let x0 = a + GOLDEN * (b - a);
        let f0 = f(x0);
        let x1 = x0;
        let x2 = x1;
        let f1 = f0;
        let f2 = f1;
        let d = 0;
        let e = 0;
        while (Math.abs(b - a) > ZERO) {
            const m = (a + b) / 2;
            let r = 0;
            let q = 0;
            let p = 0;
            if (Math.abs(e) > ZERO) {
                r = (x0 - x1) * (f0 - f2);
                q = (x0 - x2) * (f0 - f1);
                p = (x0 - x2) * q - (x0 - x1) * r;
                q = (q - r) * 2;
                if (q > 0) {
                    p = -p;
                }
                else {
                    q = -q;
                }
                r = e;
                e = d;
            }
            if ((Math.abs(q * r * 0.5) > Math.abs(p)) && (p > (q * (a - x0))) && (p < (q * (b - x0)))) {
                d = p / q;
            }
            else {
                e = (x0 < m) ? b - x0 : a - x0;
                d = GOLDEN * e;
            }
            const u = x0 + d;
            const fu = f(u);
            if (fu <= f0) {
                if (u < x0) {
                    b = x0;
                }
                else {
                    a = x0;
                }
                x2 = x1;
                f2 = f1;
                x1 = x0;
                f1 = f0;
                x0 = u;
                f0 = fu;
            }
            else {
                if (u < x0) {
                    a = u;
                }
                else {
                    b = u;
                }
                if ((fu <= f1) || (x1 === x0)) {
                    x2 = x1;
                    f2 = f1;
                    x1 = u;
                    f1 = fu;
                }
                else if ((fu <= f2) || (x2 === x0) || (x2 === x1)) {
                    x2 = u;
                    f2 = fu;
                }
            }
        }
        return x0;
    };
})(DRESS || (DRESS = {}));
