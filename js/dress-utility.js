var DRESS;
(function (DRESS) {
    /**
     * @summary Extract and format the text property of the result objects.
     *
     * @description This method loops through an array of results and extracts the text property of the result object. It also applies formatting to statistically significant results based on P values.
     *
     * The cutoff for statistical significance can be adjusted by setting the global DRESS.SIGNIFICANCE property. The default is 0.05.
     *
     * @param {object | object[]} results - A result object or an array of result objects as returned by other statistical methods within the DRESS package.
     * @returns {string} Formatted text.
     */
    DRESS.text = (results) => {
        const html = (Array.isArray(results) ? results : [results]).filter(result => result).map(result => {
            const keys = Object.keys(result);
            let output = '';
            if (typeof result['text'] === 'string') {
                const html = document.createElement('div').appendChild(document.createTextNode(result['text'])).parentNode.innerHTML;
                output += ((typeof result['p'] === 'number') && (result['p'] < DRESS.SIGNIFICANCE)) ? '<span class="highlight">' + html + '</span>' : html;
                keys.map(key => {
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
     * @summary Output HTML-formatted text onto the HTML document.
     *
     * @description This method appends an HTML-formatted text to the specified HTML DOM element.
     *
     * @param {string} html - HTML-formatted text, such as that returned by the DRESS.text method.
     * @param {number} [indent=0] - Level of indentation.
     * @param {string} [element='output'] - HTML DOM element that contains the formatted text.
     */
    DRESS.output = (html, indent = 0, element = 'output') => {
        document.getElementById(element).innerHTML += ('<div>').repeat(indent) + '<p>' + html + '</p>' + ('</div>').repeat(indent);
    };
    /**
     * @summary Download the specified content as a file.
     *
     * @description This method enables downloading the specified content as a file. If the specified content is NOT a string, it is converted into a JSON representation of the content first.
     *
     * @param {any} content - Content to be downloaded.
     * @param {string} name - File name.
    */
    DRESS.download = (content, name) => {
        const a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent((typeof content === 'string') ? content : JSON.stringify(content)));
        a.setAttribute('download', name);
        a.click();
        a.remove();
    };
})(DRESS || (DRESS = {}));
