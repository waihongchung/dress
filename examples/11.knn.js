DRESS.local('data.json').then(subjects => {

    // Split into trainings and validations
    const [trainings, validations] = DRESS.split(subjects);

    // Classification       
    let model = DRESS.kNN(trainings, 'Etiology', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], true
    );

    DRESS.print(
        '<b>Classification</b>',
        model,
        model.validate(validations),
        model.auc(validations),
    );
    
    // Regression        
    model = DRESS.kNN(trainings, 'MELD', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], false
    );

    DRESS.print(
        '<br/>',
        '<b>Regression</b>',
        model,
        model.validate(validations)
    );

});