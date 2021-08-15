var DRESS;
(function (DRESS) {
    /**
     * @summary Normalize the specified features so that their values fall in the range of [0, 1].
     *
     * @description This method loops through the specified features and applies a scaling factor to each feature so that all the values of said feature fall in the range of [0, 1].
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
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
        const numSubject = subjects.length;
        return features.map((feature, index) => {
            let min = Number.POSITIVE_INFINITY;
            let max = Number.NEGATIVE_INFINITY;
            const values = new Array(numSubject);
            let i = numSubject;
            while (i--) {
                const value = DRESS.numeric(DRESS.get(subjects[i], feature));
                if (value < min) {
                    min = value;
                }
                if (value > max) {
                    max = value;
                }
                values[i] = value;
            }
            const range = max - min;
            if (range !== 0) {
                const name = replacement ? names[index] : feature;
                i = numSubject;
                while (i--) {
                    DRESS.set(subjects[i], name, (values[i] - min) / range);
                }
                return {
                    feature,
                    name,
                    min,
                    max,
                    range,
                    text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + DRESS.clamp(min) + ' - ' + DRESS.clamp(max) + '	(' + DRESS.clamp(range) + ')'
                };
            }
            return {
                feature,
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
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the length of the array will be used.
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
        const numSubject = subjects.length;
        return features.map((feature, index) => {
            let mean = 0;
            let sd = 0;
            const values = new Array(numSubject);
            for (let i = 0; i < numSubject; i++) {
                const value = DRESS.numeric(DRESS.get(subjects[i], feature));
                const delta = (value - mean);
                mean += delta / (i + 1);
                sd += delta * (value - mean);
                values[i] = value;
            }
            if (sd !== 0) {
                sd = Math.sqrt(sd / subjects.length);
                const name = replacement ? names[index] : feature;
                let i = numSubject;
                while (i--) {
                    DRESS.set(subjects[i], name, (values[i] - mean) / sd);
                }
                return {
                    feature,
                    name,
                    mean,
                    sd,
                    text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + DRESS.clamp(mean) + '	(' + DRESS.clamp(sd) + ')'
                };
            }
            return {
                feature,
                name: null,
                mean: null,
                sd: null,
                text: DRESS.padEnd(feature, pad) + ': CANNOT BE STANDARDIZED.'
            };
        });
    };
    /**
     * @summary Reduce the values of the specified features into a boolean value (i.e. true or false).
     *
     * @description This method evaluates the value of the specified features in each subject.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then logical TRUE is defined as the presence of one or more values within the truths array within the property array.
     * Otherwise, the logical TRUE is defined as the presence of the property value within the truths array.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} truths - A list of values that are considered as logical TRUE.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   count (the number of subjects that were considered as logical TRUE),
     *   text
     */
    DRESS.booleanize = (subjects, features, truths, names = null) => {
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        const numSubject = subjects.length;
        return features.map((feature, index) => {
            const name = replacement ? names[index] : feature;
            let count = 0;
            let i = numSubject;
            while (i--) {
                let value = DRESS.get(subjects[i], feature);
                value = Array.isArray(value) ? truths.some(truth => value.indexOf(truth) > -1) : (truths.indexOf(value) > -1);
                DRESS.set(subjects[i], name, value);
                if (value) {
                    count++;
                }
            }
            return {
                feature,
                name,
                count,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + count + '	(' + DRESS.clamp(count / numSubject * 100) + '%)'
            };
        });
    };
    /**
     * @summary Categorize the values of the specified features and encode the result using numerical values.
     *
     * @description This method categorizes the value of the specified features in each subject by matching it to one of the specified categories.
     * Each feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then each value in the property is matched individually, and an empty array is returned if no match is found.
     * If the property is NOT an array, then the value is matched directly against the specified categories. If no match is found, then the property is set to null.
     *
     * The categories must be an array. Each element within the categories array can be a value or an array of values.
     *
     * NOTE: By default, this method is destructive and directly alters the values of the specified feature. To store the transformed results in a different property, the name parameter must be specified.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - An array of features to be processed.
     * @param {any[]} categories - An array of categories. The index of each category is used for encoding.
     * @param {string[]} [names=null] - An array of property names to be used to store the results. It MUST be of the same length as the features array.
     * @returns {object[]} An array of transformation parameters for debugging purposes. For each transformed feature, the following parameters are returned:
     *   feature (the feature transformed),
     *   name (the name of property that store the transformed values),
     *   counts (an array representing the number of matched subjects in each category).
     *   text
     */
    DRESS.categorize = (subjects, features, categories, names = null) => {
        let match = (value, categories) => {
            return categories.findIndex(category => Array.isArray(category) ? (category.indexOf(value) > -1) : (category === value));
        };
        //
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        const replacement = names && (names.length === features.length);
        const pad2 = replacement && names.reduce((max, name) => Math.max(max, name.length), 0);
        //
        const numSubject = subjects.length;
        return features.map((feature, index) => {
            const name = replacement ? names[index] : feature;
            const counts = (new Array(categories.length)).fill(0);
            let i = numSubject;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                if (Array.isArray(value)) {
                    const matches = value.map(value => match(value, categories)).filter(i => i > -1);
                    DRESS.set(subjects[i], name, matches);
                    let j = matches.length;
                    while (j--) {
                        counts[matches[j]] += 1;
                    }
                }
                else {
                    const matches = match(value, categories);
                    DRESS.set(subjects[i], name, matches);
                    if (matches > -1) {
                        counts[matches] += 1;
                    }
                    else {
                        DRESS.set(subjects[i], name, null);
                    }
                }
            }
            return {
                feature,
                name,
                counts,
                text: DRESS.padEnd(feature, pad) + (replacement ? (' >> ' + DRESS.padEnd(name, pad2)) : '') + ': ' + counts.map(count => count + ' (' + DRESS.clamp(count / numSubject * 100) + '%)').join('	')
            };
        });
    };
    /**
     * @summary Generate a UUID for each subject.
     *
     * @description This method labels each subject with a universally unique identifier (UUID). It uses the Window.crypto API to generate a cryptographically secured random value in order to minimize the risk of a collision.
     * The UUID is designed in a way that each id is, for practical purposes, unique and the probability that there are duplicates is close enough to zero to be negligible.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} [name='id'] - Optional, the name of the property that holds the UUID. Default to 'uuid'.
     * @returns {object[]} - An array of labeled subjects.
     */
    DRESS.uuid = (subjects, name = 'uuid') => {
        let i = subjects.length;
        while (i--) {
            DRESS.set(subjects[i], name, ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >>> (+c >>> 2)).toString(16)));
        }
        return subjects;
    };
    /**
     * @summary Organize the subjects into groups based on the specified feature.
     *
     * @description This method assigns subjects into one of several groups based on the value of the specified feature.
     * The feature should be a property of the subject or is accessible using the dot notation. If the property is an array, then the string representation of the array is used as the group identifier.
     * If the property is NOT an array, then the value is used directly as the group identifier.
     *
     * For example, this method can be used to group subjects by gender or site id, or to group hospital encounters by patient mrn.
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string} feature - The grouping feature.
     * @param {string} name - The name of the property in the result object that holds the grouped subjects.
     * @returns {object[]} An array of objects with two properties: one in the name of the feature and contains the identifier of each group,
     * the other one in the specified name and contains an array of grouped subjects.
     */
    DRESS.group = (subjects, feature, name) => {
        const objects = new Map();
        let i = subjects.length;
        while (i--) {
            const value = DRESS.get(subjects[i], feature);
            const object = objects.get(value);
            if (object) {
                object.push(subjects[i]);
            }
            else {
                objects.set(value, [subjects[i]]);
            }
            DRESS.del(subjects[i], feature);
        }
        return Array.from(objects).map(([key, value]) => {
            const object = {};
            DRESS.set(object, feature, key);
            DRESS.set(object, name, value);
            return object;
        });
    };
    /**
     * @sumary Create a new array of subjects by merging several arrays of subjects based on the values of the specified feature.
     *
     * @description This method merges subjects from multiple arrays using the values of the specified feature as the key.
     * The feature should be a property of the subject or is accessible using the dot notation. The values of the feature should uniquely identify a subject within each array of subjects.
     *
     * Suppose there is an array of objects, called labs, containing the laboratory values of each study subject, and each object is identified by the subject id.
     * And suppose there is another array of objects, called demographics, containing the demographic information of each study subject, and each object is again identified by the subject id.
     * You can create a new array of objects, each containing both the laboratory values and the demographic information, by calling merge('id', labs, demographics)
     *
     * @param {string} feature - The feature, whose value can be used to uniquely identify a subject within an array.
     * @param {object[][]} arrays - Two or more arrays of subjects.
     * @returns {object[]} An array of merged subjects.
     */
    DRESS.merge = (feature, ...arrays) => {
        const objects = new Map();
        arrays.map(subjects => {
            let i = subjects.length;
            while (i--) {
                const value = DRESS.get(subjects[i], feature);
                const object = objects.get(value);
                if (object) {
                    Object.assign(object, subjects[i]);
                }
                else {
                    objects.set(value, subjects[i]);
                }
            }
        });
        return Array.from(objects.values());
    };
    /**
     * @summary Create a new array of containing the values of the specified feature(s), and optionally add a back reference to the subject.
     *
     * @description This method creates a new array of containing the values of the specified feature(s), and optionally add a back reference to the subject.
     * The feature should be a property of the subject or is accessible using the dot notation.
     *
     * Suppose there is an array of study subjects, each suject has a feature called 'encounters', which is an array of hospital encounters associated with the subject.
     * You can create a new array of encounters, by calling pluck(subjects, ['encounters']). You can optionally create, as a property of each encounter object, a back reference, called 'subject' to the parent subject, by calling
     * pluck(subjects, ['encounters'], 'subject').
     *
     * @param {object[]} subjects - The subjects to be processed.
     * @param {string[]} features - One or more features to be selected.
     * @param {string} [reference=null] - Optional, the name of the property that holds the back reference to the parent subject.
     * @returns {object[]} An array of feature values.
     */
    DRESS.pluck = (subjects, features, reference = null) => {
        const numSubject = subjects.length;
        const numFeature = features.length;
        const values = new Array(numSubject);
        if (numFeature) {
            let i = numSubject;
            while (i--) {
                let value;
                if (numFeature > 1) {
                    value = {};
                    let j = numFeature;
                    while (j--) {
                        DRESS.set(value, features[j], DRESS.get(subjects[i], features[j]));
                    }
                }
                else {
                    value = DRESS.get(subjects[i], features[0]);
                }
                if (reference) {
                    if ((typeof value === 'object') && !Array.isArray(value)) {
                        DRESS.set(value, reference, subjects[i]);
                    }
                }
                values[i] = value;
            }
        }
        return values;
    };
})(DRESS || (DRESS = {}));
