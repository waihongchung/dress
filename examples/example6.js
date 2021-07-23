function processJSON(subjects) {

    // Randomly create 10 outliers.
    const len = subjects.length;
    let i = 10;
    while (i--) {
        subjects[Math.floor(Math.random() * len)]['Age'] = +subjects[Math.floor(Math.random() * len)]['Age'] * 3.5;
        subjects[Math.floor(Math.random() * len)]['BMI'] = +subjects[Math.floor(Math.random() * len)]['BMI'] * 3;
        subjects[Math.floor(Math.random() * len)]['HA1C'] = +subjects[Math.floor(Math.random() * len)]['HA1C'] * 2.5;
        subjects[Math.floor(Math.random() * len)]['Scales']['QoL'] = +subjects[Math.floor(Math.random() * len)]['Scales']['QoL'] * 2;
    }

    DRESS.print('<b>Boxplot</b>');
    DRESS.print(
        DRESS.boxplot(subjects, ['Age', 'BMI', 'HA1C', 'Scales.QoL'], false)
    );

    DRESS.print('<b>Grubbs</b>');
    DRESS.print(
        DRESS.grubbs(subjects, ['Age', 'BMI', 'HA1C', 'Scales.QoL'], true)
    );

}

DRESS.local('data.json', processJSON);