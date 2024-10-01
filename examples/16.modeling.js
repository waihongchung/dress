DRESS.local('data.json').then(subjects => {

    // Feature Importance
    const model = DRESS.gradientBoosting(subjects, 'MELD', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], false);
    DRESS.print(
        '<b>Feature Importance</b>',
        DRESS.importances(model, subjects)
    );

    // Cross Validation
    DRESS.print(
        '<b>Cross Validation</b>',
        DRESS.crossValidate(DRESS.gradientBoosting, subjects, [
            'MELD', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
            ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], false
        ])
    );

    // Hyperparameters
    DRESS.print(
        '<b>Hyperparameters</b>',
        DRESS.hyperparameters(
        {
            depth: 5,
            tree: 10,
            sampling: 0.5,
            learning: 0.2,
        },
        {
            depth: 15,
            tree: 160,
            sampling: 1,
            learning: 0.7,
        },
        'r2',
        DRESS.gradientBoosting, subjects, [
        'MELD', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], false
    ])
    );

});
