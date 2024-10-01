DRESS.local('data.json').then(subjects => {

    // Population descriptive statistics.    
    DRESS.print(
        '<b>All Subjects</b>',
        DRESS.means(subjects, ['MELD', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR']),
        DRESS.medians(subjects, ['Demographics.Age', 'Exams.BMI',]),
        DRESS.proportions(subjects, ['Admissions', 'Demographics.Barriers']),
        DRESS.frequencies(subjects, ['Etiology', 'Grade', 'Stage', 'Demographics.Ethnicity', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'])
    );

    // Comparative descriptive statistics.    
    let males = subjects.filter(subject => subject.Demographics.Gender == 'M');
    let females = subjects.filter(subject => subject.Demographics.Gender != 'M');
    DRESS.print(
        '<br/>',
        '<b>Male vs Female</b>',
        DRESS.means(males, ['MELD', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], females),
        DRESS.medians(males, ['Demographics.Age', 'Exams.BMI',], females),
        DRESS.proportions(males, ['Admissions', 'Demographics.Barriers'], females),
        DRESS.frequencies(males, ['Etiology', 'Grade', 'Stage', 'Demographics.Ethnicity', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], females)
    );

    // Comparative descriptive statistics.    
    let stage1_2 = subjects.filter(subject => subject.Stage <= 2);
    let stage3_4 = subjects.filter(subject => subject.Stage > 2);
    DRESS.print(
        '<br/>',
        '<b>Stage 1-2 vs Stage 3-4</b>',
        DRESS.means(stage1_2, ['MELD', 'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], stage3_4),
        DRESS.medians(stage1_2, ['Demographics.Age', 'Exams.BMI',], stage3_4),
        DRESS.proportions(stage1_2, ['Admissions', 'Demographics.Barriers'], stage3_4),
        DRESS.frequencies(stage1_2, ['Etiology', 'Grade', 'Demographics.Ethnicity', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy'], stage3_4)
    );

});