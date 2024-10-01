# DRESS Kit
Toolkit for **D**oing **R**esearch with **E**CMA**S**cript-based **S**tatistics (DRESS Kit)

## Introduction
In this age of evidence-based medicine, there is an increasing emphasis on the need for physicians to engage in clinical research. At the same time, the widespread use of electronic medical record systems has enabled the collection of patient health information on an unprecedented scale. Unfortunately, most physicians are not trained biostatisticians and have no access to dedicated statistics software, except perhaps Microsoft Excel, which is not well equipped to handle large datasets or certain advanced analytical tasks. Although there exist several free, open-source, programmable statistics software, such as [R](https://www.r-project.org) and [Python](https://www.python.org), these solutions are associated with a steep learning curve.

The DRESS Kit is a library of scripts specifically designed to address this deficiency. They are written in plain JavaScript (ES6) and can be run, without any third-party framework dependencies, on any computers, laptops, or tablets equipped with a modern browser. There is no need to install any special software. Because JavaScript is a general-purpose programming language, the DRESS Kit can be easily extended to interface with other software, including those that perform advanced machine learning operations (e.g. [TensorFlow.js](https://www.tensorflow.org)). The language of the DRESS Kit is carefully chosen to avoid obscure statistical jargon and relevant examples are included to demonstrate various statistics operations frequently used in the preparation of a biomedical journal manuscript.

## Suggested Use Cases
The DRESS Kit is designed with the following groups of users in mind:
- A lone investigator working on an unfunded retrospective case-control or cohort study. The investigator may develop a script using the DRESS Kit by working against a sample dataset at home. The finalized script can be launched on a secure workstation, where the PHI-containing full dataset is stored.
- A group of investigators working remotely across multiple sites. The lead investigator can distribute the finalized script electronically to each site investigator or host the script on a password-protected website to ensure that data from every site is processed in the same manner.
- A hospital quality improvement team may develop machine learning models using the DRESS Kit and deploy the final model in a web-enabled electronic medical record system.
- A software developer may integrate the DRESS Kit into another web/mobile app development framework to enable real-time statistical analysis and machine learning in any JavaScript-based application.

## Prerequisites
The following prerequisites are necessary to take full advantage of the DRESS Kit:
- A basic understanding of simple statistics terminology (e.g. mean, standard deviation, odds ratio, risk ratio, etc).
- A basic understanding of JavaScript programming (e.g. variable declaration, array manipulation, function invocation, etc).
- Access to a modern JavaScript engine. The latest version of [Google Chrome](https://www.google.com/chrome/index.html) browser is recommended.
- Access to a text editor, such as [Visual Studio Code](https://code.visualstudio.com) or [Brackets](http://brackets.io), or an online JavaScript editor, such as [Codepen](https://codepen.io/pen/) or [Phoenix](https://phcode.dev/).

## Getting Started
1.	Download the entire DRESS project as a zip file. 
2.	Unzip all files into a folder.
3.	Open `1.descriptive.htm` in the `examples` folder using a browser.
4.	Click on `Choose File` and select the sample dataset `data.json` included in the `data` folder.
5.	Open `1.descriptive.js` in a text editor.
6.	Make changes to the script.
7.	Refresh the browser to relaunch the example.

## General Instructions
Most methods contained in the DRESS Kit are designed to work on an array of objects, instead of a table. In most situations, each object represents a study subject or a test sample. Each data point is stored as a property of the object. This approach allows for a hierarchical data structure that may be otherwise difficult to achieve using tables. For instance, each patient may be associated with more than one hospital admission, and each admission may be associated with more than one procedure. This approach also allows related data points to be logically organized. For instance, all pre-admission test results can be grouped under the `preadmission` data object, while the post-admission test results can be grouped under the `postadmission` data object.

Datasets that are stored in a spreadsheet can be exported as a CSV file and then converted into the JSON format using the `DRESS.fromCSV` method. Each row represents a subject and each column represents a property of the subject. The labels in the header row are used as the names of the properties. The DRESS Kit supports the use of dot notation for property names. For instance, you can use `labs.hemoglobin`, `labs.platelet`, and `labs.sodium` as column headers in the CSV file. You can then access all the labs results as `labs`, or individual lab results as `labs.hemoglobin`, `labs.platelet`, etc.

## Toolkit Content
The DRESS Kit is written in plain ES6 JavaScript. The decision is made, however, to NOT use the ES6 module system because it can create Cross-Origin Resource Sharing (CORS) errors when the script is run on a local machine. Instead, a custom-made pseudo-module system is used to break down the toolkit into smaller ‘modules’. A minified version containing the entire DRESS Kit is also made available periodically.

- `dress.js` contains the core statistical methods used by other modules. It is not intended to be used directly by end users, but it MUST be included at all times.

- `dress-association.js` contains methods for assessing the association between outcomes and exposures.
	- `DRESS.oddsRatios` - Calculate the odds of an event in the exposed group relative to that in the unexposed group.
	- `DRESS.riskRatios` - Calculate the risk of an event in the exposed group relative to that in the unexposed group.	
	- `DRESS.correlations` - Calculate the degree of correlation between the specified features.

- `dress-csv.js` contains methods for parsing and generating comma-separated-values (CSV).
	- `DRESS.fromCSV` - Convert a list of comma-separated values into an array of objects.
	- `DRESS.toCSV` - Convert an array of objects into a CSV string.
	- `DRESS.parseArray` - Convert the specified features of the subjects into an array of values.
	- `DRESS.parseNumber` - Convert the specified features of the subjects into numeric values.

- `dress-descriptive.js` contains methods for performing descriptive analysis.
	- `DRESS.summary` - Generate a concise summary of the specified array of subjects.
	- `DRESS.means` - Calculate the statistical mean for each outcome, and optionally compare the result to that of a second group of subjects.
	- `DRESS.medians` - Locate the medians of the specified features, and optionally compare the result to that of a second group of subjects.
	- `DRESS.proportions` - Calculate the proportion of subjects that have a positive outcome, and optionally compare the result to that of a second group of subjects.
	- `DRESS.frequencies` - Calculate the frequency of occurrence for each outcome value, and optionally compare the result to that of a second group of subjects.
	
- `dress-imputation.js` contains methods for imputing missing values.
	- `DRESS.meanMode` - Mean/mode imputation.
	- `DRESS.locf` - Last observation carried forward imputation.	
	- `DRESS.nullify` - Set the nullable values of the specified features to null.
	- `DRESS.denullify` - Remove any subjects that contain a null value as one of the specified features.

- `dress-io.js` contains several utility methods for processing and displaying results returned by other methods in the DRESS Kit.		
	- `DRESS.print` - Print text onto the default DIV element.
	- `DRESS.text` - Extract and format the text property from a result object.
	- `DRESS.save` - Save the specified content as a file.
	- `DRESS.local` - Load a local data file.
	- `DRESS.remote` - Load a remote data file.	
	- `DRESS.deflate` - Remove methods from a machine learning model object.
	- `DRESS.inflate` - Retore methods associated with a machine learning model object.

- `dress-knn.js` contains methods for building a kNN model.
	- `DRESS.kNN` - Build a K-nearest-neighbor Model.

- `dress-matching.js` contains methods for matching samples with controls.
	- `DRESS.exact` - Perform exact matching.
	- `DRESS.propensity` - Perform propensity score matching.
	- `DRESS.proximity` - Perform proximity score matching.
	- `DRESS.synthetic` - Perform Adaptive Synthetic Sampling.

- `dress-modeling.js` contains methods for fine-tuning machine-learning models.
	- `DRESS.importances` - Compute permutation feature importances.
	- `DRESS.crossValidate` - Perform K-fold cross-validation.
	- `DRESS.hyperparameters` - Automatic hyperparameter tuning.

- `dress-neural.js` contains methods for building an artificial neural network.
	- `DRESS.multilayerPerceptron` - Build a Multilayer Perceptron.

- `dress-normality.js` contains methods for assessing normality and transforming values into a normal distribution.
	- `DRESS.boxcox` - Box-Cox power transformation.
	- `DRESS.johnson` - Yeo-Johnson power transformation.
	- `DRESS.shapiro` - Shapiro-Wilk/Shapiro-Francia Royston test.	
	- `DRESS.dagostino` - d'Agostino-Pearson test.

- `dress-outlier.js` contains methods for identifying outlying values.
	- `DRESS.boxplot` - Outlier detection using boxplot.
	- `DRESS.grubbs` - Outlier detection using the Grubbs' test.

- `dress-regression.js` contains methods for building various regression models.	
	- `DRESS.linear` - Multiple linear regressions.
	- `DRESS.polynomial` - Simple polynomial regression.
	- `DRESS.logistic` - Multiple logistic regressions.
	- `DRESS.polytomous` - Polytomous Logistic regression.
	- `DRESS.collinearity` - Eliminate highly correlated features based on the variance inflation factor (VIF).
	- `DRESS.backward` - Apply the backward elimination algorithm to a set of features.
	- `DRESS.forward` - Apply the forward selection algorithm to a set of features.
	
- `dress-roc.js` contains methods for generating receiver operating characteristic curves.
	- `DRESS.roc` - Generate a nonparametric receiver operating characteristic curve based on one or more binary classifiers.
	- `DRESS.pr` - Generate a nonparametric precision-recall curve based on one or more binary classifiers.

- `dress-sorting.js` contains methods for sorting an array of subjects.
	- `DRESS.sort` - Multilevel mixed data type sorting.

- `dress-transform.js` contains methods for data transformation.
	- `DRESS.normalize` - Normalize the specified features so that their values fall in the range of [lower, upper].
	- `DRESS.standardize` - Standardize the specified features so that their values have an arithmetic mean of 0 and a standard deviation of 1.
	- `DRESS.booleanize` - Reduce the values of the specified feature into a boolean value (i.e. true or false).	
	- `DRESS.categorize` - Convert the values of the specified numerical features into discrete categorical values.	
	- `DRESS.numericize` - Convert the values of the specified categorical features into numerical values.	
	- `DRESS.group` - Organize the subjects into groups based on the specified feature.
	- `DRESS.pluck` - Create a new array containing the values of the specified features, and optionally add a back reference to the subject.
	- `DRESS.merge` - Create a new array of subjects by merging several arrays of subjects based on the values of the specified feature.
	- `DRESS.split` - Split an array of subjects into two arrays.
	- `DRESS.rename` - Rename the specified feature.
	- `DRESS.oneHot` - Apply One-Hot Encoding on the specified features.
	- `DRESS.hotOne` - Reverse One-Hot Encoding on the specified features.

- `dress-tree.js` contains methods for building ensemble models in machine learning.
	- `DRESS.randomForest` - Build a Random Forest model.
	- `DRESS.gradientBoosting` - Build a Stochastic Gradient Boosting model

- `dress-visualization.js` contains methods for visualizing data structures.
	- `DRESS.histograms` - Generate ASCII histograms.
	- `DRESS.heatmap` - Generate a heatmap from a correlation matrix.

## Contribution
The DRESS Kit is certainly a work in progress. Please feel free to contribute by making bug reports, comments, suggestions, and pull requests.

## Citation
Chung W. Toolkit for Doing Research with ECMAScript-based Statistics (DRESS Kit). Retrieved on `date` from https://github.com/waihongchung/dress.
