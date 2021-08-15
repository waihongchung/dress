function processJSON(subjects) {


    DRESS.print(DRESS.histograms(subjects, ['Age', 'BMI', 'Disease Duration', 'HA1C'], ['Gender', 'Race', 'Smoking', 'Alcohol', 'Etiology']));


}

DRESS.local('data.json', processJSON);
