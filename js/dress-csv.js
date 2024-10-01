var DRESS;
(function (DRESS) {
    /**
     * @summary Convert a list of comma-separated values into an array of objects.
     *
     * @description This method parses a string containing a list of comma-separated values (CSV) and returns an array of objects representing each row of values.
     * The CSV string MUST contain a row of headers as the first row. The headers are used as property names of each object. Each column represents a property and each subsequent row represents an object.
     * An empty cell is treated as a null value.
     *
     * @param {string} csv - A string containing a list of comma-separated values.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @param {string} [newline='\n'] - The newline character. Default to '\n'.
     *
     * @returns {object[]} An array of objects, each representing a row in the CSV string.
     */
    DRESS.fromCSV = (csv, separator = ',', newline = '\n') => {
        const rows = parse(csv, separator, newline);
        if (rows.length > 1) {
            const header = rows[0].map(str => String(str).trim());
            const numRow = rows.length - 1;
            const objects = Array(numRow);
            let i = numRow;
            while (i) {
                const object = {};
                let j = rows[i].length;
                while (j--) {
                    const cell = rows[i][j];
                    DRESS.set(object, header[j] || String(j), (cell === '') ? null : cell);
                }
                objects[--i] = object;
            }
            return objects;
        }
        return [];
    };
    /**
     * @summary Convert the subjects into a CSV string.
     *
     * @description This method flattens an array of subjects into a CSV string. Each row of the string represents an object. Each column represents a property of the object.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} [features=null] - A list of features to be included in the CSV. Default is `null`, in which case all enumerable properties of the first subject are used.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @param {string} [newline='\n'] - The newline character. Default to '\n'.
     *
     * @returns {string} A string containing a CSV representation of the subjects.
     */
    DRESS.toCSV = (subjects, features = null, separator = ',', newline = '\n') => {
        const quote = (value) => {
            if (value === null) {
                return '';
            }
            value = String(value).replace(/"/g, '""');
            return ((value.indexOf(separator) > -1) || (value.indexOf('"') > -1)) ? '"' + value + '"' : value;
        };
        const extract = (object) => {
            return Object.keys(object).reduce((keys, key) => {
                if ((object[key] !== null) && (typeof object[key] === 'object') && !Array.isArray(object[key])) {
                    return keys.concat(extract(object[key]).map(subkey => key + '.' + subkey));
                }
                keys.push(key);
                return keys;
            }, []);
        };
        if ((subjects === null) || Array.isArray(subjects) && (subjects.length === 0)) {
            return '';
        }
        if (features === null) {
            features = extract(subjects[0]);
        }
        let csv = features.map(header => quote(header)).join(separator);
        let i = subjects.length;
        while (i--) {
            /*csv += newline + features.map(feature => {
                const value = get(subjects[i], feature);
                return quote(Array.isArray(value) ? value.map(v => quote(v)).join(separator) : value);
            }).join(separator)*/
            csv += newline + features.map(feature => quote([].concat(DRESS.get(subjects[i], feature)).map(value => quote(value)).join(separator))).join(separator);
        }
        return csv;
    };
    /**
     * @summary Convert the specified features of the subjects into an array of values.
     *
     * @description This method loops through each subject and converts the value of the specified feature into an array of values.
     * Each feature should be a property of the subject or be accessible using the dot notation and each feature should be a CSV formatted string representing an array of values.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @param {string} [empty=[]] - A default value to represent an empty array. Default to an empty array.
     */
    DRESS.parseArray = (subjects, features, seperator = ',', empty = []) => {
        const numSubject = subjects.length;
        const numFeature = features.length;
        const counts = Array(numFeature).fill(0);
        let i = numSubject;
        while (i--) {
            let j = numFeature;
            while (j--) {
                const value = DRESS.get(subjects[i], features[j]);
                if (value !== null) {
                    counts[j] += 1;
                    DRESS.set(subjects[i], features[j], parse(String(value), seperator).reduce((rows, row) => rows.concat(row), []).map(cell => (cell === '') ? null : cell));
                }
                else {
                    DRESS.set(subjects[i], features[j], empty);
                }
            }
        }
        const padding = DRESS.longest(features);
        return features.map((feature, index) => ({
            feature,
            count: counts[index],
            text: DRESS.pad(feature, padding) + ': ' + counts[index] + '	(' + DRESS.clamp(counts[index] / numSubject * 100) + '%)'
        }));
    };
    /**
     * @summary Convert the specified features of the subjects into numeric values.
     *
     * @description This method loops through each subject and converts the value of the specified feature into a numeric value.
     * Each feature should be a property of the subject or be accessible using the dot notation.
     * If the property is an array, each of the values of the array is converted into a numeric value.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     */
    DRESS.parseNumeric = (subjects, features) => {
        const numSubject = subjects.length;
        const numFeature = features.length;
        const counts = Array(numFeature).fill(0);
        let i = numSubject;
        while (i--) {
            let j = numFeature;
            while (j--) {
                const value = DRESS.get(subjects[i], features[j]);
                if (value !== null) {
                    counts[j] += 1;
                    DRESS.set(subjects[i], features[j], Array.isArray(value) ? value.map(v => +v) : +value);
                }
            }
        }
        const padding = DRESS.longest(features);
        return features.map((feature, index) => ({
            feature,
            count: counts[index],
            text: DRESS.pad(feature, padding) + ': ' + counts[index] + '	(' + DRESS.clamp(counts[index] / numSubject * 100) + '%)'
        }));
    };
    /**
     * @summary Parse a CSV string
     */
    const parse = (csv, separator = ',', newline = '\n') => {
        const gExp = new RegExp('(?<=^|[' + separator + newline + '])"(|[\\s\\S]+?(?<![^"]"))"(?=$|[' + separator + newline + '])', 'g');
        const sExp = new RegExp(separator, 'g');
        const nExp = new RegExp(newline, 'g');
        return csv.replace(/^\ufeff/, '').replace(/\n+$/, '').replace(/\r/g, '')
            .replace(gExp, (_, group) => group.replace(nExp, '\x1D').replace(/""/g, '\x1E').replace(sExp, '\x1F'))
            .split(newline).map(line => line.split(separator).map(cell => cell.replace(/\x1D/g, newline).replace(/\x1E/g, '"').replace(/\x1F/g, separator)));
    };
})(DRESS || (DRESS = {}));
