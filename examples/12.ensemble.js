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

    //
    DRESS.print('<b>Random Forest</b>');
    DRESS.print('<b>Classification</b>');
    var model = DRESS.randomForest(trainings, 'Etiology', ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol'], true);
    DRESS.print(
        model,
        model.performance(validations),
        model.importance(),        
    );

    //
    DRESS.print('<b>Regression</b>');
    var model = DRESS.randomForest(trainings, 'HA1C', ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol'], false);
    DRESS.print(
        model,
        model.performance(validations),
        model.importance(),        
    );

    DRESS.print('&nbsp;')
    //
    DRESS.print('<b>Gradient Boosting</b>');
    DRESS.print('<b>Classification</b>');
    var model = DRESS.gradientBoosting(trainings, 'Etiology', ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol'], true);
    DRESS.print(
        model,
        model.performance(validations),        
        model.importance(),        
    );

    //
    DRESS.print('<b>Regression</b>');
    var model = DRESS.gradientBoosting(trainings, 'HA1C', ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol'], false);    
    DRESS.print(
        model,
        model.performance(validations),
        model.importance(),        
    );

}

DRESS.local('data.json', processJSON);