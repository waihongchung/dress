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
    // Normalize scales
    DRESS.output('<b>Normalize</b>');
    DRESS.output(
        DRESS.text(
            DRESS.normalize(subjects, ['Scales.Nausea', 'Scales.Pain', 'Scales.QoL'], ['Nausea', 'Pain', 'QoL'])
        )
    );

    // Standardize scales
    DRESS.output('<b>Standardize</b>');
    DRESS.output(
        DRESS.text(
            DRESS.standardize(subjects, ['Scales.Nausea', 'Scales.Pain', 'Scales.QoL'], ['Nausea', 'Pain', 'QoL'])
        )
    );

    // Booleanize Data
    DRESS.output('<b>Booleanize</b>');
    DRESS.output(
        // Label gender M as male
        DRESS.text(
            DRESS.booleanize(subjects, 'Gender', ['M'], 'Male')
        ) +
        // Label any subject with hypertension as a comorbidities as hypertension
        DRESS.text(
            DRESS.booleanize(subjects, 'Comorbidities', ['Hypertension'], 'Hypertension')
        ) +
        // Label any subject with current and past smoking history as smokers
        DRESS.text(
            DRESS.booleanize(subjects, 'Smoking', ['Former', 'Current'])
        )
    );

    // Categorize Data
    DRESS.output('<b>Categorize</b>');
    DRESS.output(
        // Label diabetic etiology as 0, idiopathic and surgical etiologies as 1.
        DRESS.text(
            DRESS.categorize(subjects, 'Etiology', ['Diabetic', ['Idiopathic', 'Surgical']])
        ) +
        // Label rare alcohol use as 0, social use as 1, and frequent use as 2.
        DRESS.text(
            DRESS.categorize(subjects, 'Alcohol', ['Rare', 'Social', 'Frequent'])
        )
    );

    // Group Data
    DRESS.output('<b>Group</b>')
    var groups = DRESS.group(subjects, 'Gender', 'subjects');
    DRESS.output(
        DRESS.text(
            DRESS.frequencies(groups, ['Gender'])
        )
    );

    // Label each subject with a unique ID
    subjects = DRESS.id(subjects);    

    // Pluck Data
    DRESS.output('<b>Pluck</b>')
    var scales = DRESS.pluck(subjects, 'Scales', 'subject');
    var medications = DRESS.pluck(subjects, 'Medications', 'subject');
    DRESS.output(
        DRESS.text(
            DRESS.means(scales, ['Nausea', 'Pain', 'QoL', 'subject.Age', 'subject.BMI'])
        ) + 
        DRESS.text(
            DRESS.proportions(medications, ['PPI', 'Erythromycin', 'Metoclopramide'])
        )
    );

    // Merge Data
    DRESS.output('<b>Merge</b>')
    var merged = DRESS.merge('subject.id', scales, medications);
    console.log(merged)
    DRESS.output(
        DRESS.text(
            DRESS.means(merged, ['Nausea', 'Pain', 'QoL'])
        ) +
        DRESS.text(
            DRESS.proportions(merged, ['PPI', 'Erythromycin', 'Metoclopramide'])
        )
    )
    
}
