function processJSON(subjects) {

    /*
    DRESS.SEED = 1;
    DRESS.print('<b>Cross Validation</b>');
    DRESS.print('<b>Classification</b>');
    DRESS.print(        
        DRESS.async('DRESS.crossValidate', { async: 'DRESS.neuralNetwork' }, subjects, 'Etiology', ['Age', 'BMI', 'Disease Duration', 'Scales.Nausea', 'Scales.Pain', 'Scales.QoL', 'Medications.PPI', 'Medications.Metoclopramide', 'Medications.Erythromycin'], true)
    );

    DRESS.print('<b>Regression</b>');
    DRESS.print(
        DRESS.async('DRESS.crossValidate', { async: 'DRESS.neuralNetwork' }, subjects, 'HA1C', ['Age', 'BMI', 'Disease Duration', 'Scales.Nausea', 'Scales.Pain', 'Scales.QoL', 'Medications.PPI', 'Medications.Metoclopramide', 'Medications.Erythromycin'], false)
    );
    */


    DRESS.print('<b>Model Tuning</b>');
    DRESS.print(
        DRESS.async('DRESS.hypertune', { size: 2, depth: 2, sampling: 0.5, learning: 0.05, trees: 50 }, ['size', 'depth', 'sampling', 'learning', 'trees'], [1, 1, 0.05, 0.01, 50], 10, { async: 'DRESS.gradientBoosting' }, subjects, 'HA1C', ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol'], false)    
    );

}

DRESS.local('data.json', processJSON);
