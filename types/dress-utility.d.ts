declare namespace DRESS {
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
    let text: (results: object | object[]) => string;
    /**
     * @summary Output HTML-formatted text onto the HTML document.
     *
     * @description This method appends an HTML-formatted text to the specified HTML DOM element.
     *
     * @param {string} html - HTML-formatted text, such as that returned by the DRESS.text method.
     * @param {number} [indent=0] - Level of indentation.
     * @param {string} [element='output'] - HTML DOM element that contains the formatted text.
     */
    let output: (html: string, indent?: number, element?: string) => void;
    /**
     * @summary Download the specified content as a file.
     *
     * @description This method enables downloading the specified content as a file. If the specified content is NOT a string, it is converted into a JSON representation of the content first.
     *
     * @param {any} content - Content to be downloaded.
     * @param {string} name - File name.
    */
    let download: (content: any, name: string) => void;
}
