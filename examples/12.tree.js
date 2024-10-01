DRESS.local('data.json').then(subjects => {

    // Split into trainings and validations
    const [trainings, validations] = DRESS.split(subjects);

    // Random Forest

    // Classification  
    let model = DRESS.randomForest(trainings, 'Etiology', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], true
    );
    DRESS.print(
        '<b>RandomForst - Classification</b>',
        model,
        model.validate(validations),
        model.auc(validations),
    );
   
    // Regression  
    model = DRESS.randomForest(trainings, 'MELD', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], false
    );
    DRESS.print(
        '<b>RandomForst - Regression</b>',
        model,
        model.validate(validations),
    );

    // Gradient Boosting

    // Classification  
    model = DRESS.gradientBoosting(trainings, 'Etiology', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], true
    );
    DRESS.print(
        '<b>Gradient Boosting - Classification</b>',
        model,
        model.validate(validations),
        model.auc(validations),
    );

    // Regression  
    model = DRESS.gradientBoosting(trainings, 'MELD', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], false
    );
    DRESS.print(
        '<b>Gradient Boosting - Regression</b>',
        model,
        model.validate(validations),
    );

});