var DRESS;
(function (DRESS) {
    /**
     * @summary Normalize the specified features so that their values fall in the range of [0, 1].
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that all the values of said feature fall in the range of [0, 1].
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value before the normalization process.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   min (the minimum value of said feature found within the subjects),
     *   max (the maximal value of said feature found within the subjects),
     *   range (max - min),
     *   text
     */
    DRESS.normalize = (subjects, features, names = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        return features.map((feature, index) => {
            const values = subjects.map(subject => Array.isArray(subject[feature]) ? subject[feature].length : +subject[feature]).sort((a, b) => a - b);
            if (values.length > 1) {
                const min = values[0];
                const max = values[values.length - 1];
                const range = max - min;
                if (range !== 0) {
                    const name = replacement ? names[index] : feature;
                    subjects.map(subject => subject[name] = ((Array.isArray(subject[feature]) ? subject[feature].length : +subject[feature]) - min) / range);
                    return {
                        feature: feature,
                        name: name,
                        min: min,
                        max: max,
                        range: range,
                        text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + DRESS.clamp(min) + ' - ' + DRESS.clamp(max) + '	(' + DRESS.clamp(range) + ')'
                    };
                }
            }
            return {
                feature: feature,
                name: null,
                min: null,
                max: null,
                range: null,
                text: DRESS.padEnd(feature, pad) + ': CANNOT BE NORMALIZED.'
            };
        });
    };
    /**
     * @summary Standardize the specified features so that their values have an arithmetic mean of 0 and a standard deviation of 1.
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that the values of said feature have a mean of 0 and a standard deviation of 1.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then the length of the array will be used.
     * Otherwise, the property will be converted to a numeric value before the standardization process.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified features. To store the transformed results in a different property, the names parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   mean (the arithmatic mean of said feature found within the subjects),
     *   sd (the standard deviation of said feature found within the subjects),
     *   text
     */
    DRESS.standardize = (subjects, features, names = []) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        return features.map((feature, index) => {
            const values = subjects.map(subject => Array.isArray(subject[feature]) ? subject[feature].length : +subject[feature]);
            if (values.length > 1) {
                const mean = values.reduce((total, value) => total + value) / values.length;
                const sd = Math.sqrt(values.reduce((total, value) => total + (value - mean) * (value - mean), 0) / values.length);
                if (sd !== 0) {
                    const name = replacement ? names[index] : feature;
                    subjects.map(subject => subject[name] = ((Array.isArray(subject[feature]) ? subject[feature].length : +subject[feature]) - mean) / sd);
                    return {
                        feature: feature,
                        name: name,
                        mean: mean,
                        sd: sd,
                        text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + DRESS.clamp(mean) + '	(' + DRESS.clamp(sd) + ')'
                    };
                }
            }
            return {
                feature: feature,
                name: null,
                mean: null,
                sd: null,
                text: DRESS.padEnd(feature, pad) + ': CANNOT BE STANDARDIZED.'
            };
        });
    };
    /**
     * @summary Reduce the values of the specified feature into a boolean value (i.e. true or false).
     *
     * @description This method evaluates the value of the specified feature in each subject.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then logical TRUE is defined as the presence of one or more values within the truths array within the property array.
     * Otherwise, the logical TRUE is defined as the presence of the property value within the truths array.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - A feature to be processed.
     * @param {any[]} truths - A list of values that are considered as logical TRUE.
     * @param {string} [name=null] - A property name to be used to store the results.
     * @returns {object} An object containing the following transformation parameters for debugging purposes:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were considered as logical TRUE),
     *   text
     */
    DRESS.booleanize = (subjects, feature, truths, name = null) => {
        name = name || feature;
        subjects.map(subject => {
            subject[name] = Array.isArray(subject[feature]) ? truths.some(truth => subject[feature].indexOf(truth) > -1) : (truths.indexOf(subject[feature]) > -1);
        });
        const count = subjects.filter(subject => subject[name]).length;
        return {
            feature: feature,
            name: name,
            count: count,
            text: feature + (name !== feature ? (' >> ' + name) : '') + ': ' + count + '	(' + DRESS.clamp(count / subjects.length * 100) + '%)'
        };
    };
    /**
     * @summary Categorize the values of the specified feature and encode the result using numerical values.
     *
     * @description This method categorizes the value of the specified feature in each subject by matching it to one of the specified categories.
     * Each feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then each value in the property is matched individually, and an empty array is returned if no match is found.
     * If the property is NOT an array, then the value is matched directly against the specified categories. If no match is found, then the property is set to null.
     *
     * The categories must be an array. Each element within the categories array can be a value or an array of values.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - A feature to be processed.
     * @param {any[]} categories - An array of categories. The index of each category is used for encoding.
     * @param {string} [name=null] - A property name to be used to store the results.
     * @returns {object} An object containing the following transformation parameters for debugging purposes:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were successfully categorized to one of the categories).
     *   text
     */
    DRESS.categorize = (subjects, feature, categories, name = null) => {
        let match = (value, categories) => {
            return categories.findIndex(category => Array.isArray(category) ? (category.indexOf(value) > -1) : (category === value));
        };
        //
        name = name || feature;
        let count = 0;
        subjects.map(subject => {
            if (Array.isArray(subject[feature])) {
                if ((subject[name] = subject[feature].map(value => match(value, categories)).filter(i => i > -1)).length) {
                    ++count;
                }
            }
            else {
                if ((subject[name] = match(subject[feature], categories)) > -1) {
                    ++count;
                }
                else {
                    subject[name] = null;
                }
            }
        });
        return {
            feature: feature,
            name: name,
            count: count,
            text: feature + (name !== feature ? (' >> ' + name) : '') + ': ' + count + '	(' + DRESS.clamp(count / subjects.length * 100) + '%)'
        };
    };
    /**
     * @summary Organize the subjects into groups based on the specified feature.
     *
     * @description This method loops through the each subject and assigns the subject into one of several groups based on the value of the specified feature.
     * The feature should be a property of the subject that is accessible directly by subject[feature]. If the property is an array, then the string representation of the array is used as the group identifier.
     * If the property is NOT an array, then the value is used directly as the group identifier.
     *
     * For example, this method can be used to organize subjects by gender or site id, or to organize hospital encounters by patient mrn.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - The grouping feature.
     * @param {string} name - The name of the property in the result object that holds the grouped subjects.
     * @returns {object[]} An array of objects with two properties: one in the name of the feature and contains the identifier of each group,
     * the other one in the specified name and contains the grouped subjects.
     */
    DRESS.organize = (subjects, feature, name) => {
        const groups = [];
        subjects.map(subject => {
            const id = Array.isArray(subject[feature]) ? subject[feature].join() : subject[feature];
            let group = groups.find(group => group[feature] === id);
            if (!group) {
                group = {};
                group[feature] = id;
                group[name] = [];
                groups.push(group);
            }
            group[name].push(subject);
        });
        return groups;
    };
    /**
     * @sumary Synthesize an array of new objects by merging several arrays of objects based on the specified feature.
     *
     * @description This method loops through each array of objects and merges objects from one array to the next by the specified id.
     * The id should be a property of the subject that is accessible directly by object[id]. The id should uniquely identify an object within an array.
     *
     * Suppose there is an array of objects, called labs, containing the laboratory values of each study subject, and each object is identified by the subject id.
     * And suppose there is another array of objects, called demographics, containing the demographic information of each study subject, and each object is again identified by the subject id.
     * You can synthesize a new array of objects, each containing both the laboratory values and the demographic information, by calling synthesize('id', labs, demographics)
     *
     * @param {string} id - The id used to uniquely identify an object within an array.
     * @param {object[][]} arrays - Two or more arrays of objects.
     * @returns {object[]} An array of newly synthesized objects, each identified by a unique id and is created by merging related objects from the specified arrays.
     */
    DRESS.synthesize = (id, ...arrays) => {
        return arrays.reduce((previous, current) => {
            current.map(obj => {
                const index = previous.findIndex(subject => subject[id] === obj[id]);
                if (index > -1) {
                    Object.assign(previous[index], obj);
                }
                else {
                    previous.push(obj);
                }
            });
            return previous;
        });
    };
})(DRESS || (DRESS = {}));
