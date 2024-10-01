DRESS.local('data.json').then(subjects => {

    // Define 'Advanced Fibrosis' as Stage = 3, 4.
    DRESS.booleanize(subjects, ['Stage'], [3, 4], ['Advanced Fibrosis']);
    // Convert 'Ascites' and 'Varices' into a numerical scale.
    DRESS.numericize(subjects, ['Exams.Ascites', 'Exams.Varices'], ['none', 'small', 'large'], null);
    // Define 'Encephalopathy' as NOT 0 or 1.
    DRESS.booleanize(subjects, ['Exams.Encephalopathy'], [0, 1], null, true);

    // ROC    
    DRESS.print(
        '<b>ROC</b>',
        DRESS.roc(subjects, ['Advanced Fibrosis', 'Exams.Encephalopathy'], ['Exams.BMI', 'Exams.Ascites', 'Exams.Varices', 'Demographics.Age', 'Demographics.Barriers', 'MELD', 'Grade', 'Admissions',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );

    // PR    
    DRESS.print(
        '<br/>',
        '<b>PR</b>',
        DRESS.pr(subjects, ['Advanced Fibrosis', 'Exams.Encephalopathy'], ['Exams.BMI', 'Exams.Ascites', 'Exams.Varices', 'Demographics.Age', 'Demographics.Barriers', 'MELD', 'Grade', 'Admissions',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );
});