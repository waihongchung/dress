var DRESS;
(function (DRESS) {
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
    DRESS.async = (method, ...parameters) => {
        const url = URL.createObjectURL(new Blob([
            'try{importScripts(' + Array.from(document.head.getElementsByTagName('script')).map(script => script['src'].trim()).filter(_ => _).map(src => "'" + src + "'").join() + ')}catch(e){};' +
                Object.keys(DRESS).filter(key => typeof DRESS[key] !== 'function').map(key => 'DRESS.' + key + '=' + (typeof DRESS[key] === 'string' ? '"' + DRESS[key] + '"' : DRESS[key])).join(';') + ';' +
                'const get=' + DRESS.get.toString() + ';' +
                'const defunc=' + DRESS.defunc.toString() + ';' +
                'const enfunc=' + DRESS.enfunc.toString() + ';' +
                'onmessage=message=>postMessage(defunc((' + method + ').apply(null,enfunc(message.data))));'
        ], { type: 'application/javascript' }));
        const worker = new Worker(url);
        URL.revokeObjectURL(url);
        worker.postMessage(DRESS.defunc(parameters));
        //
        return new Promise((resolve, reject) => {
            worker.onmessage = (message) => {
                worker.terminate();
                resolve(DRESS.enfunc(message.data));
            };
            worker.onerror = (error) => {
                worker.terminate();
                reject(error);
            };
        });
    };
})(DRESS || (DRESS = {}));
