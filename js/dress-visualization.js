var DRESS;
(function (DRESS) {
    /**
     * @summary Generate ASCII histograms
     *
     * @description This method generates an ASCII histogram for each of the specified numerical or categorical features. It also displays the number and percentage of non-null values for each specified feature.
     *
     * @param {object[]} subjects - The subjects to be analyzed.
     * @param {string[]} numericals - An array of numerical features to be analyzed.
     * @param {string[]} categoricals - An array of categorical features to be analyzed.
     * @param {number} [width=20] - The width of the histogram. Default to 20.
     *
     * @returns {object[]} An array of result objects, one for each specified numerical or categorical feature, containing the following properties:
     *   - feature (the feature being evaluated),
     *   - count (the number of non-null values),
     *   - histogram (the histogram, which contains an array of ticks, values, and texts),
     *   - text.
     */
    DRESS.histograms = (subjects, numericals = [], categoricals = [], width = 20) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        //
        const padding = DRESS.longest(numericals.concat(categoricals));
        //
        const numSubject = subjects.length;
        return numericals.map(feature => {
            const values = Array(numSubject);
            let min = Number.POSITIVE_INFINITY;
            let max = Number.NEGATIVE_INFINITY;
            let count = 0;
            let i = numSubject;
            while (i--) {
                let value = DRESS.get(subjects[i], feature);
                if (value !== null) {
                    value = DRESS.numeric(value);
                    if (value < min) {
                        min = value;
                    }
                    if (value > max) {
                        max = value;
                    }
                    values[count++] = value;
                }
            }
            //
            const numBin = Math.ceil(Math.log(numSubject) + 1); // Sturges' rule
            const interval = (max - min) / numBin + Number.EPSILON;
            const bins = Array(numBin).fill(0);
            i = count;
            while (i--) {
                const bin = ~~((values[i] - min) / interval);
                bins[bin < numBin ? bin : numBin - 1] += 1;
            }
            let scale = Number.NEGATIVE_INFINITY;
            i = numBin;
            while (i--) {
                if (bins[i] > scale) {
                    scale = bins[i];
                }
            }
            //                     
            return {
                feature,
                count,
                histogram: bins.map((bin, index) => {
                    const tick = min + index * interval;
                    const value = bin / scale;
                    return {
                        tick,
                        value,
                        text: DRESS.clamp(tick) + '	|' + DRESS.pad('='.repeat(Math.round(value * width)), width) + '|	' + bin + '	(' + DRESS.clamp(bin / numSubject * 100) + '%)'
                    };
                }),
                text: DRESS.pad(feature, padding) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        }).concat(categoricals.map(feature => {
            const values = new Map();
            let count = 0;
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (value !== null) {
                    //(Array.isArray(value) ? value : [value]).forEach(value => {
                    [].concat(value).forEach(value => {
                        value = DRESS.categoric(value);
                        values.set(value, (values.get(value) || 0) + 1);
                    });
                    count++;
                }
            }
            const bins = Array.from(values).sort(([a,], [b,]) => a > b ? 1 : -1);
            const padding2 = DRESS.longest(bins.map(bin => String(bin[0])));
            //
            let scale = Number.NEGATIVE_INFINITY;
            i = bins.length;
            while (i--) {
                if (bins[i][1] > scale) {
                    scale = bins[i][1];
                }
            }
            //            
            return {
                feature,
                count,
                histogram: bins.map(bin => ({
                    tick: bin[0],
                    value: bin[1] / scale,
                    text: DRESS.pad(bin[0], padding2) + ' |' + DRESS.pad('='.repeat(Math.round(bin[1] / scale * width)), width) + '|	' + bin[1] + '	(' + DRESS.clamp(bin[1] / numSubject * 100) + '%)'
                })),
                text: DRESS.pad(feature, padding) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        }));
    };
    /**
     * @summary Generate a heatmap from a correlation matrix and optionally compare the values to a second correlation matrix
     *
     * @description This method is designed to convert the result objects returned by DRESS.correlations into a heatmap.
     * If two correlation matrices of the same size are specified, the differences between two corresponding correlation coefficients are reported and the statistical signifiance of the difference is calculated using the Fisher Z-Transformation.
     *
     * @param {object[]} matrix - The correlation matrix.
     * @param {object[]} [matrix2=null] - Optional, a second correlation matrix for comparison.
     *
     * @returns {string} An HTML formatted text that renders a heatmap representation of the specified correlation matrix.
     */
    DRESS.heatmap = (matrix, matrix2 = null) => {
        const numFeature = matrix.length;
        if (numFeature === 0) {
            return '';
        }
        if ((matrix2 !== null) && (matrix2.length !== numFeature)) {
            return '';
        }
        //
        const features = matrix.map(row => row.feature);
        const padding = DRESS.longest(features);
        //
        let lines = '<p><pre>' + DRESS.pad('', padding) + '    	' + [...Array(numFeature)].map((_, index) => '[' + (index + 1) + ']').join('	') + '</pre></p>';
        for (let i = 0; i < numFeature; i++) {
            const correlations1 = matrix[i].correlations;
            const correlations2 = matrix2 && matrix2[i].correlations;
            const Rs = Array(numFeature).fill(null);
            const Ps = Array(numFeature).fill(null);
            let j = correlations1.length;
            while (j--) {
                const index = features.indexOf(correlations1[j].feature);
                if (correlations2) {
                    const r1 = correlations1[j].r;
                    const r2 = correlations2[j].r;
                    const se = 2 * Math.sqrt((Math.pow(r1, 2)) / (Math.pow(correlations1[j].t, 2) * (1 - Math.pow(r1, 2))) + (Math.pow(r2, 2)) / (Math.pow(correlations2[j].t, 2) * (1 - Math.pow(r2, 2))));
                    Rs[index] = r1 - r2;
                    Ps[index] = DRESS.norm((Math.log((1 + r1) / (1 - r1)) - Math.log((1 + r2) / (1 - r2))) / se);
                }
                else {
                    Rs[index] = correlations1[j].r;
                    Ps[index] = correlations1[j].p;
                }
            }
            lines += '<p><pre>' + DRESS.pad(features[i], padding) + ' [' + (i + 1) + ']	' +
                Rs.map((r, index) => {
                    if (r === null) {
                        return ' '.repeat(DRESS.PRECISION + 3) + '	';
                    }
                    let cell = '<span style="background-color:rgba(';
                    if (r > 0) {
                        cell += '0,128,0,' + r;
                    }
                    else {
                        cell += '0,0,128,' + (-r);
                    }
                    cell += ')"' + (((Ps[index] !== null) && (Ps[index] < DRESS.SIGNIFICANCE)) ? ' class="significant"' : '') + '>' + DRESS.sign(DRESS.clamp(r)) + '	</span>';
                    return cell;
                }).join('') + '</pre></p>';
        }
        return lines;
    };
})(DRESS || (DRESS = {}));
