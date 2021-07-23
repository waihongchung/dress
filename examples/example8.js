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
    DRESS.print('<b>ROC Curve</b>');
    DRESS.print(
        DRESS.roc(subjects, ['Medications.Erythromycin'], ['Age', 'Disease Duration', 'HA1C', 'Scales.Nausea', 'Scales.Pain', 'Scales.QoL'])
    );

    //
    var model = DRESS.logistic(subjects, ['EGD', 'Medications.PPI'], ['Disease Duration', 'Diabetes', 'GERD'])
    DRESS.print('<b>Logistic Regression with ROC Curve</b>');
    DRESS.print(
        model,
        model.roc(subjects)    
    );
}

DRESS.local('data.json', processJSON);
