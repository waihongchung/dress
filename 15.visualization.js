function processJSON(subjects) {

    DRESS.print('<b>Histograms</b>');
    DRESS.print(DRESS.histograms(subjects, ['Age', 'BMI', 'Disease Duration', 'HA1C'], ['Gender', 'Race', 'Smoking', 'Alcohol', 'Etiology']));

    DRESS.print('<b>Correlation Heatmap</b>');
    DRESS.print(
        DRESS.heatmap(
            DRESS.correlations(subjects, ['Age', 'BMI', 'Disease Duration', 'HA1C', 'Scales.Nausea', 'Scales.Pain', 'Scales.QoL'])
        )
    );


}

DRESS.local('data.json', processJSON);
