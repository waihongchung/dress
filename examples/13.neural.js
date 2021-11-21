function processJSON(subjects) {

    // Perform One-Hot Encoding for Gender, Smoking, and Alcohol
    DRESS.print('<b>One-Hot Encoding</b>');
    var encodings = DRESS.oneHot(subjects, ['Gender', 'Smoking', 'Alcohol']);
    DRESS.print(
        encodings
    );
    var encodedFeatures = encodings.reduce((array, encoding) => array.concat(encoding.labels.map(label => encoding.feature + '.' + label)), []);

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
    DRESS.print('<b>Neural Network</b>');
    DRESS.print('<b>Classification</b>');
    var model = DRESS.multilayerPerceptron(trainings, 'Etiology', ['Age', 'BMI', 'Disease Duration', 'Scales.QoL', 'Comorbidities', ...encodedFeatures], true, {dilution: 2});
    DRESS.print(
        model,
        model.performance(validations),  
        DRESS.importance(model, trainings)          
    );

    //    
    DRESS.print('<b>Regression</b>');
    var model = DRESS.multilayerPerceptron(trainings, 'HA1C', ['Age', 'BMI', 'Disease Duration', 'Scales.QoL', 'Comorbidities', ...encodedFeatures], false, {dilution: 2});
    DRESS.print(
        model,
        model.performance(validations),  
        DRESS.importance(model, trainings)                
    );

}

DRESS.local('data.json', processJSON);
