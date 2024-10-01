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
        parameters.forEach(parameter => {
            if (typeof parameter === 'object') {
                if (typeof parameter['then'] === 'function') {
                    const time = Date.now();
                    const id = DRESS.DIV + '_' + time;
                    div(id);
                    const interval = setInterval(() => div(id).innerHTML = 'DRESSing...' + ~~((Date.now() - time) / 1000), 500);
                    parameter.then(value => {
                        div(id).outerHTML = (typeof value === 'object') ? DRESS.text(value) : value;
                        clearInterval(interval);
                    });
                }
                else {
                    const p = document.createElement('p');
                    p.innerHTML = DRESS.text(parameter);
                    div().append(p);
                }
            }
            else {
                const p = document.createElement('p');
                p.innerHTML = parameter;
                div().append(p);
            }
        });
    };
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
    DRESS.text = (results) => {
        //const html: string = (Array.isArray(results) ? results : [results]).filter(result => result).map(result => {
        const html = [].concat(results).filter(result => result).map(result => {
            let output = '';
            if (typeof result['text'] === 'string') {
                const html = document.createElement('div').appendChild(document.createTextNode(result['text'])).parentNode.innerHTML;
                output += ((typeof result['p'] === 'number') && (result['p'] < DRESS.SIGNIFICANCE)) ? '<span class="significant">' + html + '</span>' : html;
                Object.keys(result).forEach(key => {
                    if (typeof result[key] === 'object') {
                        const html = DRESS.text(result[key]);
                        output += html ? '<div>' + html + '</div>' : '';
                    }
                });
            }
            return output ? '<p>' + output + '</p>' : '';
        }).join('');
        return html ? '<pre>' + html + '</pre>' : '';
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
     * After the user clicks on the file input element to choose the appropriate file, the content of the file is read using the FileReader API.
     *
     * @param {string} label - The label to be displayed next to the file input element.
     * @param {boolean} [string=false] - Return the data file as string, instead of parsing it as JSON. Default to false.
     *
     * @return {Promise} A Promise that can be resolved to the content of the data file.
     */
    DRESS.local = (label, string = false) => {
        const i = document.createElement('input');
        i.setAttribute('type', 'file');
        const l = document.createElement('label');
        l.append(label + ': ', i);
        const p = document.createElement('p');
        p.append(l);
        div().append(p);
        return new Promise(resolve => {
            i.addEventListener('input', (event) => {
                const input = event.target;
                if ((typeof input['files'] === 'object') && (input['files'].length)) {
                    const fileReader = new FileReader();
                    fileReader.readAsText(input['files'][0]);
                    fileReader.onload = (event) => resolve(string ? event.target.result : JSON.parse(event.target.result));
                }
            });
        });
    };
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
    DRESS.remote = (url, string = false) => {
        const l = document.createElement('label');
        l.append(url + ': ');
        const p = document.createElement('p');
        p.append(l);
        div().append(p);
        return fetch(url).then(response => {
            l.append(response.ok ? 'OK' : 'ERROR');
            return string ? response.text() : response.json();
        });
    };
    /**
     * @summary Remove methods from a machine learning model object.
     *
     * @description This method removes all custom methods from a machine learning model object, such as `.train`, `.predict`, `.validate`, so that the object can be safely stored in the JSON format.
     *
     * @param {object} object - A machine learning model object.
     *
     * @return {object} The deflated object.
     */
    DRESS.deflate = (object) => {
        return DRESS.defunc(object);
    };
    /**
     * @summary Retore methods associated with a machine learning model object.
     *
     * @description This method restores the custom methods associated with a machine learning model object, such as `.train`, `.predict`, `.validate`.
     *
     * @param {object} object - A deflated machine learning model object.
     *
     * @return {object} The retored object.
     */
    DRESS.inflate = (object) => {
        return DRESS.enfunc(object);
    };
    /**
     * @summary Retrieve the DIV with the specified id or create a new DIV with the specified id and append it to the body of the containing HTML document.
     */
    const div = (id = DRESS.DIV) => {
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
})(DRESS || (DRESS = {}));
