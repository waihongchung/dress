var DRESS;
(function (DRESS) {
    /**
     * @summary Log Gamma Function
     *
     * @description https://www.math.ucla.edu/~tom/distributions/gamma.html
     */
    const lgamma = (z) => {
        return (z - 0.5) * Math.log(z + 4.5) - (z + 4.5) + Math.log(2.50662827465 + 190.9551718958486336445 / z - 216.8366818468334686345 / (z + 1) + 60.194417588474236123 / (z + 2) - 3.0875130978093060694 / (z + 3) + 0.0030294608753753452395 / (z + 4) - 0.000013445102872133163 / (z + 5));
    };
    /**
     * @summary Incomplete Gamma Function
     *
     * @description https://www.math.ucla.edu/~tom/distributions/gamma.html
     */
    const gamma = (z, a) => {
        if (z <= 0) {
            return 0;
        }
        else if (z < a + 1) {
            // Serial representation
            let a0 = 1 / a;
            let a1 = a0;
            let n = 0;
            while (a0 / a1 > Number.EPSILON) { //ZERO
                a0 *= z / (a + ++n);
                a1 += a0;
            }
            return a1 * Math.exp(a * Math.log(z) - z - lgamma(a));
        }
        else {
            // Continous fraction representation
            let a0 = 0;
            let b0 = 1;
            let a1 = 1;
            let b1 = z;
            let a2 = 0;
            let n = 0;
            while (Math.abs((a1 - a2) / a1) > Number.EPSILON) { //ZERO
                a2 = a1;
                n++;
                a0 = a1 + (n - a) * a0;
                b0 = b1 + (n - a) * b0;
                a1 = z * a0 + n * a1;
                b1 = z * b0 + n * b1;
                a0 /= b1;
                b0 /= b1;
                a1 /= b1;
                b1 = 1;
            }
            return 1 - a1 * Math.exp(a * Math.log(z) - z - lgamma(a));
        }
    };
    /**
     * @summary Beta Distribution Function
     *
     * @description Calculate the cumulative probability of P(x ≤ z) in beta distribution. view-source:https://www.math.ucla.edu/~tom/distributions/beta.html
     */
    const beta = (z, a, b) => {
        const beta = (z, a, b) => {
            let a0 = 0;
            let b0 = 1;
            let a1 = 1;
            let b1 = 1;
            let a2 = 0;
            let n = 0;
            while (Math.abs((a1 - a2) / a1) > Number.EPSILON) { //ZERO
                a2 = a1;
                let m = -(a + n) * (a + b + n) * z / (a + 2 * n) / (a + 2 * n + 1);
                a0 = a1 + m * a0;
                b0 = b1 + m * b0;
                n++;
                m = n * (b - n) * z / (a + 2 * n - 1) / (a + 2 * n);
                a1 = a0 + m * a1;
                b1 = b0 + m * b1;
                a0 /= b1;
                b0 /= b1;
                a1 /= b1;
                b1 = 1;
            }
            return a1 / a;
        };
        //
        const cdf = Math.exp(lgamma(a + b) - lgamma(b) - lgamma(a) + a * Math.log(z) + b * Math.log(1 - z));
        if (z < (a + 1) / (a + b + 2)) {
            return cdf * beta(z, a, b);
        }
        else {
            return 1 - cdf * beta(1 - z, b, a);
        }
    };
    /**
     * @summary Inverse Distribtion Function
     *
     * @description Calculate the inverse of a probability distribution function.
     *
     */
    const inverse = (f, p) => {
        let v = 0.5;
        let dv = 0.5;
        let z = 0;
        while (dv > Number.EPSILON) { //ZERO
            dv /= 2;
            v += f(z = 1 / v - 1) > p ? -dv : dv;
        }
        return z;
    };
    /**
     * @summary Normal Distribution Function
     *
     * @description Calculate the two tailed probability of P(x ≤ -z ∪ x ≥ z) in normal distribution. https://www.math.ucla.edu/~tom/distributions/normal.html
     */
    DRESS.norm = (z) => {
        const t = 1 / (1 + 0.231641888 * (z > 0 ? z : -z));
        return Math.exp(-z * z / 2) * t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    };
    /**
     * @summary Inverse Normal Distribution Function
     */
    DRESS.inorm = (p) => {
        return inverse((z) => DRESS.norm(z), p);
    };
    /**
     * @summary Chi Square Distribution Function
     *
     * @description Calculate the cumulative probability of P(x ≤ z) in Chi Square distribution.
     */
    DRESS.chi2 = (z, a) => {
        return 1 - gamma(z / 2, a / 2);
    };
    /**
     * @summary Inverse Chi Square Distribution Function
     */
    DRESS.ichi2 = (p, a) => {
        return inverse((z) => DRESS.chi2(z, a), p);
    };
    /**
     * @summary Student T Distribution Function
     *
     * @description Calculate the cumulative probability of P(x ≤ -z ∪ x ≥ z) in Student T distribution. https://www.math.ucla.edu/~tom/distributions/tDist.html
     */
    DRESS.studentt = (z, a) => {
        return beta(a / (a + z * z), a / 2, 0.5);
    };
    /**
    * @summary Inverse Student T Distribution Function
    */
    DRESS.istudentt = (p, a) => {
        return inverse((z) => DRESS.studentt(z, a), p);
    };
    /**
    * @summary Central F Distribution Function
    *
    * @description Calculate the cumulative probability of P(x ≤ z) in Central F distribution. https://www.math.ucla.edu/~tom/distributions/fDist.html
    */
    DRESS.centralf = (z, a, b) => {
        if (z <= 0) {
            return 0;
        }
        else {
            return 1 - beta(z / (z + b / a), a / 2, b / 2);
        }
    };
    /**
    * @summary Inverse Central F Distribution Function
    */
    DRESS.icentralf = (p, a, b) => {
        return inverse((z) => DRESS.centralf(z, a, b), p);
    };
    /**
     * @type {number} Set the number of digits after the decimal points.
     */
    DRESS.PRECISION = 3;
    /**
     * @type {number} Set the P value cutoff for statistical significance.
     */
    DRESS.SIGNIFICANCE = 0.05;
    /**
    * @summary Set a numerical value to a fixed number of decimal points specified by DRESS.PRECISION.
    */
    DRESS.clamp = (n, p = DRESS.PRECISION) => {
        return (+n).toFixed(p);
    };
    /**
     * @summary Prepend the sign "+/-" to a string representation of a numerical value.
     */
    DRESS.sign = (n) => {
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
     * @summary Pad a string to the specified length by appending spaces to the right.
     */
    DRESS.pad = (s, n) => {
        const p = n - s.length;
        return s + (' ').repeat(p > 0 ? p : 0);
    };
    /**
     * @summary Get the maximum length from an array of strings.
     */
    DRESS.longest = (strings) => {
        return strings.reduce((max, string) => Math.max(max, string.length), 0);
    };
    /**
     * @summary Get the name of variable.
     */
    DRESS.nameof = (f) => {
        return f.toString().replace(/[ |\(\)=>]/g, '');
    };
    /**
     * @summary Remove functions from an object's property.
     */
    DRESS.defunc = (object) => {
        if (('object' === typeof object) && (object))
            Object.keys(object).forEach(key => 'function' === typeof object[key] ? delete object[key] : DRESS.defunc(object[key]));
        return object;
    };
    /**
     * @summary Restore an object's function property.
     */
    DRESS.enfunc = (object) => {
        if (('object' === typeof object) && (object)) {
            const keys = Object.keys(object);
            keys.forEach(key => object[key] = DRESS.enfunc(object[key]));
            if ('string' === typeof object['async']) {
                const async = DRESS.get(self, object['async']);
                if (('function' === typeof async) && (keys.length > 1))
                    return async.call(null, object);
                return async;
            }
        }
        return object;
    };
    /**
     * @summary Get the value of an object's specified property, using the dot notation.
     */
    DRESS.get = (object, path) => path.split('.').reduce((object, segment) => ((object === null) || (typeof object[segment] === 'undefined')) ? null : object[segment], object);
    /**
     * @summary Set an object's specified property to the specified value.
     */
    DRESS.set = (object, path, value) => {
        const segments = path.split('.');
        const segment = segments.pop();
        segments.reduce((object, segment) => (typeof object[segment] === 'undefined') ? (object[segment] = {}) : object[segment], object)[segment] = value;
    };
    /**
     * @summary Delete an object's specified property as well as the parent property if it is empty.
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
     * @summary Convert the specified value into a numerical value. If the value is an array, then return the length of the array.
     */
    DRESS.numeric = (value) => Array.isArray(value) ? value.length : +value;
    /**
     * @summary Convert the specified value into a categorical value. If the value is an array, the elements are sorted and is returned as a JSON string.
     */
    DRESS.categoric = (value) => Array.isArray(value) ? value.sort().join() : String(value);
    /**
     * @summary Extract the specified features from an array of subjects and convert the values into an array of arrays.
     */
    DRESS.tabulate = (subjects, numericals, categoricals = [], functions = []) => {
        const num = numericals.length;
        const cat = categoricals.length;
        const func = functions.length;
        //        
        let i = subjects.length;
        const rows = Array(i);
        while (i--) {
            const subject = subjects[i];
            const row = Array(num + cat + func);
            //
            let j = func;
            while (j--) {
                row[num + cat + j] = functions[j](subject, i);
            }
            j = cat;
            while (j--) {
                row[num + j] = DRESS.categoric(DRESS.get(subject, categoricals[j]));
            }
            j = num;
            while (j--) {
                row[j] = DRESS.numeric(DRESS.get(subject, numericals[j]));
            }
            rows[i] = row;
        }
        return rows;
    };
    /**
     * @summary Classify a categorical value.
     *
     * Use a simple array instead of a map because the number of classes is expected to be small.
     */
    DRESS.classify = (cls, classes) => {
        let index = classes.indexOf(cls);
        if (index === -1) {
            index = classes.push(cls) - 1;
        }
        return index;
    };
    /**
     * @type {number} Set the pseudo-random number generator seed.
     */
    DRESS.SEED = 1 + ~~(Math.random() * 0x7FFFFFFE);
    /**
     * @summary Generate the next pseudo-random number (0 ≤ x < 1).
     */
    DRESS.rand = () => {
        DRESS.SEED = (DRESS.SEED * 16807) % 0x7FFFFFFF;
        return DRESS.SEED / 0x80000000;
    };
    /**
     * @summary Generate the next pseudo-random integer (0 ≤ x < max)
     */
    DRESS.randi = (max) => ~~(DRESS.rand() * max);
    /**
     * @summary Generate the next normally distributed pseudo-random number.
     */
    DRESS.randn = () => {
        let u, v, s;
        do {
            u = 2 * DRESS.rand() - 1;
            v = 2 * DRESS.rand() - 1;
            s = u * u + v * v;
        } while (s >= 1 || s === 0);
        return u * Math.sqrt(-2 * Math.log(s) / s);
    };
    /**
     * @summary Generate a UUID.
     */
    DRESS.uuid = () => ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >>> (+c >>> 2)).toString(16));
    /**
     * @summary Shuffle in place the elements in an array randomly.
     */
    DRESS.shuffle = (array) => {
        let i = array.length;
        while (i--) {
            const j = DRESS.randi(i + 1);
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };
    /**
     * @summary Return the sum (or the weighed sum) of the specified numerical values using the Kahan summation algorithm
     */
    DRESS.sum = (values, weights = []) => {
        let sum = 0;
        let c = 0;
        let i = values.length;
        if (values.length === weights.length) {
            while (i--) {
                const y = (values[i] * weights[i]) - c;
                const t = sum + y;
                c = (t - sum) - y;
                sum = t;
            }
        }
        else {
            while (i--) {
                const y = values[i] - c;
                const t = sum + y;
                c = (t - sum) - y;
                sum = t;
            }
        }
        return sum;
    };
    /**
     * @summary Return the arthrithmic mean (or the weighed arthrithmic mean) of the specified numerical values
     */
    DRESS.mean = (values, weights = []) => {
        if (values.length === weights.length) {
            return DRESS.sum(values, weights) / (DRESS.sum(weights) + Number.EPSILON);
        }
        return DRESS.sum(values) / values.length;
    };
    /**
     * @summary Return the statistical mode (or weighed statistical mode) from a list of specified values. Able to handle array as value.
     */
    DRESS.mode = (values, weights = []) => {
        let max = Number.NEGATIVE_INFINITY;
        let mode = null;
        const counts = new Map();
        let i = values.length;
        if (values.length === weights.length) {
            while (i--) {
                const value = DRESS.categoric(values[i]);
                const count = (counts.get(value) || 0) + weights[i];
                counts.set(value, count);
                if (count > max) {
                    max = count;
                    mode = values[i]; // MUST use the unaltered raw values[i];
                }
            }
        }
        else {
            while (i--) {
                const value = DRESS.categoric(values[i]);
                const count = (counts.get(value) || 0) + 1;
                counts.set(value, count);
                if (count > max) {
                    max = count;
                    mode = values[i]; // MUST use the unaltered raw values[i];
                }
            }
        }
        return mode;
    };
    /**
     * @summary Return the mean, variance, skewness, excess kurtosis, and error of the specified numerical values.
     */
    DRESS.moments = (values) => {
        const count = values.length;
        let m1 = 0;
        let m2 = 0;
        let m3 = 0;
        let m4 = 0;
        for (let i = 0; i < count; i++) {
            const n = i + 1;
            const delta = (values[i] - m1);
            const delta_n = delta / n;
            const delta_n2 = delta_n * delta_n;
            const term = delta * delta_n * i;
            m1 += delta_n;
            m4 += term * delta_n2 * (n * n - 3 * n + 3) + 6 * delta_n2 * m2 - 4 * delta_n * m3;
            m3 += term * delta_n * (n - 2) - 3 * delta_n * m2;
            m2 += term;
        }
        return [m1, m2 / count, Math.sqrt(count) * m3 / (Math.pow(m2, 1.5)), count * m4 / (m2 * m2) - 3, Math.sqrt(m2) / count];
    };
    /**
     * @sumary Return the median, iqr, skewness, excess kurtosis, and an sorted array of the specified numerical values.
     */
    DRESS.quartiles = (values) => {
        const count = values.sort((a, b) => a - b).length;
        let i = count;
        const median = (i & 1) ? values[(i - 1) / 2] : (values[i / 2] + values[i / 2 - 1]) / 2;
        i >>>= 1;
        const q25 = (i & 1) ? values[(i - 1) / 2] : (values[i / 2] + values[i / 2 - 1]) / 2;
        const q75 = (i & 1) ? values[count - 1 - (i - 1) / 2] : (values[count - i / 2] + values[count - 1 - i / 2]) / 2;
        const iqr = q75 - q25;
        const p10 = values[~~(count * 0.1)];
        const p90 = values[~~(count * 0.9)];
        return [median, iqr, (q25 + q75 - 2 * median) / iqr, iqr / (2 * (p90 - p10)) - 0.263, values];
    };
    /**
     * @summary Compute the root of any function between x0 and x1.
     */
    DRESS.root = (f, x0, x1) => {
        const ZERO = Math.pow(10, -(DRESS.PRECISION + 3));
        //
        let y0 = f(x0);
        let y1 = f(x1);
        let x;
        while (Math.abs(x1 - x0) > ZERO) {
            const x2 = (x0 + x1) / 2;
            const y2 = f(x2);
            x = x2 + (x2 - x0) * ((y0 > y1) ? y2 : -y2) / Math.sqrt(y2 * y2 - y0 * y1);
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
     * @summary Compute the minima of any function between x0 and x1.
     */
    DRESS.minima = (f, x0, x1) => {
        const ZERO = Math.pow(10, -(DRESS.PRECISION + 3));
        //
        const GOLDEN = 0.381966011250105097;
        let x = x0 + GOLDEN * (x1 - x0);
        let f0 = f(x);
        let x2 = x;
        let x3 = x2;
        let f1 = f0;
        let f2 = f1;
        let d = 0;
        let e = 0;
        while (Math.abs(x1 - x0) > ZERO) {
            const m = (x0 + x1) / 2;
            let r = 0;
            let q = 0;
            let p = 0;
            if (Math.abs(e) > ZERO) {
                r = (x - x2) * (f0 - f2);
                q = (x - x3) * (f0 - f1);
                p = (x - x3) * q - (x - x2) * r;
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
            if ((Math.abs(q * r * 0.5) > Math.abs(p)) && (p > (q * (x0 - x))) && (p < (q * (x1 - x)))) {
                d = p / q;
            }
            else {
                e = (x < m) ? x1 - x : x0 - x;
                d = GOLDEN * e;
            }
            const u = x + d;
            const fu = f(u);
            if (fu <= f0) {
                if (u < x) {
                    x1 = x;
                }
                else {
                    x0 = x;
                }
                x3 = x2;
                f2 = f1;
                x2 = x;
                f1 = f0;
                x = u;
                f0 = fu;
            }
            else {
                if (u < x) {
                    x0 = u;
                }
                else {
                    x1 = u;
                }
                if ((fu <= f1) || (x2 === x)) {
                    x3 = x2;
                    f2 = f1;
                    x2 = u;
                    f1 = fu;
                }
                else if ((fu <= f2) || (x3 === x) || (x3 === x2)) {
                    x3 = u;
                    f2 = fu;
                }
            }
        }
        return x;
    };
    /**
     * @summary Normalize the specified numerical values into a probability distribution using the softmax function.
     *
     * @description *** This method directly modifies the values of the specified array. ***
     */
    DRESS.softmax = (values) => {
        const length = values.length;
        let max = Number.NEGATIVE_INFINITY;
        let i = length;
        while (i--) {
            if (values[i] > max) {
                max = values[i];
            }
        }
        let sum = 0;
        i = length;
        while (i--) {
            sum += (values[i] = Math.exp(values[i] - max));
        }
        i = length;
        while (i--) {
            values[i] /= sum;
        }
        return values;
    };
    /**
     * @summary Binary search.
     *
     * @description Perform a binary search for index of the element closest to a given number in an ordered array that may contain null values.
     */
    DRESS.binary = (array, target) => {
        let left = 0;
        let right = array.length - 1;
        let index = -1;
        let minDiff = Number.POSITIVE_INFINITY;
        //
        while (left <= right) {
            let mid = (left + right) >>> 1;
            //
            if (array[mid] === null) {
                let leftNonNull = mid - 1;
                let rightNonNull = mid + 1;
                while (true) {
                    if (leftNonNull < left && rightNonNull > right) {
                        return index;
                    }
                    if (leftNonNull >= left && array[leftNonNull] !== null) {
                        mid = leftNonNull;
                        break;
                    }
                    if (rightNonNull <= right && array[rightNonNull] !== null) {
                        mid = rightNonNull;
                        break;
                    }
                    leftNonNull--;
                    rightNonNull++;
                }
            }
            //
            let diff = array[mid] - target;
            if (diff === 0) {
                return mid;
            }
            if (diff < 0) {
                diff = -diff; // Convert to positive
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
            if (diff < minDiff) {
                minDiff = diff;
                index = mid;
            }
        }
        return index;
    };
    /**
     * @summary Hungarian algorithm for optimal matching.
     *
     * @description The number of columns in the cost matrix must be equal to or greater than the number of rows.
     */
    DRESS.hungarian = (matrix) => {
        // numRow MUST be <= numCol
        const numRow = matrix.length;
        const numCol = matrix[0] && matrix[0].length;
        //
        let cost = 0;
        //        
        const rowOffsets = Array(numRow).fill(0);
        const colOffsets = Array(numCol).fill(0);
        const matchedRows = Array(numCol).fill(-1);
        const colSwaps = Array(numCol).fill(-1);
        //
        const colMins = Array(numCol);
        const used = Array(numCol);
        //
        let row = numRow;
        while (row--) {
            // Reset colMins and used for each row
            colMins.fill(Number.POSITIVE_INFINITY);
            used.fill(false);
            // Reset matchedCol to -1;
            let matchedCol = -1;
            let curRow = row;
            while (curRow !== -1) {
                let min = Number.POSITIVE_INFINITY;
                let minCol = 0;
                // Find min column in current row
                let col = numCol;
                while (col--) {
                    if (!used[col]) {
                        const value = matrix[curRow][col] - rowOffsets[curRow] + colOffsets[col];
                        // Mark the column switch is there is already a matched columm
                        if (value < colMins[col]) {
                            colMins[col] = value;
                            colSwaps[col] = matchedCol;
                        }
                        if (colMins[col] < min) {
                            min = colMins[col];
                            minCol = col;
                        }
                    }
                }
                // Adjust row offset and global cost by min
                rowOffsets[row] += min;
                cost += min;
                //
                col = numCol;
                while (col--) {
                    if (used[col]) {
                        // If column is already used, adjust to previously matched row offset and col offset by min
                        rowOffsets[matchedRows[col]] += min;
                        colOffsets[col] += min;
                    }
                    else {
                        // Otherwise, subtract the min to column mins
                        colMins[col] -= min;
                    }
                }
                //
                matchedCol = minCol;
                // Mark column as used.            
                used[matchedCol] = true;
                // Set curRow to matched row, will default to -1 if this is newly matched column and break the while-loop.
                curRow = matchedRows[matchedCol];
            }
            //
            // Set matches to current row or previously matched row
            //
            while (matchedCol !== -1) {
                const col = colSwaps[matchedCol];
                matchedRows[matchedCol] = (col === -1) ? row : matchedRows[col];
                matchedCol = col;
            }
        }
        // Recycle rowOffsets array
        rowOffsets.fill(-1);
        let col = numCol;
        while (col--) {
            const row = matchedRows[col];
            if (row > -1) {
                rowOffsets[row] = col;
            }
        }
        return rowOffsets;
    };
    /**
    * @summary Internal method used by a classification/regression model to perform validation against an array of subjects.
    */
    DRESS.validate = (model, subjects, outcome, classes, ...parameters) => {
        const numSubject = subjects.length;
        const predictions = Array(numSubject);
        if (classes) {
            let i = numSubject;
            while (i--) {
                predictions[i] = [
                    model.predict(subjects[i], ...parameters),
                    DRESS.get(subjects[i], outcome)
                ];
            }
            return DRESS.accuracies(predictions);
        }
        else {
            let i = numSubject;
            while (i--) {
                predictions[i] = [
                    model.predict(subjects[i], ...parameters),
                    DRESS.numeric(DRESS.get(subjects[i], outcome))
                ];
            }
            return DRESS.errors(predictions);
        }
    };
    /**
     * @summary Internal method used by a classification/regression model to compute the area under the curve (AUC)  against an array of subjects..
     */
    DRESS.auc = (model, subjects, outcome, classes, curve, ...parameters) => {
        if (classes) {
            const numSubject = subjects.length;
            const expectations = Array(numSubject);
            const estimates = Array(numSubject);
            let i = numSubject;
            while (i--) {
                expectations[i] = DRESS.get(subjects[i], outcome);
                estimates[i] = model.estimate(subjects[i], ...parameters);
            }
            return classes.map((cls, clsIndex) => {
                const predictions = Array(numSubject);
                let i = numSubject;
                while (i--) {
                    predictions[i] = [estimates[i][clsIndex], (expectations[i] === cls) ? 1 : 0];
                }
                return curve({ predictions }, [cls], ['AUC']);
            });
        }
        return null;
    };
    /**
     * @summary Compute the accuracy of an array of classification predictions. Able to handle array as value.
     */
    DRESS.accuracies = (predictions) => {
        const matrices = new Map();
        const numPrediction = predictions.length;
        let i = numPrediction;
        while (i--) {
            const prediction = DRESS.categoric(predictions[i][0]);
            const expectation = DRESS.categoric(predictions[i][1]);
            const expect = matrices.get(expectation) || matrices.set(expectation, [0, 0, 0]).get(expectation);
            expect[0]++;
            if (expectation === prediction) {
                expect[1]++;
            }
            else {
                const predict = matrices.get(prediction) || matrices.set(prediction, [0, 0, 0]).get(prediction);
                predict[2]++;
            }
        }
        const numClass = matrices.size;
        let accuracy = 0;
        let balanced = 0;
        let macrof1 = 0;
        const padding = DRESS.longest(Array.from(matrices.keys()));
        return {
            classes: Array.from(matrices).map(([cls, matrix]) => {
                const tp = matrix[1];
                const fp = matrix[2];
                const fn = matrix[0] - tp;
                const tn = numPrediction - tp - fp - fn;
                const tpr = tp / (tp + fn + Number.EPSILON);
                const tnr = tn / (fp + tn + Number.EPSILON);
                const ppv = tp / (tp + fp + Number.EPSILON);
                const npv = tn / (fn + tn + Number.EPSILON);
                const prevalence = (tp + fn) / numPrediction;
                const f1 = 2 * ppv * tpr / (ppv + tpr + Number.EPSILON);
                accuracy += (tp + tn) / (numPrediction * numClass);
                balanced += tpr / numClass;
                macrof1 += f1 / numClass;
                return {
                    class: cls,
                    prevalence,
                    tpr,
                    tnr,
                    ppv,
                    npv,
                    f1,
                    text: DRESS.pad(cls, padding) + ' (' + DRESS.clamp(prevalence * 100) + '%): '
                        + '	tpr: ' + DRESS.clamp(tpr) + '	tnr: ' + DRESS.clamp(tnr)
                        + '	ppv: ' + DRESS.clamp(ppv) + '	npv: ' + DRESS.clamp(npv) + '	f1: ' + DRESS.clamp(f1)
                };
            }),
            accuracy,
            balanced,
            f1: macrof1,
            text: 'accuracy: ' + DRESS.clamp(accuracy * 100) + '%	balanced: ' + DRESS.clamp(balanced * 100) + '%	f1: ' + DRESS.clamp(macrof1)
        };
    };
    /**
     * @summary Compute the coefficient of determination, the mean absolute error, and the root mean squared error of an array of regression predictions.
     */
    DRESS.errors = (predictions) => {
        let mean = 0;
        let sst = 0;
        let sse = 0;
        let mae = 0;
        const length = predictions.length;
        for (let i = 0; i < length; i++) {
            const [prediction, expectation] = predictions[i];
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
})(DRESS || (DRESS = {}));
