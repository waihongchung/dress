declare namespace DRESS {
    /**
     * @summary Perform an asynchronous function call.
     *
     * @description This method allows long operations to be performed asynchronously by using the WebWorker API.
     * The method automatically loads all Javascript files from the HTML header to a WebWorker instance and allows methods contained within these Javascript files to be called.
     *
     * @param {string} method - The name of the method to be executed asynchronously.
     * @param {any[]} parameters - One or more parameters to be passed to the method being executed asynchronously. The parameters MUST be a native Javascript type that can be cloned to the WebWorker.
     *
     * @returns {Promise} - A Promise that can be resolved into the result returned by the method being executed asynchronously.
     */
    const async: (method: any, ...parameters: any[]) => Promise<any>;
}
