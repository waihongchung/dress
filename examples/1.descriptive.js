function processJSON(subjects) {
    // Output population descriptive statistics.
    DRESS.print('<b>All Subjects</b>');
    DRESS.print(
        DRESS.means(subjects, ['Age', 'BMI', 'Disease Duration', 'HA1C']),
        DRESS.medians(subjects, ['Scales.Nausea', 'Scales.Pain', 'Scales.QoL']),
        DRESS.proportions(subjects, ['EGD', 'Medications.PPI', 'Medications.Metoclopramide', 'Medications.Erythromycin']),
        DRESS.frequencies(subjects, ['Gender', 'Race', 'Smoking', 'Alcohol', 'Etiology', 'Comorbidities'])
    );

    // Stratify population into two groups by gender.
    var males = subjects.filter(subject => subject['Gender'] === 'M');
    var females = subjects.filter(subject => subject['Gender'] !== 'M');

    DRESS.print('<b>Male vs Female</b>');
    DRESS.print(
        DRESS.means(males, ['Age', 'BMI', 'Disease Duration', 'HA1C'], females),
        DRESS.medians(males, ['Scales.Nausea', 'Scales.Pain', 'Scales.QoL'], females),
        DRESS.proportions(males, ['EGD', 'Medications.PPI', 'Medications.Metoclopramide', 'Medications.Erythromycin'], females),
        DRESS.frequencies(males, ['Race', 'Smoking', 'Alcohol', 'Etiology', 'Comorbidities'], females),
    );
}

DRESS.local('data.json', processJSON);