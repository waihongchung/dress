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

    DRESS.output('<b>Odds Ratio</b>');
    DRESS.output(
        DRESS.text(
            DRESS.oddsRatios(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
        ) +
        DRESS.text(
            DRESS.oddsRatios(subjects, ['EGD', 'Medications.PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
        )
    );

    DRESS.output('<b>Risk Ratio</b>');
    DRESS.output(
        DRESS.text(
            DRESS.riskRatios(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
        ) +
        DRESS.text(
            DRESS.riskRatios(subjects, ['EGD', 'Medications.PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
        )
    );

    DRESS.output('<b>Effect Measures</b>');
    DRESS.output(
        DRESS.text(
            DRESS.effectMeasures(subjects, ['Diabetic Gastroparesis'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
        ) +
        DRESS.text(
            DRESS.effectMeasures(subjects, ['EGD', 'Medications.PPI'], ['Male', 'Hypertension', 'GERD', 'Diabetes', 'Smoking', 'Alcohol', 'Scales.Nausea', 'Scales.Pain'])
        )
    );
}
