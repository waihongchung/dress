DRESS.local('data.json').then(subjects => {

    // Define 'Male' as Gender = M.
    DRESS.booleanize(subjects, ['Demographics.Gender'], ['M'], ['Male']);
    // Define 'Advanced Fibrosis' as Stage = 3, 4.
    DRESS.booleanize(subjects, ['Stage'], [3, 4], ['Advanced Fibrosis']);
    // Define 'Obese' as BMI > 30.
    DRESS.categorize(subjects, ['Exams.BMI'], [30], ['Obese']);
    // Define 'Anemic' as Hemoglobin <= 13
    DRESS.categorize(subjects, ['Labs.Hemoglobin'], [13], ['Anemic'], true);  // Inverse    
    // Define 'Thrombocytopenia' as Platelet <= 150.
    DRESS.categorize(subjects, ['Labs.Platelet'], [150], ['Thrombocytopenic'], true);  // Inverse    
    // Define 'Jaundice' as Bilirubin > 3.
    DRESS.categorize(subjects, ['Labs.Bilirubin'], [2], ['Jaundice']);    
    // Define 'Ascites' or 'Varices' as NOT 'none'.
    DRESS.booleanize(subjects, ['Exams.Ascites', 'Exams.Varices'], ['none'], null, true);
    // Define 'Encephalopathy' as NOT 0 or 1.
    DRESS.booleanize(subjects, ['Exams.Encephalopathy'], [0, 1], null, true);

    // Odd Ratios
    DRESS.print(
        '<b>oddsRatios</b>',
        DRESS.oddsRatios(subjects, ['Advanced Fibrosis', 'Exams.Encephalopathy'], [
            'Obese', 'Male', 'Anemic', 'Thrombocytopenic', 'Jaundice',
            'Demographics.Barriers', 'Admissions', 'Exams.Ascites', 'Exams.Varices'
        ])
    );

    // Risk Ratios
    DRESS.print(
        '<br/>',
        '<b>riskRatios</b>',
        DRESS.riskRatios(subjects, ['Advanced Fibrosis', 'Exams.Encephalopathy'], [
            'Obese', 'Male', 'Anemic', 'Thrombocytopenic', 'Jaundice',
            'Demographics.Barriers', 'Admissions', 'Exams.Ascites', 'Exams.Varices'
        ])
    );

    // Correlations
    DRESS.print(
        '<br/>',
        '<b>Correlations</b>',
        DRESS.correlations(subjects, ['MELD', 'Grade', 'Stage', 'Admissions',
            'Demographics.Age', 'Demographics.Barriers', 'Exams.BMI',
            'Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'])
    );
});