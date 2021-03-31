var DRESS;
(function (DRESS) {
    /**
     * @summary Convert a list of comma separated values into an array of objects.
     *
     * @description This method parses a string containing a list of comma separated values (CSV) and returns an array of objects representing each row of values.
     * The CSV string MUST contain a row of headers as the first row. The headers are used as property names of each object. Each column represents a property and each subsequent row represents an object.
     * An empty cell is treated as a null value.
     *
     * @param {string} csv - A string containing a list of comma separated values.
     * @param {boolean} [parseNumber=true] - Automatically convert numeric values into numbers.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @returns {object[]} An array of objects, each representing a row in the CSV string.
     */
    DRESS.fromCSV = (csv, parseNumber = true, separator = ',') => {
        const lines = csv.replace(/^\ufeff/, '').replace(/(\r?\n|\r)+/g, '\n').split('\n');
        const objects = [];
        if (lines.length > 1) {
            const header = tokenize(lines.shift(), separator);
            lines.map(line => {
                if (line) {
                    let object = {};
                    tokenize(line, separator).map((token, index) => {
                        const numeric = +token;
                        DRESS.set(object, header[index], (parseNumber && (String(numeric) === token)) ? numeric : (token ? token : null));
                    });
                    objects.push(object);
                }
            });
        }
        return objects;
    };
    /**
     * @summary Convert the subjects into a CSV string.
     *
     * @description This method flattens an array of subjects into a CSV string. Each row of the string represents an object. Each column represnts a property of the object.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} [features=null] - A list of features to be included in the CSV. Default is null, in which case all enumerable properties of first subject are used.
     * @param {string} [separator=','] - The separator character. Default to ','.
     * @returns {string} A string containing a CSV representation of the subjects.
     */
    DRESS.toCSV = (subjects, features = null, separator = ',') => {
        let quote = (value) => {
            if (value === null) {
                return '';
            }
            value = String(value).replace(/"/g, '""');
            return ((value.indexOf(separator) > -1) || (value.indexOf('"') > -1)) ? '"' + value + '"' : value;
        };
        let parse = (obj) => {
            return Object.keys(obj).reduce((keys, key) => {
                if ((typeof obj[key] === 'object') && !Array.isArray(obj[key])) {
                    return keys.concat(parse(obj[key]).map(subkey => key + '.' + subkey));
                }
                keys.push(key);
                return keys;
            }, []);
        };
        //        
        if (!subjects.length) {
            return '';
        }
        if (features === null) {
            features = parse(subjects[0]);
        }
        return features.map(header => quote(header)).join(separator) + '\n'
            + subjects.map(subject => features.map(header => {
                const value = DRESS.get(subject, header);
                return quote(Array.isArray(value) ? value.map(v => quote(v)).join(separator) : value);
            }).join(separator)).join('\n');
    };
    /**
     * @summary Convert the specified features of the subjects into an array of values.
     *
     * @description This method loops through each subject and converts the value of the specified feature into an array of values.
     * Each feature should be a property of the subject that is accessible directly by subject[feature] and each feature should be a CSV formatted string representing an array of values.
     *
     * @param {object[]} subjects -  The subjects to be processed.
     * @param {string[]} features - The features to be processed.
     * @param {boolean} [parseNumber=true] - Automatically convert numeric values into numbers.
     * @param {string} [separator=','] - The separator character. Default to ','.
     */
    DRESS.parseArray = (subjects, features, parseNumber = true, seperator = ',') => {
        subjects.map(subject => {
            features.map(feature => {
                const value = DRESS.get(subject, feature);
                DRESS.set(subject, feature, (value === null) ? [] : tokenize(String(value), seperator).map(token => {
                    const numeric = +token;
                    return (parseNumber && (String(numeric) === token)) ? numeric : (token ? token : null);
                }));
            });
        });
    };
    /**
     * @ignore
     */
    let tokenize = (line, separator) => {
        let tokens = line.split(separator);
        let index = tokens.length;
        while (index--) {
            let current = tokens[index];
            if (current.replace(/"\s+$/, '"').charAt(current.length - 1) === '"') {
                let temp = current.replace(/^\s+"/, '"').replace(/^""/, '');
                if ((temp.length > 1) && (temp.charAt(0) === '"')) {
                    tokens[index] = current.replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
                }
                else if (index) {
                    tokens.splice(index - 1, 2, [tokens[index - 1], current].join(separator));
                }
                else {
                    tokens = tokens.shift().split(separator).concat(tokens);
                }
            }
            else {
                tokens[index] = current.replace(/""/g, '"').trim();
            }
        }
        return tokens;
    };
})(DRESS || (DRESS = {}));
