DRESS.local('data.json').then(subjects => {

    // Means    
    DRESS.print(
        '<b>Means (Async)</b>',
        DRESS.async('DRESS.means', subjects, ['MELD', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );


    // Multiple Linear Regression    
    DRESS.print(
        '<b>Multiple Linear Regression (Async)</b>',
        DRESS.async('DRESS.linear', subjects, 'MELD', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR']).then(model => {
                return model.validate(subjects);
            })
    );

    // Forward Selection    
    DRESS.print(
        '<b>Forward Feature Selection (Async)</b>',
        DRESS.async('DRESS.forward', { async: 'DRESS.polytomous' }, subjects, 'Etiology', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );

    // Multilayer Perceptron    
    DRESS.print(
        '<b>Multilayer Perceptron (Async)</b>',
        DRESS.async('DRESS.multilayerPerceptron', subjects, 'Etiology', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'], true).then(model => {
            // Print the model.
            DRESS.print(model);

            // Pass the model for further processing.
            return model;
        }).then(model => {
            // Print the performance result.            
            DRESS.print(model.validate(subjects));

            // Pass the model for further processing.
            return model;
        }).then(model => {
            // Print the AUC.
            DRESS.print(model.auc(subjects));

            // Print an empty string to end.
            return '';
        })
    );

});