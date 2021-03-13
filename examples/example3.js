function readJSON(input) {
    if (input.files && input.files.length) {
        var fileReader = new FileReader();
        fileReader.readAsBinaryString(input.files[0]);
        fileReader.onload = (event) => {
            processJSON(JSON.parse(event.target.result));
        };
    }
}

function processJSON(subjects) {
    // Transform Data
    DRESS.booleanize(subjects, 'Gender', ['M'], 'Male');
    DRESS.booleanize(subjects, 'Etiology', ['Diabetic'], 'Diabetic Gastroparesis');
    DRESS.booleanize(subjects, 'Comorbidities', ['Hypertension'], 'Hypertension');
    DRESS.booleanize(subjects, 'Comorbidities', ['Diabetes'], 'Diabetes');
    DRESS.booleanize(subjects, 'Comorbidities', ['GERD'], 'GERD');
    DRESS.booleanize(subjects, 'Smoking', ['Former', 'Current']);
    DRESS.booleanize(subjects, 'Alcohol', ['Former', 'Frequent']);
    //
    subjects.map(subject => {
        subject['Age 45+'] = (+subject['Age'] >= 45);
        subject['PPI'] = (+subject['PPI'] > 0);        
    });
    //

    DRESS.output('<b>Odds Ratio</b>');
    DRESS.output(
        DRESS.text(
            DRESS.oddsRatios(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Age 45+'])
        ) +
        DRESS.text(
            DRESS.oddsRatios(subjects, ['EGD', 'PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Age 45+'])
        )
    );

    DRESS.output('<b>Risk Ratio</b>');
    DRESS.output(
        DRESS.text(
            DRESS.riskRatios(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Age 45+'])
        ) +
        DRESS.text(
            DRESS.riskRatios(subjects, ['EGD', 'PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Age 45+'])
        )
    );
}
