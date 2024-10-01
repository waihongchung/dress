declare namespace DRESS {
    /**
    * @type {string} Set the id of the default DIV element onto which the output is displayed.
    */
    let DIV: string;
    /**
     * @summary Print text onto the default DIV element.
     *
     * @description This method appends one or more HTML-formatted text or result objects to the default DIV element, which is set by the global variable DRESS.DIV.
     * If a result object is passed as a parameter, then the text property of the result object is extracted using the DRESS.text method.
     * If the result object is a Promise, then a timer will be displayed automatically and the value that is resolved by the Promise will be displayed.
     *
     * @param {string | object | object[]} parameters - One or more HTML-formatted text or result objects
     */
    const print: (...parameters: any[]) => void;
    /**
     * @summary Extract and format the text property from a result object.
     *
     * @description This method extracts the text property from a result object returned by other methods in the DRESS toolkit.
     * It also loops through the child objects of the result object, extracts and formats the text properties from those child objects.
     *
     * @param {object | object[]} results - A result object.
     *
     * @returns {string} An HTML formatted text.
     */
    const text: (results: object | object[]) => string;
    /**
     * @summary Save the specified content as a file.
     *
     * @description This method enables saving the specified content as a file locally. If the specified content is NOT a string, it is converted into a JSON representation of the content first.
     *
     * @param {any} content - Content to be saved.
     * @param {string} name - File name.
    */
    const save: (content: any, name: string) => void;
    /**
     * @summary Load a local data file.
     *
     * @description This method inserts a file input element into the default DIV element, which is set by the global variable DRESS.DIV.
     * After the user clicks on the file input element to choose the appropriate file, the content of the file is read using the FileReader API.
     *
     * @param {string} label - The label to be displayed next to the file input element.
     * @param {boolean} [string=false] - Return the data file as string, instead of parsing it as JSON. Default to false.
     *
     * @return {Promise} A Promise that can be resolved to the content of the data file.
     */
    const local: (label: string, string?: boolean) => Promise<unknown>;
    /**
     * @summary Load a remote data file.
     *
     * @description This method loads a remote data file using the Fetch API. It also displays the URL and the status message in the default DIV element, which is set by the global variable DRESS.DIV.
     *
     * @param {string} url - The URL of the remote file.
     * @param {boolean} [string=false] - Return the data file as string, instead of parsing it as JSON. Default to false.
     *
     * @return {Promise} A Promise that can be resolved to the content of the data file.
     */
    const remote: (url: string, string?: boolean) => Promise<any>;
    /**
     * @summary Remove methods from a machine learning model object.
     *
     * @description This method removes all custom methods from a machine learning model object, such as `.train`, `.predict`, `.validate`, so that the object can be safely stored in the JSON format.
     *
     * @param {object} object - A machine learning model object.
     *
     * @return {object} The deflated object.
     */
    const deflate: (object: object) => any;
    /**
     * @summary Retore methods associated with a machine learning model object.
     *
     * @description This method restores the custom methods associated with a machine learning model object, such as `.train`, `.predict`, `.validate`.
     *
     * @param {object} object - A deflated machine learning model object.
     *
     * @return {object} The retored object.
     */
    const inflate: (object: object) => any;
}
