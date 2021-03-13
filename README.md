# DRESS Kit
Toolkit for Doing Research with ECMAScript-based Statistics (DRESS Kit)

## Introduction
In this age of evidence-based medicine, there is an increasing emphasis on the need for physicians to engage in clinical research. At the same time, the widespread use of electronic medical record systems has enabled the collection of patient health information on an unprecedented scale. Unfortunately, most physicians are not trained-biostatisticians and have no access to dedicated statistics software, except perhaps Microsoft Excel, which is not well equipped to handle large datasets or certain advanced analytical tasks. Although there exist several free, open-source, programmable statistics software, such as [R](https://www.r-project.org) and [Python]( https://www.python.org), these solutions are associated with a steep learning curve.

The DRESS Kit is a collection of scripts specifically designed to address this deficiency. They are written in plain JavaScript (ES6) and can be run, without any third-party framework dependencies, on any computers, laptops, or tablets equipped with a modern browser. There is no need to install any special software. Because JavaScript is a general-purpose programming language, the DRESS Kit can be easily extended to interface with other software, including those that perform advanced machine learning operations (e.g. [TensorFlow.js]( https://www.tensorflow.org)). The language of the DRESS Kit is carefully chosen to avoid obscure statistical jargon and relevant examples are included to demonstrate various statistics operations frequently used in the preparation of a biomedical journal manuscript.

## Suggested Use Cases
The DRESS Kit is designed with the following groups of users in mind:
- A lone investigator working on an unfunded retrospective case-control or cohort study. The investigator may develop a script using the DRESS Kit by working against a sample dataset at home. The finalized script can be sent by email and launched on the secure workstation where the PHI-containing full dataset is stored.
- A group of investigators working remotely across multiple sites. The lead investigator can distribute the finalized script electronically to each site investigator or host the script on a password-protected website to ensure that data from every site is processed in the same manner.
- An advanced user may integrate the DRESS Kit into another web/mobile app development framework to enable real-time statistical analysis in any JavaScript-based applications.

## Prerequisite
The following prerequisites are necessary to take full advantage of the DRESS Kit:
- A basic understanding of simple statistics terminology (e.g. mean, standard deviation, odds ratio, risk ratio, etc).
- A basic understanding of JavaScript programming (e.g. variable declaration, array manipulation, function invocation, etc).
- Access to a modern JavaScript engine. The latest version of [Google Chrome]( https://www.google.com/chrome/index.html) browser is recommended.
- Access to a text editor, such as [Visual Studio Code]( https://code.visualstudio.com) or [Brackets]( http://brackets.io), or an online JavaScript editor, such as [Codepen]( https://codepen.io/pen/) or [PlayCode](https://playcode.io/new/).

## Getting Started
1.	Download the entire DRESS project as a zip file. 
2.	Unzip all files into a folder.
3.	Open `example1.htm` in the `examples` folder using a browser.
4.	Click on `Choose File` and select the sample dataset `data.json` included in the `data` folder.
5.	Open `example1.js` in a text editor.
6.	Make any changes as you see fit. Save any changes.
7.	Refresh the browser to relaunch the example.

## Toolkit Content
The DRESS Kit is written in plain ES6 JavaScript. Decision is made, however, to NOT use the ES6 module system because it can create Cross-Origin Resource Sharing (CORS) errors when the script is run on a local machine. Instead, a custom-made pseudo-module system is used to breakdown the toolkit into smaller ‘modules’.
- `dress-core.js` contains a number of core statistical methods used by other modules. It is not intended to be used directly by end users, but it MUST be included at all times.

- `dress-csv.js` contains methods for parsing and generating comma-separated-values (CSV).
	- `DRESS.fromCSV` - Convert a list of comma separated values into an array of objects.
	- `DRESS.toCSV` - Convert the subjects into a CSV string.
	- `DRESS.parseArray` - Convert the specified features of the subjects into an array of values.

- `dress-utility.js` contains several utility methods for processing and displaying results returned by other methods in the DRESS Kit.
	- `DRESS.text` - Extract and format the text property of the result objects.
	- `DRESS.output` - Output HTML-formatted text onto the HTML document.
	- `DRESS.download` - Download the specified content as a file.

- `dress-descriptive.js` contains methods for performing descriptive analysis. All methods in this module expect an array of objects, often an array of subjects in a case-control or cohort study, as an input. 
	- `DRESS.proportions` - Calculate the proportion of subjects that a positive outcome, and optionally compare the result to that of a second group of subjects.
	- `DRESS.frequencies` - Calculate the frequency of occurrence for each outcome value, and optionally compare the result to that of a second group of subjects.
	- `DRESS.means` - Calculate the statistical mean for each outcome, and optionally compare the result to that of a second group of subjects.

- `dress-transform.js` contains methods for simple data transformation. All methods in this module expect an array of objects, often an array of subjects in a case-control or cohort study, as an input. 
	- `DRESS.normalize` - Normalize the specified features so that their values fall in the range of [0, 1].
	- `DRESS.standardize` - Standardize the specified features so that their values have an arithmetic mean of 0 and a standard deviation of 1.
	- `DRESS.booleanize` - Reduce the values of the specified feature into a boolean value (i.e. true or false).
	- `DRESS.categorize` - Categorize the values of the specified feature and encode the result using numerical values.
	- `DRESS.organize` - Organize the subjects into groups based on the specified feature.
	- `DRESS.synthesize` - Synthesize an array of new objects by merging several arrays of objects based on the specified feature.

- `dress-association.js` contains methods for assessing the association between outcomes and exposures. All methods in this module expect an array of objects, often an array of subjects in a case-control or cohort study, as well as a list of outcomes and exposures as inputs.
	- `DRESS.oddsRatios` - Calculate the odds of an event in the exposed group relative to that in the unexposed group.
	- `DRESS.riskRatios` - Calculate the risk of an event in the exposed group relative to that in the unexposed group.
	- `DRESS.effectMeasures` - Compute a list of effect measures based on outcomes and exposures.

- `dress-regression.js` contains methods for building various regression models. All methods in this module expect an array of objects, often an array of subjects in a case-control or cohort study, as well as a list of outcomes and features as inputs.
	- `DRESS.logistic` - Perform multiple logistic regressions.
	- `DRESS.linear` - Perform multiple linear regressions.
	- `DRESS.polynomial` - Perform simple polynomial regressions.

- `dress-roc.js` contains methods for generating receiver operating characteristic curve.
	- `DRESS.roc` - Generate a nonparametic receiver operating characteristic curve based on one or more binary classifiers.

- `dress-stepwise.js` contains methods for building regression models using the stepwise feature selection algorithms.
	- `DRESS.backward` - Apply the backward elimination algorithm on a set of features.
	- `DRESS.forward` - Apply the forward selection algorithm on a set of features.	

## Usage
Because the DRESS Kit is written in plain ES6 JavaScript, it can be used in any JavaScript or TypeScript projects without any special framework dependencies. 

For the average users, consider using one of the examples as a template: change the HTML header to include any necessary ‘modules’, then edit the `processJSON` function to perform any statistical computation on the dataset, and finally, use the `DRESS.output` method to print the results onto the HTML. 

Dataset that are stored in a spreadsheet can be exported as a CSV file and then converted into the JSON format using the `DRESS.fromCSV` method.

## Contribution
The DRESS Kit is certainly a work-in-progress. Please feel free to contribute by making bug reports, comments, suggestions, and pull requests.

## Citation
Chung W. Toolkit for Doing Research with ECMAScript-based Statistics (DRESS Kit). Retrieved on `date` from https://github.com/waihongchung/dress.
