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

    DRESS.output(
        DRESS.text(
            DRESS.correlations(subjects, ['Age', 'Disease Duration', 'BMI', 'HA1C', 'Scales.Nausea', 'Scales.Pain', 'Medications.PPI'])
        )
    );

}

