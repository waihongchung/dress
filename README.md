# DRESS Kit
Toolkit for Doing Research with ECMAScript-based Statistics (DRESS Kit)

## Introduction
In this age of evidence-based medicine, there is an increasing emphasis on the need for physicians to engage in clinical research. At the same time, the widespread use of electronic medical record systems has enabled the collection of patient health information on an unprecedented scale. Unfortunately, most physicians are not trained-biostatisticians and have no access to dedicated statistics software, except perhaps Microsoft Excel, which is not well equipped to handle large datasets or certain advanced analytical tasks. Although there exist several free, open-source, programmable statistics software, such as [R](https://www.r-project.org) and [Python](https://www.python.org), these solutions are associated with a steep learning curve.

The DRESS Kit is a collection of scripts specifically designed to address this deficiency. They are written in plain JavaScript (ES6) and can be run, without any third-party framework dependencies, on any computers, laptops, or tablets equipped with a modern browser. There is no need to install any special software. Because JavaScript is a general-purpose programming language, the DRESS Kit can be easily extended to interface with other software, including those that perform advanced machine learning operations (e.g. [TensorFlow.js](https://www.tensorflow.org)). The language of the DRESS Kit is carefully chosen to avoid obscure statistical jargon and relevant examples are included to demonstrate various statistics operations frequently used in the preparation of a biomedical journal manuscript.

## Suggested Use Cases
The DRESS Kit is designed with the following groups of users in mind:
- A lone investigator working on an unfunded retrospective case-control or cohort study. The investigator may develop a script using the DRESS Kit by working against a sample dataset at home. The finalized script can be launched on a secure workstation, where the PHI-containing full dataset is stored.
- A group of investigators working remotely across multiple sites. The lead investigator can distribute the finalized script electronically to each site investigator or host the script on a password-protected website to ensure that data from every site is processed in the same manner.
- An advanced user may integrate the DRESS Kit into another web/mobile app development framework to enable real-time statistical analysis in any JavaScript-based applications.

## Prerequisites
The following prerequisites are necessary to take full advantage of the DRESS Kit:
- A basic understanding of simple statistics terminology (e.g. mean, standard deviation, odds ratio, risk ratio, etc).
- A basic understanding of JavaScript programming (e.g. variable declaration, array manipulation, function invocation, etc).
- Access to a modern JavaScript engine. The latest version of [Google Chrome](https://www.google.com/chrome/index.html) browser is recommended.
- Access to a text editor, such as [Visual Studio Code](https://code.visualstudio.com) or [Brackets](http://brackets.io), or an online JavaScript editor, such as [Codepen](https://codepen.io/pen/) or [PlayCode](https://playcode.io/new/).

## Getting Started
1.	Download the entire DRESS project as a zip file. 
2.	Unzip all files into a folder.
3.	Open `1.descriptive.htm` in the `examples` folder using a browser.
4.	Click on `Choose File` and select the sample dataset `data.json` included in the `data` folder.
5.	Open `1.descriptive.js` in a text editor.
6.	Make changes to the `processJSON` function. Save any changes.
7.	Refresh the browser to relaunch the example.

## General Instructions
Most methods contained in the DRESS Kit are designed to work on an array of objects, instead of a table. In most situations, each object represents a study subject or a test sample. Each data point is stored as a property of the object. This approach allows for a hierarchical data structure that may be otherwise difficult to achieve using tables. For instance, each patient may be associated with more than one hospital admission, and each admission may be associated with more than one procedure. This approach also allows related data points to be logically organized. For instance, all pre-admission test results can be grouped under the `preadmission` data object, while the post-admission test results can be grouped under the `postadmission` data object.

Datasets that are stored in a spreadsheet can be exported as a CSV file and then converted into the JSON format using the `DRESS.fromCSV` method. Each row represents a subject and each column represents a property of the subject. The header row is used as the name of the properties. The DRESS Kit supports the use of dot notation for property names. For instance, you can use `labs.hemoglobin`, `labs.platelet`, and `labs.sodium` as column headers in the CSV file. You can then access all the labs results as `labs`, or indvidual lab result as `labs.hemoglobin`, `labs.platelet`, etc.

## Toolkit Content
The DRESS Kit is written in plain ES6 JavaScript. Decision is made, however, to NOT use the ES6 module system because it can create Cross-Origin Resource Sharing (CORS) errors when the script is run on a local machine. Instead, a custom-made pseudo-module system is used to breakdown the toolkit into smaller ‘modules’. A minified version containing the entire DRESS Kit is also made available periodically.

- `dress-core.js` contains a number of core statistical methods used by other modules. It is not intended to be used directly by end users, but it MUST be included at all times.

- `dress-csv.js` contains methods for parsing and generating comma-separated-values (CSV).
	- `DRESS.fromCSV` - Convert a list of comma separated values into an array of objects.
	- `DRESS.toCSV` - Convert the subjects into a CSV string.
	- `DRESS.parseNumber` - Convert the specified features of the subjects into numeric values.
	- `DRESS.parseArray` - Convert the specified features of the subjects into an array of values.

- `dress-utility.js` contains several utility methods for processing and displaying results returned by other methods in the DRESS Kit.	
	- `DRESS.print` - Print text onto the default DIV element.
	- `DRESS.save` - Save the specified content as a file.
	- `DRESS.local` - Load a local data file.
	- `DRESS.remote` - Load a remote data file.
	- `DRESS.async` - Perform an asynchronous function call.

- `dress-transform.js` contains methods for data transformation.
	- `DRESS.normalize` - Normalize the specified features so that their values fall in the range of [0, 1].
	- `DRESS.standardize` - Standardize the specified features so that their values have an arithmetic mean of 0 and a standard deviation of 1.
	- `DRESS.booleanize` - Reduce the values of the specified feature into a boolean value (i.e. true or false).	
	- `DRESS.categorize` - Categorize the values of the specified feature and encode the result using numerical values.	
	- `DRESS.uuid` - Generate a UUID for each subject.
	- `DRESS.group` - Organize the subjects into groups based on the specified feature.
	- `DRESS.merge` - Create a new array of subjects by merging several arrays of subjects based on the values of the specified feature.
	- `DRESS.pluck` - Create a new array of containing the values of the specified features, and optionally add a back reference to the subject.

- `dress-sorting.js` contains methods for sorting array of subjects.
	- `DRESS.sort` - Multilevel mixed data type sorting.

- `dress-outlier.js` contains methods for identifying outlying values.
	- `DRESS.boxplot` - Outlier detection using boxplot.
	- `DRESS.grubbs` - Outlier detection using the Grubbs' test.

- `dress-imputation.js` contains methods for imputing missing values.
	- `DRESS.meanMode` - Mean/mode imputation.
	- `DRESS.locf` - Last observation carried forward imputation.	
	- `DRESS.nullify` - Set the nullable values of the specified features to null.
	- `DRESS.denullify` - Remove any subjects that contains a null value as one of the specified features.

- `dress-descriptive.js` contains methods for performing descriptive analysis.
	- `DRESS.proportions` - Calculate the proportion of subjects that a positive outcome, and optionally compare the result to that of a second group of subjects.
	- `DRESS.frequencies` - Calculate the frequency of occurrence for each outcome value, and optionally compare the result to that of a second group of subjects.
	- `DRESS.means` - Calculate the statistical mean for each outcome, and optionally compare the result to that of a second group of subjects.
	- `DRESS.medians` - Locate the medians of the specified features, and optionally compare the result to that of a second group of subjects.

- `dress-association.js` contains methods for assessing the association between outcomes and exposures.
	- `DRESS.oddsRatios` - Calculate the odds of an event in the exposed group relative to that in the unexposed group.
	- `DRESS.riskRatios` - Calculate the risk of an event in the exposed group relative to that in the unexposed group.
	- `DRESS.effectMeasures` - Compute a list of effect measures based on outcomes and exposures.
	- `DRESS.correlations` - Calculate the degree of correlation between the specified features.

- `dress-regression.js` contains methods for building various regression models.
	- `DRESS.logistic` - Multiple logistic regressions.
	- `DRESS.linear` - Multiple linear regressions.
	- `DRESS.polynomial` - Simple polynomial regression.
	- `DRESS.backward` - Apply the backward elimination algorithm on a set of features.
	- `DRESS.forward` - Apply the forward selection algorithm on a set of features.

- `dress-visualization.js` contains methods for visualizing data structures.
	- `DRESS.histograms` - Generate ASCII histograms.
	- `DRESS.heatmap` - Generate a heatmap from a correlation matrix.

- `dress-matching.js` contains methods for matching samples with controls.
	- `DRESS.exact` - Perform exact matching.
	- `DRESS.propensity` - Perform propensity score matching.

- `dress-roc.js` contains methods for generating receiver operating characteristic curve.
	- `DRESS.roc` - Generate a nonparametic receiver operating characteristic curve based on one or more binary classifiers.

- `dress-knn.js` contains methods for building a kNN model.
	- `DRESS.knn` - Build a K-nearest-neighbor Model.

- `dress-ensemble.js` contains methods for building ensemble models in machine learning.
	- `DRESS.randomForest` - Build a Random Forest model.
	- `DRESS.gradientBoosting` - Build a Stochastic Gradient Boosting model

- `dress-neural.js` contains methods for building artificial neural network.
	- `DRESS.neuralNetwork` - Build a Multilayer Perceptron.

## Contribution
The DRESS Kit is certainly a work-in-progress. Please feel free to contribute by making bug reports, comments, suggestions, and pull requests.

## Citation
Chung W. Toolkit for Doing Research with ECMAScript-based Statistics (DRESS Kit). Retrieved on `date` from https://github.com/waihongchung/dress.
