DRESS.local('data.json').then(subjects => {

    // Normalize    
    DRESS.print(
        '<b>Normalize</b>',
        DRESS.normalize(subjects, ['MELD', 'Labs.WBC', 'Labs.Platelet'])
    );

    // Standardize    
    DRESS.print(
        '<b>Standardize</b>',
        DRESS.standardize(subjects, ['Labs.AST', 'Labs.ALT', 'Labs.ALP'], ['Standardized.AST', 'Standardized.ALT', 'Standardized.ALP'])  // (and rename)
    );

    // Booleanize    
    DRESS.print(
        '<b>Booleanize</b>',
        DRESS.booleanize(subjects, ['Stage'], [4], ['Cirrhosis']),  // (and rename)
        DRESS.booleanize(subjects, ['Demographics.Gender'], ['M'], ['Male']) // (and rename)
    );

    // Categorize 
    DRESS.print(
        '<b>Categorize</b>',
        DRESS.categorize(subjects, ['Labs.Hemoglobin'], [12], ['Signs.Anemic']),  // (and rename)
        DRESS.categorize(subjects, ['Labs.Bilirubin'], [3, 6], ['Exams.Jaundice']),  // (and rename)
    );

    // Numericize    
    DRESS.print(
        '<b>Numericize</b>',
        DRESS.numericize(subjects, ['Exams.Varices'], ['none', 'small', 'large']),
        DRESS.numericize(subjects, ['Grade'], [[1], [2, 3], [4]], ['Severity'])  // (and rename)
    );

    // Group
    DRESS.print('<b>Group</b>');
    DRESS.group(subjects, 'Etiology', 'subjects').map(group => {
        DRESS.print(group['Etiology'] + ': ' + group['subjects'].length);
    });

    // Pluck
    DRESS.print('<b>Pluck</b>');
    let labs = DRESS.pluck(subjects, 'Labs', 'ID');
    let exams = DRESS.pluck(subjects, 'Exams', 'ID');
    DRESS.print(
        DRESS.summary(labs),
        DRESS.summary(exams)
    );

    // Rename
    DRESS.print(
        '<b>Rename</b>',
        DRESS.rename(labs, 'AST', 'LFT.AST'),
        DRESS.rename(labs, 'ALT', 'LFT.ALT'),
        DRESS.rename(labs, 'ALP', 'LFT.ALP'),
        DRESS.rename(labs, 'Bilirubin', 'LFT.Bili'),
        DRESS.rename(exams, 'BMI'), // (remove)
    );

    // Merge
    DRESS.print(
        '<b>Merge</b>',
        DRESS.summary(DRESS.merge('ID', labs, exams))
    );

    // OneHot
    DRESS.print(
        '<b>One-Hot Encoding</b>',
        DRESS.oneHot(exams, ['Ascites']),
        DRESS.summary(exams)
    );

    // HotOne
    DRESS.print(
        '<b>Hot-One Decoding</b>',
        DRESS.hotOne(exams, ['Ascites']),
        DRESS.summary(exams)
    );

});