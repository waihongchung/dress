let data;

DRESS.local('data.json').then(subjects => {

    // Split into trainings and validations
    const [trainings, validations] = DRESS.split(subjects);

    // Linear
    const linear = DRESS.linear(trainings, 'MELD', ['Exams.BMI', 'Demographics.Age', 'Demographics.Barriers', 'Grade', 'Admissions',
        'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR']
    );
    DRESS.print(
        '<b>Linear - Regression</b>',
        linear,
        linear.validate(validations),
    );
    
    data = validations;

    DRESS.save(DRESS.deflate(linear), 'model.json');

});

DRESS.local('model.json').then(model => {

    model = DRESS.inflate(model);

    DRESS.print(
        model,
        model.validate(data),
    );

});