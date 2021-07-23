var DRESS;
(function (DRESS) {
    /**
    * @type {string} Set the id of the default DIV element onto which the output is displayed.
    */
    DRESS.DIV = 'dress';
    /**
     * @summary Print text onto the default DIV element.
     *
     * @description This method appends one or more HTML-formatted text or result objects to the default DIV element, which is set by the global variable DRESS.DIV.
     * If a result object is passed as a parameter, then the text property of the result object is extracted using the DRESS.text method.
     * If the result object is a Promise, then a timer will be displayed automatically and the value that is resolved by the Promise will be displayed.
     *
     * @param {string | object | object[]} parameters - One or more HTML-formatted text or result objects
     */
    DRESS.print = (...parameters) => {
        parameters.map(parameter => {
            if (typeof parameter === 'object') {
                if (typeof parameter['then'] === 'function') {
                    const time = Date.now();
                    const id = 'dress_' + time;
                    div(id);
                    const interval = setInterval(() => div(id).innerHTML = 'Processing...' + Math.floor((Date.now() - time) / 1000), 500);
                    parameter.then(value => {
                        div(id).outerHTML = text(value);
                        clearInterval(interval);
                    });
                }
                else {
                    div().innerHTML += '<p>' + text(parameter) + '</p>';
                }
            }
            else {
                div().innerHTML += '<p>' + parameter + '</p>';
            }
        });
    };
    /**
     * @summary Save the specified content as a file.
     *
     * @description This method enables saving the specified content as a file locally. If the specified content is NOT a string, it is converted into a JSON representation of the content first.
     *
     * @param {any} content - Content to be saved.
     * @param {string} name - File name.
    */
    DRESS.save = (content, name) => {
        const a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent((typeof content === 'string') ? content : JSON.stringify(content)));
        a.setAttribute('download', name);
        a.click();
        a.remove();
    };
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
    DRESS.local = (label, callback = null, json = true) => {
        const i = document.createElement('input');
        i.setAttribute('type', 'file');
        const l = document.createElement('label');
        l.append(label + ': ', i);
        const p = document.createElement('p');
        p.append(l);
        div().append(p);
        return new Promise(resolve => {
            i.addEventListener('change', (event) => {
                const input = event.target;
                if ((typeof input.files === 'object') && (input.files.length)) {
                    var fileReader = new FileReader();
                    fileReader.readAsBinaryString(input.files[0]);
                    fileReader.onload = (event) => (callback || resolve)(json ? JSON.parse(event.target.result) : event.target.result);
                }
            });
        });
    };
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
    DRESS.remote = (url, callback = null, json = true) => {
        const l = document.createElement('label');
        l.append(url + ': ');
        const p = document.createElement('p');
        p.append(l);
        div().append(p);
        return new Promise(resolve => {
            fetch(url)
                .then(response => {
                l.append(response.ok ? 'OK' : 'ERROR');
                return json ? response.json() : response.text();
            })
                .then(response => (callback || resolve)(response));
        });
    };
    /**
     * @summary Perform an asynchronous function call.
     *
     * @description This method allows long operations to be performed asynchronously by using the WebWorker API.
     * The method automatically loads all Javascript files from the HTML header to a WebWorker instance and allows methods contained within these Javascript files to be called.
     *
     * @param {string} method - The name of the method to be executed asynchronously.
     * @param {any[]} parameters - One or more parameters to be passed to the method being executed asychronously. The parameters MUST be a native Javascript type that can be cloned to the WebWorker.
     * @returns {Promise} - A Promise that can be resolved into the result returned by the method being  executed asychronously.
     */
    DRESS.async = (method, ...parameters) => {
        const scripts = Array.from(document.head.getElementsByTagName('SCRIPT')).map(script => "'" + script['src'] + "'");
        const url = URL.createObjectURL(new Blob([
            'importScripts(' + scripts.join(',') + ');' +
                'DRESS = Object.assign(DRESS, JSON.parse(' + "'" + JSON.stringify(DRESS) + "'" + '));' +
                'let get = (object, path) => path.split(".").reduce((object, segment) => ((object === null) || (typeof object[segment] === "undefined")) ? null : object[segment], object);' +
                'let map = (parameters) => parameters.map(parameter => ((typeof parameter ==="object") && (typeof parameter["async"] === "string")) ? get(self, parameter["async"]) : parameter);' +
                'let strip = (object) => {if (typeof object === "object") {for (let prop in object) {if (typeof object[prop] === "function") {delete object[prop]}}} return object};' +
                'onmessage = (message) => postMessage(strip(' + method + '.apply(null, map(message.data))));'
        ], { type: 'application/javascript' }));
        const worker = new Worker(url);
        worker.postMessage(parameters);
        return new Promise(resolve => worker.onmessage = (message) => {
            worker.terminate();
            URL.revokeObjectURL(url);
            resolve(message.data);
        });
    };
    /**
     * @ignore
     */
    let div = (id = DRESS.DIV) => {
        let e = document.getElementById(id);
        if (!e) {
            e = document.createElement('div');
            e.setAttribute('id', id);
            if (id === DRESS.DIV) {
                document.body.appendChild(e);
            }
            else {
                div().appendChild(e);
            }
        }
        return e;
    };
    /**
     * @ignore
     */
    let text = (results) => {
        const html = (Array.isArray(results) ? results : [results]).filter(result => result).map(result => {
            const keys = Object.keys(result);
            let output = '';
            if (typeof result['text'] === 'string') {
                const html = document.createElement('div').appendChild(document.createTextNode(result['text'])).parentNode.innerHTML;
                output += ((typeof result['p'] === 'number') && (result['p'] < DRESS.SIGNIFICANCE)) ? '<span class="significant">' + html + '</span>' : html;
                keys.map(key => {
                    if (typeof result[key] === 'object') {
                        const html = text(result[key]);
                        output += html ? '<div>' + html + '</div>' : '';
                    }
                });
            }
            return output ? '<p>' + output + '</p>' : '';
        }).join('');
        return html ? '<pre>' + html + '</pre>' : '';
    };
})(DRESS || (DRESS = {}));
