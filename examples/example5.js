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
    // Randomly split the dataset to 80% training and 20% testing per etiology.
    const trainings = [];
    const testings = [];
    subjects.map(subject => subject['Etiology']).filter((etiology, index, etiologies) => etiologies.indexOf(etiology) === index).map(etiology => {
        subjects.filter(subject => subject['Etiology'] === etiology).map(subject => {
            if (Math.random() < 0.8) {
                trainings.push(subject);
            } else {
                testings.push(subject);
            }
        });
    });
    // Set the etiology in the testing set to null.
    testings.map(subject => {
        subject['Actual Etiology'] = subject['Etiology'];
        subject['Etiology'] = null;
    });
    //
    DRESS.output('<b>KNN Imputation</b>');
    DRESS.output(
        DRESS.text(
            DRESS.knn([...trainings, ...testings], ['Age', 'BMI', 'HA1C'], ['Smoking'], ['Etiology'])
        )
    );
    const count = testings.reduce((count, subject) => count + ((subject['Etiology'] === subject['Actual Etiology']) ? 1 : 0), 0);
    DRESS.output('Accuracy: ' + DRESS.clamp(count / testings.length * 100) + '%');


    // Randomly set value to null
    subjects.map(subject => {
        ['Age', 'BMI', 'HA1C', 'Smoking', 'Etiology'].map(feature => {
            if (Math.random() < 0.1) {
                subject[feature] = null;
            }
        });
    });
    DRESS.output('<b>Mean Mode Imputation</b>');
    DRESS.output(
        DRESS.text(
            DRESS.meanMode(subjects, ['Age', 'BMI', 'HA1C', 'Smoking', 'Etiology'])
        )
    );
    
    // Randomly set value to null
    subjects.map(subject => {
        ['Age', 'BMI', 'HA1C', 'Smoking', 'Etiology'].map(feature => {
            if (Math.random() < 0.01) {
                subject[feature] = null;
            }
        });
    });
    DRESS.output('<b>LOCF Imputation</b>');
    DRESS.output(
        DRESS.text(
            DRESS.locf(subjects, ['Age', 'BMI', 'HA1C', 'Smoking', 'Etiology'])
        )
    );
}