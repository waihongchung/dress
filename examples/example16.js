function processJSON(subjects) {

    DRESS.print(
        DRESS.means(subjects, ['BMI']),
        DRESS.normalities(subjects, ['BMI']),
        DRESS.histograms(subjects, ['BMI'])
    );

    DRESS.print(DRESS.johnson(subjects, ['BMI'], ['sBMI']));

    DRESS.print(
        DRESS.means(subjects, ['sBMI']),
        DRESS.normalities(subjects, ['sBMI']),
        DRESS.histograms(subjects, ['sBMI'])
    );

}

DRESS.local('data.json', processJSON);
