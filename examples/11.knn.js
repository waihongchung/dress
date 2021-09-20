function processJSON(subjects) {

    // Randomly select 80% of subjects as training.
    var trainings = [];
    var validations = [];
    subjects.filter(subject => {
        if (Math.random() < 0.8) {
            trainings.push(subject);
        } else {
            validations.push(subject);
        }
    });

    var model = DRESS.kNN(trainings, ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol']);
    //
    DRESS.print('<b>Classification</b>');
    DRESS.print(
        model.performance(validations, 'Etiology', true, 5, false),
        model.performance(validations, 'Etiology', true, 5, true)    
    );

    //
    DRESS.print('<b>Regression</b>');
    DRESS.print(
        model.performance(validations, 'HA1C', false, 3)        
    );

    //
    DRESS.print('<b>Matching</b>');
    DRESS.print('<i>Greedy</i>');
    DRESS.print(
        DRESS.means(validations, ['Age', 'BMI', 'Scales.QoL'], model.match(validations, 2))    
    );

    DRESS.print('<i>Optimal</i>');
    DRESS.print(
        DRESS.means(validations, ['Age', 'BMI', 'Scales.QoL'], model.match(validations, 2, false))        
    );

    // Randomly setting 20% of datapoints as null;    
    validations.map(subject => {
        subject['Actual Etiology'] = subject['Etiology'];
        subject['Etiology'] = null;
    })
    var model = DRESS.kNN(trainings, ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol', 'Etiology']);
    model.impute(validations, ['Etiology'], true, 5)
    let count = validations.reduce((count, subject) => count + ((subject['Etiology'] === subject['Actual Etiology']) ? 1 : 0), 0);
    //
    DRESS.print('<b>Imputation</b>');
    DRESS.print('<p><pre>Accuracy: ' + DRESS.clamp(count / validations.length * 100) + '%</pre></p>');    

}

DRESS.local('data.json', processJSON);