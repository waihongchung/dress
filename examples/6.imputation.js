DRESS.local('data.json').then(subjects => {

    // Randomly set 10% of values as null
    let nullify = (subjects) => {
        subjects.forEach(subject => {
            if (Math.random() < 0.1) {
                subject.MELD = null;
            }
            if (Math.random() < 0.1) {
                subject.Demographics.Age = null;
            }
            if (Math.random() < 0.1) {
                subject.Demographics.Ethnicity = null;
            }
            if (Math.random() < 0.1) {
                subject.Demographics.Barriers = null;
            }
        });
    };

    nullify(subjects);
    DRESS.print(
        '<b>Mean Mode Imputation</b>',
        DRESS.meanMode(subjects, ['MELD', 'Demographics.Age', 'Labs.ALT'], ['Exams.Ascites', 'Demographics.Ethnicity', 'Demographics.Barriers'])
    );

    nullify(subjects);
    DRESS.print(
        '<br/>',
        '<b>LOCF Imputation</b>',
        DRESS.locf(subjects, ['MELD', 'Demographics.Age', 'Labs.ALT', 'Exams.Ascites', 'Demographics.Ethnicity', 'Demographics.Barriers'])
    );

    //
    DRESS.print(
        '<br/>',
        '<b>Nullify</b>',
        DRESS.nullify(subjects, ['Demographics.Ethnicity'], ['asian', 'other']),
        DRESS.summary(subjects)
    );

    DRESS.print(
        '<br/>',
        '<b>Denullify</b>',
        DRESS.denullify(subjects, ['Demographics.Ethnicity']),
        DRESS.summary(subjects)
    );


    // Randomly setting 10% of datapoints as null;    
    subjects.forEach(subject => {
        if (Math.random() < 0.1) {
            subject.Actual_MELD = subject.MELD;
            subject.MELD = null;
        }
        //        
        if (Math.random() < 0.1) {
            subject.Actual_Grade = subject.Grade;
            subject.Grade = null;
        }
        //        
        if (Math.random() < 0.1) {
            subject.Actual_Etiology = subject.Etiology;
            subject.Etiology = null;
        }
        //    
        if (Math.random() < 0.1) {
            subject.Demographics.Actual_Barriers = subject.Demographics.Barriers;
            subject.Demographics.Barriers = null;
        }
    });

    let imputations = DRESS.nearestNeighbor(subjects, ['MELD', 'Grade', 'Demographics.Age', 'Exams.BMI', 'Labs.AST', 'Labs.ALT', 'Labs.ALP', 'Labs.Bilirubin', 'Labs.INR', 'Labs.Hemoglobin', 'Labs.MCV', 'Labs.Platelet'],
        ['Etiology', 'Stage', 'Demographics.Barriers', 'Demographics.Ethnicity', 'Demographics.Gender', 'Exams.Ascites', 'Exams.Varices', 'Exams.Encephalopathy']);
    DRESS.print(
        '<br/>',
        '<b>Nearest Neighbor Imputation</b>',
        imputations
    );

    DRESS.print('<p><pre>MELD Accuracy: ' + DRESS.clamp(subjects.filter(subject => typeof subject.Actual_MELD !== 'undefined' && Math.round(subject.MELD) == subject.Actual_MELD).length / imputations.find(feature => feature.feature == 'MELD').count * 100) + '%</pre></p>');
    DRESS.print('<p><pre>Grade Accuracy: ' + DRESS.clamp(subjects.filter(subject => typeof subject.Actual_Grade !== 'undefined' && Math.round(subject.Grade) == subject.Actual_Grade).length / imputations.find(feature => feature.feature == 'Grade').count * 100) + '%</pre></p>');
    DRESS.print('<p><pre>Etiology Accuracy: ' + DRESS.clamp(subjects.filter(subject => typeof subject.Actual_Etiology !== 'undefined' && subject.Etiology == subject.Actual_Etiology).length / imputations.find(feature => feature.feature == 'Etiology').count * 100) + '%</pre></p>');
    DRESS.print('<p><pre>Demographics.Barriers Accuracy: ' + DRESS.clamp(subjects.filter(subject => typeof subject.Demographics.Actual_Barriers !== 'undefined' && subject.Demographics.Barriers.join() == subject.Demographics.Actual_Barriers.join()).length / imputations.find(feature => feature.feature == 'Demographics.Barriers').count * 100) + '%</pre></p>');

});
