DRESS.local('data.json').then(subjects => {

    // Randomly select 20% of subjects as samples.
    const [controls, samples] = DRESS.split(subjects);

    DRESS.print('<b>Exact Matching</b>');
    DRESS.print(
        DRESS.means(samples, ['Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], DRESS.exact(samples, controls, ['Demographics.Age', 'Exams.BMI', 'MELD', 'Stage', 'Grade']))
    );
    //
    DRESS.print('<b>Propensity Score Matching</b>');
    DRESS.print(
        DRESS.means(samples, ['Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], DRESS.propensity(samples, controls, ['Demographics.Age', 'Exams.BMI', 'MELD', 'Stage', 'Grade'], ['Demographics.Ethnicity', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy']))
    );
    //
    DRESS.print('<b>Proximity Score Matching</b>');
    DRESS.print(
        DRESS.means(samples, ['Labs.WBC', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR'], DRESS.proximity(samples, controls, ['Demographics.Age', 'Exams.BMI', 'MELD', 'Stage', 'Grade'], ['Demographics.Ethnicity', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy']))
    );
});
