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
    DRESS.output('<b>ROC Curve</b>');
    DRESS.output(
        DRESS.text(
            DRESS.roc(subjects, ['Erythromycin'], ['Age', 'Disease Duration', 'HA1C', 'Nausea', 'Pain', 'QoL'])
        )
    );
    //
    DRESS.output('<b>Logistic Regression with ROC Curve</b>');
    DRESS.output(
        DRESS.text(            
            DRESS.logistic(subjects, ['EGD', 'PPI'], ['Disease Duration', 'Diabetes', 'GERD'], DRESS.roc)
        )
    );
}
