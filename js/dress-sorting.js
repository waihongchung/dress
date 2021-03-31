var DRESS;
(function (DRESS) {
    /**
     * @summary Multilevel mixed data type sorting.
     *
     * @description This method performs multilevel mixed data type sorting on an array of subjects based on the specified features.
     * Each feature should be a property of the subject or is accessible using the dot notation.
     *
     * Sorting precedence is defined by the features array. Null values are considered smaller than non-null values.
     * Numerical values are considered smaller than non-numerical values. Non-array values are considered smaller than array values.
     *
     * Two array values are sorted based on the values of individual elements within the arrays.
     * If the recursevie flag is set to true, then the elements within an array is sorted first, before the array itself is sorted.
     *
     * By default, sorting is performed in ascending order, but it can be changed to a descending order by setting the reverses flags to true on individual feature.
     *
     * @param {object[]} subjects - The subjects to be sorted.
     * @param {string[]} features - One or more features (or levels) on which the sorting algorithm is applied.
     * @param {boolean[]} [reverses=null] - An array of boolean that specifies the direction of sorting. It MUST be of the same length as the features array.
     * @param {boolean} [recursive=false] - Recursively sort elements within an array before the array itself is sorted.
     * @returns An array of sorting parameters for debugging purposes. For each specified feature, the following parameters are returned:
     *   feature (the feature),
     *   reverse (the direction of sorting),
     *   text
     */
    DRESS.sort = (subjects, features, reverses = null, recursive = false) => {
        let compare = (valA = null, valB = null) => {
            if (valA === valB) {
                return 0;
            }
            if ((valA === null) || (valB === null)) {
                return (valA === null) ? -1 : 1;
            }
            const numA = +valA;
            const numB = +valB;
            if ((numA === valA) && (numB === valB)) {
                return numA - numB;
            }
            else if ((numA === valA) || (numB === valB)) {
                return (numA === valA) ? -1 : 1;
            }
            const arrA = Array.isArray(valA);
            const arrB = Array.isArray(valB);
            if (arrA && arrB) {
                if (recursive) {
                    valA.sort((a, b) => compare(a, b));
                    valB.sort((a, b) => compare(a, b));
                }
                const len = Math.max(valA.length, valB.length);
                for (let i = 0; i < len; i++) {
                    const result = compare(valA[i], valB[i]);
                    if (result) {
                        return result;
                    }
                }
                return 0;
            }
            else if (arrA || arrB) {
                return arrA ? 1 : -1;
            }
            return (valA < valB) ? -1 : 1;
        };
        const pad = features.reduce((max, feature) => Math.max(max, feature.length), 0);
        //
        if (!reverses) {
            reverses = (new Array(features.length)).fill(false);
        }
        else {
            reverses.reverse();
        }
        return features.reverse().map((feature, index) => {
            if (reverses[index]) {
                subjects.reverse();
            }
            subjects.sort((subjectA, subjectB) => compare(DRESS.get(subjectA, feature), DRESS.get(subjectB, feature)));
            if (reverses[index]) {
                subjects.reverse();
            }
            //
            return {
                feature: feature,
                reverse: reverses[index],
                text: DRESS.padEnd(feature, pad) + ': ' + (reverses[index] ? 'descending' : 'ascending')
            };
        }).reverse();
    };
})(DRESS || (DRESS = {}));
