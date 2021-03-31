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

    const len = subjects.length;
    let i = 10;
    while (i--) {
        subjects[Math.floor(Math.random() * len)]['Age'] = +subjects[Math.floor(Math.random() * len)]['Age'] + Math.random() * 50;
        subjects[Math.floor(Math.random() * len)]['BMI'] = +subjects[Math.floor(Math.random() * len)]['BMI'] + Math.random() * 50;
        subjects[Math.floor(Math.random() * len)]['HA1C'] = +subjects[Math.floor(Math.random() * len)]['HA1C'] + Math.random() * 50;
        subjects[Math.floor(Math.random() * len)]['Scales']['QoL'] = +subjects[Math.floor(Math.random() * len)]['Scales']['QoL'] + Math.random() * 50;
    }

    DRESS.output(
        DRESS.text(
            DRESS.boxplot(subjects, ['Age', 'BMI', 'HA1C', 'Scales.QoL'], false)
        ) +
        DRESS.text(
            DRESS.grubbs(subjects, ['Age', 'BMI', 'HA1C', 'Scales.QoL'], true)
        )
    );

}