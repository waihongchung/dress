function processCSV(csv) {
    var json = DRESS.fromCSV(csv);
    DRESS.parseArray(json, ['Comorbidities']);
    DRESS.save(json, 'data.json');
}

DRESS.local('data.csv', processCSV, false);