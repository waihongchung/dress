function processJSON(subjects) {

    // Randomly select 20% of subjects as samples.
    var samples = [];
    var controls = [];
    subjects.filter(subject => {
        if (Math.random() < 0.2) {
            samples.push(subject);
        } else {
            controls.push(subject);
        }
    });

    DRESS.print('<b>Exact Matching</b>');
    DRESS.print(
        DRESS.means(samples, ['Age', 'BMI', 'Disease Duration'], DRESS.exact(samples, controls, ['BMI', 'Disease Duration']))
    );
    //
    DRESS.print('<b>Propensity Score Matching</b>');
    DRESS.print(
        DRESS.means(samples, ['Age', 'BMI', 'Disease Duration'], DRESS.propensity(samples, controls, ['BMI', 'Disease Duration']))
    );
}

DRESS.local('data.json', processJSON);