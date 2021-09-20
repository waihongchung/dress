function processJSON(subjects) {
    // Transform Data
    DRESS.booleanize(subjects, ['Gender'], ['M'], ['Male']);
    DRESS.booleanize(subjects, ['Etiology'], ['Diabetic'], ['Diabetic Gastroparesis']);
    DRESS.booleanize(subjects, ['Comorbidities'], ['Hypertension'], ['Hypertension']);
    DRESS.booleanize(subjects, ['Comorbidities'], ['Diabetes'], ['Diabetes']);
    DRESS.booleanize(subjects, ['Comorbidities'], ['GERD'], ['GERD']);
    DRESS.booleanize(subjects, ['Smoking'], ['Former', 'Current']);
    DRESS.booleanize(subjects, ['Alcohol'], ['Former', 'Frequent']);
    //
    DRESS.print('<b>Multiple Logistic Regression</b>');
    DRESS.print(
        DRESS.logistic(subjects, ['EGD', 'Medications.PPI'], ['Age', 'Disease Duration', 'BMI', 'HA1C', 'Male', 'Hypertension', 'Diabetes', 'GERD', 'Smoking', 'Alcohol'])        
    );
    //
    DRESS.print('<b>Backward Elimination</b>');
    DRESS.print(
        DRESS.backward(DRESS.logistic, subjects, ['EGD', 'Medications.PPI'], ['Age', 'Disease Duration', 'BMI', 'HA1C', 'Male', 'Hypertension', 'Diabetes', 'GERD', 'Smoking', 'Alcohol'])    
    );
    //
    DRESS.print('<b>Forward Selection</b>');
    DRESS.print(
        DRESS.forward(DRESS.logistic, subjects, ['EGD', 'Medications.PPI'], ['Age', 'Disease Duration', 'BMI', 'HA1C', 'Male', 'Hypertension', 'Diabetes', 'GERD', 'Smoking', 'Alcohol'])        
    );
}

DRESS.local('data.json', processJSON);
