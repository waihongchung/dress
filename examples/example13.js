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
    DRESS.print('<b>Neural Network</b>');
    DRESS.print('<b>Classification</b>');
    var model = DRESS.neuralNetwork(trainings, 'Etiology', ['Age', 'BMI', 'Disease Duration', 'Scales.Nausea', 'Scales.Pain', 'Scales.QoL', 'Medications.PPI', 'Medications.Metoclopramide', 'Medications.Erythromycin'], true);
    DRESS.print(
        model,
        model.performance(validations),  
        DRESS.importance(trainings, model)          
    );

    //
    DRESS.print('<b>Regression</b>');
    var model = DRESS.neuralNetwork(trainings, 'HA1C', ['Age', 'BMI', 'Disease Duration', 'Scales.Nausea', 'Scales.Pain', 'Scales.QoL', 'Medications.PPI', 'Medications.Metoclopramide', 'Medications.Erythromycin'], false);
    DRESS.print(
        model,
        model.performance(validations),  
        DRESS.importance(trainings, model)                
    );

}

DRESS.local('data.json', processJSON);
