var DRESS;
(function (DRESS) {
    /**
     * @ignore
     */
    let layer = (size, pSize, g) => ({
        W: (new Array(size)).fill(null).map(_ => (new Array(pSize)).fill(null).map(_ => activators[g][2](pSize, size))),
        mW: (new Array(size)).fill(null).map(_ => (new Array(pSize)).fill(0)),
        vW: (new Array(size)).fill(null).map(_ => (new Array(pSize)).fill(0)),
        B: (new Array(size)).fill(0),
        mB: (new Array(size)).fill(0),
        vB: (new Array(size)).fill(0),
        Z: new Array(size),
        pA: null,
        dA: new Array(pSize),
        size,
        pSize,
        g
    });
    /**
     * @ignore
     */
    let forward = (layer, pA) => {
        layer.pA = pA;
        //                
        let row = layer.size;
        while (row--) {
            let WpA = 0;
            let col = layer.pSize;
            while (col--) {
                WpA += layer.W[row][col] * pA[col];
            }
            // Z = WpA + B
            layer.Z[row] = WpA + layer.B[row];
        }
        return activators[layer.g][0](layer.Z);
    };
    /**
     * @ignore
     */
    let backward = (layer, pdA, alpha, beta1, beta2, beta1epoch, beta2epoch) => {
        const beta1_1 = 1 - beta1;
        const beta2_1 = 1 - beta2;
        const dZ = activators[layer.g][1](layer.Z);
        layer.dA.fill(0);
        let row = layer.size;
        while (row--) {
            const Wr = layer.W[row];
            const mWr = layer.mW[row];
            const vWr = layer.vW[row];
            const dZr = dZ[row] * pdA[row];
            let col = layer.pSize;
            while (col--) {
                // dA = W . dZ
                layer.dA[col] += Wr[col] * dZr;
                // dW = dZ * pA
                const dW = dZr * layer.pA[col];
                // W -= ALPHA * dW
                mWr[col] = beta1_1 * dW + beta1 * mWr[col];
                vWr[col] = beta2_1 * dW * dW + beta2 * vWr[col];
                Wr[col] -= mWr[col] / beta1epoch * alpha / (Math.sqrt(vWr[col] / beta2epoch) + 0.00000001);
            }
            // B -= ALPHA * dZ
            layer.mB[row] = beta1_1 * dZr + beta1 * layer.mB[row];
            layer.vB[row] = beta2_1 * dZr * dZr + beta2 * layer.vB[row];
            layer.B[row] -= layer.mB[row] / beta1epoch * alpha / (Math.sqrt(layer.vB[row] / beta2epoch) + 0.00000001);
        }
        return layer.dA;
    };
    /**
     * @ignore
     */
    let sigmoid = [
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = 1 / (1 + Math.exp(-values[i]));
            }
            return values;
        },
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = 1 / (1 + Math.exp(-values[i]));
                values[i] *= (1 - values[i]);
            }
            return values;
        },
        (fin, fout) => (DRESS.random() - 0.5) * 2 * Math.sqrt(6 / (fin + fout))
    ];
    /**
     * @ignore
     */
    let tanh = [
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = Math.tanh(values[i]);
            }
            return values;
        },
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = Math.tanh(values[i]);
                values[i] = (1 - values[i] * values[i]);
            }
            return values;
        },
        (fin, fout) => (DRESS.random() - 0.5) * 2 * Math.sqrt(6 / (fin + fout))
    ];
    /**
     * @ignore
     */
    let relu = [
        (values) => {
            let i = values.length;
            while (i--) {
                if (values[i] <= 0) {
                    values[i] = 0;
                }
            }
            return values;
        },
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = (values[i] > 0) ? 1 : 0;
            }
            return values;
        },
        (fin, fout) => (DRESS.random() - 0.5) * 2 * Math.sqrt(6 / fin)
    ];
    /**
     * @ignore
     */
    let leaky = [
        (values) => {
            let i = values.length;
            while (i--) {
                if (values[i] <= 0) {
                    values[i] *= 0.001;
                }
            }
            return values;
        },
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = (values[i] > 0) ? 1 : 0.001;
            }
            return values;
        },
        (fin, fout) => (DRESS.random() - 0.5) * 2 * Math.sqrt(6 / fin)
    ];
    /**
     * @ignore
     */
    let linear = [
        (values) => values,
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = 1;
            }
            return values;
        },
        (fin, fout) => (DRESS.random() - 0.5) * 2
    ];
    /**
     * @ignore
     */
    let softmax = [
        (values) => {
            let max = Number.NEGATIVE_INFINITY;
            let i = values.length;
            while (i--) {
                if (values[i] > max) {
                    max = values[i];
                }
            }
            i = values.length;
            let sum = 0;
            while (i--) {
                values[i] = Math.exp(values[i] - max);
                sum += values[i];
            }
            i = values.length;
            while (i--) {
                values[i] /= sum;
            }
            return values;
        },
        (values) => {
            let i = values.length;
            while (i--) {
                values[i] = 1;
            }
            return values;
        },
        (fin, fout) => (DRESS.random() - 0.5) * 2
    ];
    const activators = [
        relu,
        leaky,
        sigmoid,
        tanh,
        linear,
        softmax
    ];
    /**
     * @summary Build a Multilayer Perceptron.
     *
     * @description This method builds a basic feedforward artificial neural network, also known as a multilayer perceptron. It can be used for either classification or regression purposes.
     * The netowork is trained on the specified subjects and the specified numerical features. Each feature/outcome should be a property of the subject or is accessible using the dot notation.
     * If a feature/outcome is an array, then the length of the array is used for computation.
     *
     * The neural network uses the ADAM optimizer and supports the following activation functions in the hidden layers: relu, leaky relu, sigmoid, tanh, and linear.
     * By default, the network contains one input layer (the size of which is the same as the number of features), one output layer (the size of which is dependent on the number of classes in a classification model, or 1 in a regression model).
     * The network also contains two hidden layers (the size of which are set heuristically based on the number of features and output). The layout of the hidden layers can be set as a numerical array in the hyperparameter.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} features - An array of features to be used as classifiers/regressors.
     * @param {boolean} [classification=true] - Model type. Default to classification. Set to false to build a regression model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included alpha, beta1, beta2, layout, activator, and epoch.
     * @returns A multilayer preceptron containing the following properties:
     *   seed (the random generate seed value),
     *   outcome (the outcome of the model),
     *   features (the features used to create the model),
     *   layers (an array of layers of neurons),
     *   classes (a list of distinct classes, only available in a classification model),
     *   text.
     *   predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   roc (a method for creating an ROC curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   performance (a method for evaluting the performance of the mode, accepts an array of subjects as a parameter).
     */
    DRESS.neuralNetwork = (subjects, outcome, features, classification = true, hyperparameters = {}) => {
        const alpha = hyperparameters.alpha || 0.01;
        const beta1 = hyperparameters.beta1 || 0.8;
        const beta2 = hyperparameters.beta2 || 0.99;
        const layout = hyperparameters.layout || [];
        const activator = hyperparameters.activator || 1 /* LEAKY */;
        const epoch = Math.round(hyperparameters.epoch) || 2500;
        let seed;
        let layers;
        let classes;
        if (Array.isArray(subjects)) {
            seed = DRESS.SEED;
            const numSubject = subjects.length;
            const numFeature = features.length;
            const X = new Array(numSubject);
            const Y = new Array(numSubject);
            classes = [];
            if (classification) {
                let i = numSubject;
                while (i--) {
                    const value = DRESS.categoric(DRESS.get(subjects[i], outcome));
                    let cls = classes.indexOf(value);
                    if (cls === -1) {
                        cls = classes.push(value) - 1;
                    }
                    X[i] = features.map(feature => DRESS.numeric(DRESS.get(subjects[i], feature)));
                    Y[i] = cls;
                }
            }
            else {
                let i = numSubject;
                while (i--) {
                    X[i] = features.map(feature => DRESS.numeric(DRESS.get(subjects[i], feature)));
                    Y[i] = DRESS.numeric(DRESS.get(subjects[i], outcome));
                }
            }
            if (layout.length === 0) {
                layout.push(Math.ceil((numFeature + classes.length) / 2) + 1, Math.ceil(Math.sqrt(numFeature + classes.length)) + 1);
            }
            let pSize = numFeature;
            layers = layout.map(size => {
                const l = layer(size, pSize, activator);
                pSize = size;
                return l;
            });
            if (classification) {
                layers.push(layer(classes.length, pSize, 5 /* SOFTMAX */));
            }
            else {
                layers.push(layer(1, pSize, 4 /* LINEAR */));
            }
            const numLayer = layers.length;
            let e = 0;
            while (e++ < epoch) {
                const beta1epoch = 1 - (Math.pow(beta1, e));
                const beta2epoch = 1 - (Math.pow(beta2, e));
                let i = numSubject;
                while (i--) {
                    let pA = X[i];
                    let l = 0;
                    while (l < numLayer) {
                        pA = forward(layers[l++], pA);
                    }
                    let j = pA.length;
                    const temp = new Array(j);
                    if (classification) {
                        while (j--) {
                            temp[j] = pA[j] - ((Y[i] === j) ? 1 : 0);
                        }
                    }
                    else {
                        while (j--) {
                            temp[j] = pA[j] - Y[i];
                        }
                    }
                    pA = temp;
                    while (l--) {
                        pA = backward(layers[l], pA, alpha, beta1, beta2, beta1epoch, beta2epoch);
                    }
                }
            }
        }
        else {
            seed = subjects['seed'] || 0;
            outcome = subjects['outcome'] || '';
            features = subjects['features'] || [];
            layers = subjects['layers'] || [];
            classes = subjects['classes'] || [];
        }
        return {
            seed,
            outcome,
            features,
            layers,
            classes,
            text: '[' + outcome + '] seed: ' + seed,
            predict(subject) {
                const pA = this.layers.reduce((pA, layer) => forward(layer, pA), features.map(feature => DRESS.numeric(DRESS.get(subject, feature))));
                if (this.classes.length) {
                    return this.classes[pA.map((value, index) => [value, index]).sort((a, b) => a[0] - b[0]).pop()[1]];
                }
                return pA[0];
            },
            roc(subjects, roc = DRESS.roc) {
                if (this.classes.length) {
                    const numSubject = subjects.length;
                    const expectations = new Array(numSubject);
                    const pAs = new Array(numSubject);
                    subjects.map((subject, index) => {
                        expectations[index] = DRESS.categoric(DRESS.get(subject, this.outcome));
                        pAs[index] = this.layers.reduce((pA, layer) => forward(layer, pA), features.map(feature => DRESS.numeric(DRESS.get(subject, feature)))).slice();
                    });
                    return this.classes.map((cls, clsIndex) => {
                        const predictions = new Array(numSubject);
                        expectations.map((expectation, index) => {
                            predictions[index] = [(expectation === cls) ? 1 : 0, pAs[index][clsIndex]];
                        });
                        return roc({ predictions }, [cls], ['neuralNetwork']);
                    });
                }
                return null;
            },
            performance(subjects) {
                if (this.classes.length) {
                    return DRESS.accuracies(subjects.map(subject => [
                        DRESS.categoric(DRESS.get(subject, this.outcome)),
                        this.predict(subject)
                    ]));
                }
                else {
                    return DRESS.errors(subjects.map(subject => [
                        DRESS.numeric(DRESS.get(subject, this.outcome)),
                        this.predict(subject)
                    ]));
                }
            }
        };
    };
})(DRESS || (DRESS = {}));
