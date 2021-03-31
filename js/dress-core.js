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
        return ((+n >= 0) ? '+' : '') + n;
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
            return loop(1 - r, n2, n1 + n2 - 4, n2 - 2) * Math.pow(r, n2 / 2);
        }
        if ((n2 & 1) === 0) {
            return 1 - loop(r, n1, n1 + n2 - 4, n1 - 2) * Math.pow(1 - r, n1 / 2);
        }
        //
        const PID2 = Math.PI / 2;
        const i = Math.atan(Math.sqrt(n1 * f / n2));
        const a = Math.sin(i);
        const l = Math.cos(i);
        let o = i / PID2;
        if (n2 > 1) {
            o += a * l * loop(l * l, 2, n2 - 3, -1) / PID2;
        }
        if (n1 === 1) {
            return 1 - o;
        }
        let s = 4 * loop(a * a, n2 + 1, n1 + n2 - 4, n2 - 2) * a * Math.pow(l, n2) / Math.PI;
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
        const r = Math.sin(n);
        const i = Math.cos(n);
        if (n1 === 1) {
            return 1 - n / PID2;
        }
        return ((n1 & 1) === 1) ? 1 - (n + r * i * loop(i * i, 2, n1 - 3, -1)) / PID2 : 1 - r * loop(i * i, 1, n1 - 3, -1);
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
    DRESS.get = (object, path) => {
        return path.split('.').reduce((object, segment) => ((object === null) || (typeof object[segment] === 'undefined')) ? null : object[segment], object);
    };
    /**
     * @ignore
     */
    DRESS.set = (object, path, value) => {
        const segments = path.split('.');
        const segment = segments.pop();
        segments.reduce((object, segment) => (typeof object[segment] === 'undefined') ? (object[segment] = {}) : object[segment], object)[segment] = value;
    };
})(DRESS || (DRESS = {}));
