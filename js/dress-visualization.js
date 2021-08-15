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
     * @param {number} [bin=10] - The number of bins to used. Only relevant to numerical features. Default to 10.
     * @returns An arary of result objects, one for each specified numerical or categorical feature, containing the following properties:
     *   feature (the feature being evaluated),
     *   count (the number of non-null values),
     *   histogram (the histogram, which contains an array of ticks, values, and texts),
     *   text.
     */
    DRESS.histograms = (subjects, numericals, categoricals, bin = 10) => {
        numericals || (numericals = []);
        categoricals || (categoricals = []);
        const pad = numericals.concat(categoricals).reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        const numSubject = subjects.length;
        return numericals.map(feature => {
            let values = new Array(numSubject);
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
            values = values.slice(0, count);
            //
            const interval = (max - min) / bin + 1e-8;
            const bins = (new Array(bin)).fill(0);
            i = count;
            while (i--) {
                bins[Math.floor((values[i] - min) / interval)] += 1;
            }
            //
            let scale = Number.NEGATIVE_INFINITY;
            i = bin;
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
                        text: DRESS.clamp(tick) + '	|' + DRESS.padEnd('#'.repeat(Math.round(value * 10)), 10) + '|	' + bin + '	(' + DRESS.clamp(bin / numSubject * 100) + '%)'
                    };
                }),
                text: DRESS.padEnd(feature, pad) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        }).concat(categoricals.map(feature => {
            const values = new Map();
            let count = 0;
            let i = numSubject;
            while (i--) {
                let value = DRESS.get(subjects[i], feature);
                if (value !== null) {
                    value = DRESS.categoric(value);
                    values.set(value, (values.get(value) || 0) + 1);
                    count++;
                }
            }
            const bins = Array.from(values).sort((a, b) => (a[0] > b[0]) ? 1 : -1);
            const pad2 = bins.reduce((max, bin) => Math.max(max, String(bin[0]).length), 0);
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
                    text: DRESS.padEnd(bin[0], pad2) + ' |' + DRESS.padEnd('#'.repeat(Math.round(bin[1] / scale * 10)), 10) + '|	' + bin[1] + '	(' + DRESS.clamp(bin[1] / numSubject * 100) + '%)'
                })),
                text: DRESS.padEnd(feature, pad) + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        }));
    };
    /**
     * @summary Generate a heatmap from a correlation matrix.
     *
     * @description This method is designed to convert the result objects returned by DRESS.correlations into a heatmap.
     *
     * @param {object[]} rows - The correlation matrix.
     * @returns An HTML formatted text that renders to a heatmap representation of the specified correlation matrix.
     */
    DRESS.heatmap = (rows) => {
        const numRow = rows.length;
        if (numRow === 0) {
            return '';
        }
        let label;
        let columns;
        let value;
        let p;
        if ((typeof rows[0]['feature'] === 'string') && (typeof rows[0]['correlations'] === 'object')) {
            label = 'feature';
            columns = 'correlations';
            value = 'r';
            p = 'p';
        }
        const labels = rows.map(row => DRESS.get(row, label));
        const pad = labels.reduce((max, label) => Math.max(max, label.length), 0);
        //
        let lines = '<p><pre>' + DRESS.padEnd('', pad) + '    	' + [...Array(numRow).keys()].map(key => '[' + (key + 1) + ']').join('	') + '</pre></p>';
        for (let i = 0; i < numRow; i++) {
            const cols = DRESS.get(rows[i], columns);
            const values = new Array(numRow).fill(null);
            const ps = new Array(numRow).fill(null);
            let j = cols.length;
            while (j--) {
                const index = labels.indexOf(DRESS.get(cols[j], label));
                values[index] = DRESS.numeric(DRESS.get(cols[j], value));
                ps[index] = DRESS.numeric(DRESS.get(cols[j], p));
            }
            lines += '<p><pre>' + DRESS.padEnd(labels[i], pad) + ' [' + (i + 1) + ']	' +
                values.map((value, index) => {
                    if (value === null) {
                        return ' '.repeat(DRESS.PRECISION + 3) + '	';
                    }
                    let cell = '<span style="background-color:rgba(';
                    if (value > 0) {
                        cell += '0,127,0,' + value;
                    }
                    else {
                        cell += '0,0,127,' + (-value);
                    }
                    cell += ')"' + (((ps[index] !== null) && (ps[index] < DRESS.SIGNIFICANCE)) ? ' class="significant"' : '') + '>' + DRESS.signed(DRESS.clamp(value)) + '	</span>';
                    return cell;
                }).join('') + '</pre></p>';
        }
        return lines;
    };
})(DRESS || (DRESS = {}));
