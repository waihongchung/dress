function processJSON(subjects) {
    DRESS.print('<b>Pre-sort</b>');
    subjects.filter((_, index) => index < 10).map(subject => DRESS.print(
        'Age: ' + String(subject['Age']) +
        '	BMI: ' + String(subject['BMI']) +
        '	A1C: ' + String(subject['HA1C'])
    ));

    DRESS.print('<b>Sorting</b>');
    DRESS.print(
        DRESS.sort(subjects, ['Age', 'BMI', 'HA1C'], [false, false, true])

    );

    DRESS.print('<b>Post-sort</b>');
    subjects.filter((_, index) => index < 10).map(subject => DRESS.print(
        'Age: ' + String(subject['Age']) +
        '	BMI: ' + String(subject['BMI']) +
        '	A1C: ' + String(subject['HA1C'])
    ));
}

DRESS.local('data.json', processJSON);
