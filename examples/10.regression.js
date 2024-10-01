DRESS.local('data.json').then(subjects => {

    // Define 'Advanced Fibrosis' as Stage = 3, 4.
    DRESS.booleanize(subjects, ['Stage'], [3, 4], ['Advanced Fibrosis']);
    // Define 'Ascites' or 'Varices' as NOT 'none'.
    DRESS.booleanize(subjects, ['Exams.Ascites', 'Exams.Varices'], ['none'], null, true);
    // Define 'Encephalopathy' as NOT 0 or 1.
    DRESS.booleanize(subjects, ['Exams.Encephalopathy'], [0, 1], null, true);
    // Define 'Decompensated' as the presence of either 'Ascites' or 'Varices or 'Encephalopathy or prior hospital admissions.
    subjects.forEach(subject => subject.Decompensated = subject.Exams.Ascites || subject.Exams.Varices || subject.Exams.Encephalopathy || (subject.Admissions.length > 0));

    // Collinearity
    DRESS.print(
        '<b>Multicollinearity</b>',
        DRESS.collinearity(subjects, ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );

    // Split into trainings and validations
    const [trainings, validations] = DRESS.split(subjects);

    // Randomize the subjects and divide into batches    
    let batches = (new Array(10)).fill(null).map(() => []);
    trainings.sort(() => Math.random() - 0.5).forEach((subject, i) => batches[i % batches.length].push(subject));

    // Multiple Logistic Regression
    let model = DRESS.logistic(trainings, ['Advanced Fibrosis', 'Decompensated'], ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
        'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR']);
    DRESS.print(
        '<br/>',
        '<b>Multiple Logistic Regression</b>',
        model,
        model.validate(validations),
    );

    // Multiple Logistic Regression (Batch)
    model = DRESS.logistic([], ['Advanced Fibrosis', 'Decompensated'], ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
        'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], { learning: 0.25, iteration: 1 });

    for (let i = 0; i < 4; i++) {
        batches.forEach(batch => model.train(batch));
    }

    DRESS.print(
        '<br/>',
        '<b>Multiple Logistic Regression (Batched)</b>',
        model,
        model.validate(validations)
    );

    // Polytomous Regression
    model = DRESS.polytomous(trainings, 'Etiology', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
        'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR']);
    DRESS.print(
        '<br/>',
        '<b>Polytomous Regression</b>',
        model,
        model.validate(validations),
    );

    // Polytomous Regression (Batch)
    model = DRESS.polytomous([], 'Etiology', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
        'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], { learning: 0.25, iteration: 1 });

    for (let i = 0; i < 4; i++) {
        batches.forEach(batch => model.train(batch));
    }

    DRESS.print(
        '<br/>',
        '<b>Polytomous Regression (Batched)</b>',
        model,
        model.validate(validations)
    );

    // Multiple Linear Regression
    model = DRESS.linear(trainings, 'MELD', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
        'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR']);
    DRESS.print(
        '<br/>',
        '<b>Multiple Linear Regression</b>',
        model,
        model.validate(validations),
    );

    // Linear Regression (Batch)
    model = DRESS.linear([], 'MELD', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
        'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], { learning: 0.25, iteration: 1 });

    for (let i = 0; i < 4; i++) {
        batches.forEach(batch => model.train(batch));
    }

    DRESS.print(
        '<br/>',
        '<b>Multiple Linear Regression (Batched)</b>',
        model,
        model.validate(validations)
    );

    // Forward Feature Selection
    DRESS.print(
        '<br/>',
        '<b>Forward Feature Selection</b>',
        DRESS.forward(DRESS.linear, subjects, 'MELD', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );

    // Backward Feature Selection
    DRESS.print(
        '<br/>',
        '<b>Backward Feature Selection</b>',
        DRESS.backward(DRESS.linear, subjects, 'MELD', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );

}); 