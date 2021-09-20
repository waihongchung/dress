function processJSON(subjects) {
    // Randomly set value to null
    subjects.map(subject => {
        ['Age', 'BMI', 'HA1C', 'Smoking', 'Etiology'].map(feature => {
            if (Math.random() < 0.05) {
                subject[feature] = null;
            }
        });
    });
    DRESS.print('<b>Mean Mode Imputation</b>');
    DRESS.print(
        DRESS.meanMode(subjects, ['Age', 'BMI', 'HA1C'], ['Smoking', 'Etiology'])        
    );

    // Randomly set value to null
    subjects.map(subject => {
        ['Age', 'BMI', 'HA1C', 'Smoking', 'Etiology'].map(feature => {
            if (Math.random() < 0.05) {
                subject[feature] = null;
            }
        });
    });
    DRESS.print('<b>LOCF Imputation</b>');
    DRESS.print(
        DRESS.locf(subjects, ['Age', 'BMI', 'HA1C', 'Smoking', 'Etiology'])
    );
}

DRESS.local('data.json', processJSON);