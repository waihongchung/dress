function readCSV(input) {
    if (input.files && input.files.length) {
        var fileReader = new FileReader();
        fileReader.readAsBinaryString(input.files[0]);
        fileReader.onload = (event) => {
            processCSV(event.target.result);
        };
    }
}

function processCSV(csv) {
    var json = DRESS.fromCSV(csv);
    DRESS.parseArray(json, ['Comorbidities']);
    DRESS.download(json, 'data.json');
}