function processJSON(subjects) {

    // Normalize scales
    DRESS.print('<b>Normalize</b>');
    DRESS.print(DRESS.normalize(subjects, ['Scales.Nausea', 'Scales.Pain', 'Scales.QoL'], ['Nausea', 'Pain', 'QoL']));

    // Standardize scales
    DRESS.print('<b>Standardize</b>');
    DRESS.print(DRESS.standardize(subjects, ['Scales.Nausea', 'Scales.Pain', 'Scales.QoL'], ['Nausea', 'Pain', 'QoL']));

    // Booleanize Data
    DRESS.print('<b>Booleanize</b>');
    DRESS.print(
        // Label gender M as male
        DRESS.booleanize(subjects, ['Gender'], ['M'], 'Male'),
        // Label any subject with hypertension as a comorbidities as hypertension        
        DRESS.booleanize(subjects, ['Comorbidities'], ['Hypertension'], 'Hypertension'),
        // Label any subject with current and past smoking history as smokers        
        DRESS.booleanize(subjects, ['Smoking'], ['Former', 'Current']),
    );

    // Categorize Data
    DRESS.print('<b>Categorize</b>');
    DRESS.print(
        // Label diabetic etiology as 0, idiopathic and surgical etiologies as 1.
        DRESS.categorize(subjects, ['Etiology'], ['Diabetic', ['Idiopathic', 'Surgical']]),
        // Label rare alcohol use as 0, social use as 1, and frequent use as 2.        
        DRESS.categorize(subjects, ['Alcohol'], ['Rare', 'Social', 'Frequent']),
    );

    // Group Data
    DRESS.print('<b>Group</b>');
    var groups = DRESS.group(subjects, 'Gender', 'subjects');
    DRESS.print(
        DRESS.frequencies(groups, ['Gender'])
    );

    // Label each subject with a unique ID
    subjects = DRESS.uuid(subjects);

    // Pluck Data
    DRESS.print('<b>Pluck</b>');
    var scales = DRESS.pluck(subjects, ['Scales'], 'subject');
    var medications = DRESS.pluck(subjects, ['Medications'], 'subject');
    DRESS.print(
        DRESS.means(scales, ['Nausea', 'Pain', 'QoL', 'subject.Age', 'subject.BMI']),
        DRESS.proportions(medications, ['PPI', 'Erythromycin', 'Metoclopramide']),
    );

    // Merge Data
    DRESS.print('<b>Merge</b>');
    var merged = DRESS.merge('subject.uuid', scales, medications);    
    DRESS.print(
        DRESS.means(merged, ['Nausea', 'Pain', 'QoL']),
        DRESS.proportions(merged, ['PPI', 'Erythromycin', 'Metoclopramide'])
    );

}

DRESS.local('data.json', processJSON);