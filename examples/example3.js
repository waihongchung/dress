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

    DRESS.print('<b>Odds Ratio</b>');
    DRESS.print(
        DRESS.oddsRatios(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain']),
        DRESS.oddsRatios(subjects, ['EGD', 'Medications.PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
    );

    DRESS.print('<b>Risk Ratio</b>');
    DRESS.print(
        DRESS.riskRatios(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain']),
        DRESS.riskRatios(subjects, ['EGD', 'Medications.PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
    );

    DRESS.print('<b>Effect Measures</b>');
    DRESS.print(
        DRESS.effectMeasures(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain']),
        DRESS.effectMeasures(subjects, ['EGD', 'Medications.PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
    );

    DRESS.print('<b>Correlations</b>');
    DRESS.print(
        DRESS.correlations(subjects, ['Age', 'BMI', 'Disease Duration', 'HA1C', 'Scales.Nausea', 'Scales.Pain', 'Scales.QoL'])
    );
}

DRESS.local('data.json', processJSON);
