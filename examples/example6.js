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
        subject['PPI'] = (+subject['PPI'] > 0);
    });
    //
    DRESS.output('<b>Multiple Logistic Regression</b>');
    DRESS.output(
        DRESS.text(
            DRESS.logistic(subjects, ['EGD', 'PPI'], ['Age', 'Disease Duration', 'BMI', 'HA1C', 'Male', 'Hypertension', 'Diabetes', 'GERD', 'Smoking', 'Alcohol'])
        )
    );
    //
    DRESS.output('<b>Backward Elimination</b>');
    DRESS.output(
        DRESS.text(
            DRESS.backward(DRESS.logistic, subjects, ['EGD', 'PPI'], ['Age', 'Disease Duration', 'BMI', 'HA1C', 'Male', 'Hypertension', 'Diabetes', 'GERD', 'Smoking', 'Alcohol'])
        )
    );
    //
    DRESS.output('<b>Forward Selection</b>');
    DRESS.output(
        DRESS.text(
            DRESS.forward(DRESS.logistic, subjects, ['EGD', 'PPI'], ['Age', 'Disease Duration', 'BMI', 'HA1C', 'Male', 'Hypertension', 'Diabetes', 'GERD', 'Smoking', 'Alcohol'])
        )
    );
}
