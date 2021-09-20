function processJSON(subjects) {

    DRESS.print(
        '<b>Cross Validation</b>',
        DRESS.crossValidate(DRESS.kNN, subjects, [['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol', 'Etiology']], ['HA1C', false, 3])
    );

    const model = DRESS.kNN(subjects, ['Age', 'BMI', 'Scales.QoL', 'Comorbidities'], ['Gender', 'Smoking', 'Alcohol', 'Etiology']);

    DRESS.print(
        '<b>Feature Importance</b>',
        DRESS.importance(model, subjects, 'HA1C', false, 3)
    )

}

DRESS.local('data.json', processJSON);
