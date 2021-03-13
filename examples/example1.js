function readJSON(input) {
    if (input.files && input.files.length) {
        var fileReader = new FileReader();
        fileReader.readAsBinaryString(input.files[0]);
        fileReader.onload = (event) => {
            processJSON(JSON.parse(event.target.result));
        };
    }
}

function processJSON(subjects) {
    // Output population descriptive statistics.
    DRESS.output('<b>All Subjects</b>');
    DRESS.output(
        DRESS.text(
            DRESS.means(subjects, ['Age', 'BMI', 'Disease Duration', 'HA1C', 'Nausea', 'Pain', 'QoL'])
        ) +
        DRESS.text(
            DRESS.proportions(subjects, ['EGD', 'Metoclopramide', 'Erythromycin'])
        ) +
        DRESS.text(
            DRESS.frequencies(subjects, ['Gender', 'Race', 'Smoking', 'Alcohol', 'Etiology', 'Comorbidities'])
        )
    );

    // Stratify population into two groups by gender.
    var males = subjects.filter(subject => subject['Gender'] === 'M');
    var females = subjects.filter(subject => subject['Gender'] !== 'M');
    DRESS.output('<b>Male vs Female</b>');
    DRESS.output(
        DRESS.text(
            DRESS.means(males, ['Age', 'BMI', 'Disease Duration', 'HA1C', 'Nausea', 'Pain', 'QoL'], females)
        ) +
        DRESS.text(
            DRESS.proportions(males, ['EGD', 'Metoclopramide', 'Erythromycin'], females)
        ) +
        DRESS.text(
            DRESS.frequencies(males, ['Race', 'Smoking', 'Alcohol', 'Etiology', 'Comorbidities'], females)
        )
    );

}