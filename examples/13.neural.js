DRESS.local('data.json').then(subjects => {

    // Split into trainings and validations
    const [trainings, validations] = DRESS.split(subjects);

    // Multilayer Perceptron

    // Classification  
    let model = DRESS.multilayerPerceptron(trainings, 'Etiology', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'], true);
    DRESS.print(
        '<b>Multilayer Perceptron - Classification</b>',
        model,
        model.validate(validations),
    );

    // Regression  
    model = DRESS.multilayerPerceptron(trainings, 'MELD', ['Grade', 'Stage', 'Admissions', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'], false);
    DRESS.print(
        '<b>Multilayer Perceptron - Regression</b>',
        model,
        model.validate(validations),
    );

});