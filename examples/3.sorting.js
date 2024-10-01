DRESS.local('data.json').then(subjects => {

    let synopsis = (subjects) => {
        subjects.forEach((subject, index) => {
            if (index % 1500 < 11) {
                DRESS.print(
                    '[' + index + ']' + '	MELD: ' + subject.MELD + '	Exams.BMI: ' + subject.Exams.BMI + '	Admissions: ' + subject.Admissions.length
                );
            }
        });
    };

    DRESS.print('<b>Original</b>');
    synopsis(subjects);
    //
    DRESS.print(
        '<b>Sort: MELD (asc)</b>',
        DRESS.sort(subjects, ['MELD'])
    );
    synopsis(subjects);
    //
    DRESS.print(
        '<br/>',
        '<b>Sort: MELD (asc), Exams.BMI (desc)</b>',
        DRESS.sort(subjects, ['MELD', 'Exams.BMI'], [false, true])
    );
    synopsis(subjects);
    //
    DRESS.print(
        '<br/>',
        '<b>Sort: MELD (asc), Exams.BMI (desc), Admissions (desc)</b>',
        DRESS.sort(subjects, ['Age', 'Exams.BMI', 'Admissions'], [false, true, true])
    );
    synopsis(subjects);

});