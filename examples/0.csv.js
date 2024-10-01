
// Open the 'data.csv' file.
DRESS.local('data.csv', true).then(csv => {

    // Convert CSV to JSON.
    let subjects = DRESS.fromCSV(csv);

    // Obtain a summary of the JSON dataset.
    let summary = DRESS.summary(subjects);
    DRESS.print(summary);

    // Parse all numerical features.
    DRESS.print(
        DRESS.parseNumeric(subjects, summary.features.filter(feature => feature.numeric).map(feature => feature.feature))
    );

    // Parse arrays.
    DRESS.print(
        DRESS.parseArray(subjects, ['Admissions', 'Demographics.Barriers'])
    );

    // Save the parsed dataset.
    DRESS.save(subjects, 'data.json');

});

