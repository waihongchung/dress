DRESS.local('data.json').then(subjects => {

    // Histograms
    DRESS.print(
        '<b>Histograms</b>',
        DRESS.histograms(subjects, ['MELD', 'Demographics.Age', 'Exams.BMI',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'],
            ['Grade', 'Stage', 'Etiology', 'Demographics.Ethnicity', 'Demographics.Barriers', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'])
    );

    // Heatmap
    DRESS.print(
        '<br/>',
        '<b>Correlations</b>',
        DRESS.heatmap(
            DRESS.correlations(subjects, ['MELD', 'Grade', 'Stage', 'Admissions',
                'Demographics.Age', 'Demographics.Barriers', 'Exams.BMI',
                'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
        )
    );

    // Comparative Heatmap
    let males = subjects.filter(subject => subject.Demographics.Gender == 'M');
    let females = subjects.filter(subject => subject.Demographics.Gender != 'M');

    DRESS.print(
        '<br/>',
        '<b>Correlations - Males vs Females</b>',
        DRESS.heatmap(
            DRESS.correlations(males, ['MELD', 'Grade', 'Stage', 'Admissions',
                'Demographics.Age', 'Demographics.Barriers', 'Exams.BMI',
                'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR']),
            DRESS.correlations(females, ['MELD', 'Grade', 'Stage', 'Admissions',
                'Demographics.Age', 'Demographics.Barriers', 'Exams.BMI',
                'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
        )
    );

});