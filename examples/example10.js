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
    DRESS.output('<b>Sorting</b>'); 

    DRESS.output(
        DRESS.text(
            DRESS.sort(subjects, ['Age', 'BMI', 'HA1C'])
        )
    );
}
