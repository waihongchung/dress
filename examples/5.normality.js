DRESS.local('data.json').then(subjects => {    

    // Original
    DRESS.print(
        '<b>Shapiro-Wilk Test</b>',
        DRESS.shapiro(subjects, ['Demographics.Age', 'Exams.BMI', 'Labs.WBC', 'Labs.Platelet', 'Labs.INR', 'Labs.ALP'])
    );

    DRESS.print(        
        '<b>d\'Agostino-Pearson Test</b>',
        DRESS.dagostino(subjects, ['Demographics.Age', 'Exams.BMI', 'Labs.WBC', 'Labs.Platelet', 'Labs.INR', 'Labs.ALP'])
    );

    // Box-Cox Power Transformation
    DRESS.print(
        '<br/>',
        '<b>Box-Cox Power Transformation</b>',
        DRESS.boxcox(subjects,
            ['Demographics.Age', 'Exams.BMI', 'Labs.WBC', 'Labs.Platelet', 'Labs.INR', 'Labs.ALP'],
            ['BoxCox.Demographics.Age', 'BoxCox.Exams.BMI', 'BoxCox.Labs.WBC', 'BoxCox.Labs.Platelet', 'BoxCox.Labs.INR', 'BoxCox.Labs.ALP']
        )
    );

    DRESS.print(
        '<br/>',
        '<b>Shapiro-Wilk Test</b>',
        DRESS.shapiro(subjects, ['BoxCox.Demographics.Age', 'BoxCox.Exams.BMI', 'BoxCox.Labs.WBC', 'BoxCox.Labs.Platelet', 'BoxCox.Labs.INR', 'BoxCox.Labs.ALP'])
    );

    DRESS.print(        
        '<b>d\'Agostino-Pearson Test</b>',
        DRESS.dagostino(subjects, ['BoxCox.Demographics.Age', 'BoxCox.Exams.BMI', 'BoxCox.Labs.WBC', 'BoxCox.Labs.Platelet', 'BoxCox.Labs.INR', 'BoxCox.Labs.ALP'])
    );

    // Yeo-Johnson Power Transformation
    DRESS.print(
        '<br/>',
        '<b>Yeo-Johnson Power Transformation</b>',
        DRESS.johnson(subjects,
            ['Demographics.Age', 'Exams.BMI', 'Labs.WBC', 'Labs.Platelet', 'Labs.INR', 'Labs.ALP'],
            ['Johnson.Demographics.Age', 'Johnson.Exams.BMI', 'Johnson.Labs.WBC', 'Johnson.Labs.Platelet', 'Johnson.Labs.INR', 'Johnson.Labs.ALP']
        )
    );

    DRESS.print(
        '<br/>',
        '<b>Shapiro-Wilk Test</b>',
        DRESS.shapiro(subjects, ['Johnson.Demographics.Age', 'Johnson.Exams.BMI', 'Johnson.Labs.WBC', 'Johnson.Labs.Platelet', 'Johnson.Labs.INR', 'Johnson.Labs.ALP'])
    );

    DRESS.print(        
        '<b>d\'Agostino-Pearson Test</b>',
        DRESS.dagostino(subjects, ['Johnson.Demographics.Age', 'Johnson.Exams.BMI', 'Johnson.Labs.WBC', 'Johnson.Labs.Platelet', 'Johnson.Labs.INR', 'Johnson.Labs.ALP'])
    );

}); 