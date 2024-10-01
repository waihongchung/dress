DRESS.local('data.json').then(subjects => {

    // Randomly set 10% of values as outliers
    subjects.forEach(subject => {
        if (Math.random() < 0.1) {
            subject.MELD *= Math.random() < 0.5 ? 10 : 0.01;
        }
        if (Math.random() < 0.1) {
            subject.Exams.BMI *= Math.random() < 0.5 ? 10 : 0.01;
        }
        if (Math.random() < 0.1) {
            subject.Labs.WBC *= Math.random() < 0.5 ? 10 : 0.01;
        }
        if (Math.random() < 0.1) {
            subject.Labs.AST *= Math.random() < 0.5 ? 10 : 0.01;
        }
        if (Math.random() < 0.1) {
            subject.Demographics.Age *= Math.random() < 0.5 ? 10 : 0.01;
        }
    });

    // Identify outliers using Boxplot
    DRESS.print(
        '<b>Boxplot</b>',
        DRESS.boxplot(subjects, ['MELD', 'Exams.BMI', 'Labs.WBC', 'Labs.AST', 'Demographics.Age'])
    );

    // Identify outliers using Grubbs algorithm
    DRESS.print(
        '<br/>',
        '<b>Grubbs</b>',
        DRESS.grubbs(subjects, ['MELD', 'Exams.BMI', 'Labs.WBC', 'Labs.AST', 'Demographics.Age'])
    );
});