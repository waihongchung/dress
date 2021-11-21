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
    let print: (...parameters: any[]) => void;
    /**
     * @summary Extract and format the text property from a result object.
     *
     * @description This method extracts the text property from a result object returned by other methods in the DRESS toolkit.
     * It also loops through the child objects of the result object, extracts and formats the text properties from those child objects.
     *
     * @param results - A result object.
     * @returns An HTML formatted text.
     */
    let text: (results: object | object[]) => string;
    /**
     * @summary Save the specified content as a file.
     *
     * @description This method enables saving the specified content as a file locally. If the specified content is NOT a string, it is converted into a JSON representation of the content first.
     *
     * @param {any} content - Content to be saved.
     * @param {string} name - File name.
    */
    let save: (content: any, name: string) => void;
    /**
     * @summary Load a local data file.
     *
     * @description This method inserts a file input element into the default DIV element, which is set by the global variable DRESS.DIV.
     * After the user click on the file input element to choose the appropriate file, the content of the file is read using the FileReader API and the result is passed to the callback funciton.
     *
     * @param {string} label - The label to be displayed next to the file input element.
     * @param {any} [callback=null] - The callback function, optional. Default to null, in which case the content can be resolved using the returned Promise.
     * @param {boolean} [json=false] - Optional, specify whether the file is JSON file. Default to true.
     * @return {Promise} A Promise that can be resolved to the content of the data file. Use only if a callback function is not specified.
     */
    let local: (label: string, callback?: any, json?: boolean) => Promise<unknown>;
    /**
     * @summary Load a remote data file.
     *
     * @description This method loads a remote data file using the Fetch API. It also displays the URL and the status message in the default DIV element, which is set by the global variable DRESS.DIV.
     *
     * @param {string} url - The URL of the remote file
     * @param {any} [callback=null] - The callback function, optional. Default to null, in which case the content can be resolved using the returned Promise.
     * @param {boolean} [json=false] - Optional, specify whether the file is JSON file. Default to true.
     * @return {Promise} A Promise that can be resolved to the content of the data file. Use only if a callback function is not specified.
     */
    let remote: (url: string, callback?: any, json?: boolean) => Promise<unknown>;
    /**
     * @summary Perform an asynchronous function call.
     *
     * @description This method allows long operations to be performed asynchronously by using the WebWorker API.
     * The method automatically loads all Javascript files from the HTML header to a WebWorker instance and allows methods contained within these Javascript files to be called.
     *
     * @param {string} method - The name of the method to be executed asynchronously.
     * @param {any[]} parameters - One or more parameters to be passed to the method being executed asychronously. The parameters MUST be a native Javascript type that can be cloned to the WebWorker.
     * @returns {Promise} - A Promise that can be resolved into the result returned by the method being executed asychronously.
     */
    let async: (method: string, ...parameters: any[]) => Promise<unknown>;
}
