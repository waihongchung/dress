var DRESS;
(function (DRESS) {
    /**
     * @ignore
     */
    const layer = (size, pSize, g) => [
        Array(size).fill(null).map(() => Array(pSize).fill(null).map(() => activators[g][2 /* ACTIVATOR.INITIALIZER */](pSize, size))), //W
        Array(size).fill(null).map(() => Array(pSize).fill(0)), // mW
        Array(size).fill(null).map(() => Array(pSize).fill(0)), // vW
        Array(size).fill(0), // B
        Array(size).fill(0), // mB
        Array(size).fill(0), //vB
        Array(size), //Z
        null, //pA
        Array(pSize), // dA
        size, // size
        pSize, // pSize
        g // g
    ];
    /**
     * @ignore
     */
    const relayer = (layer, size) => {
        let i = size - layer[9 /* LAYER.size */];
        if (i > 0) {
            const pSize = layer[10 /* LAYER.pSize */];
            while (i--) {
                layer[0 /* LAYER.W */].push(Array(pSize).fill(null).map(() => activators[layer[11 /* LAYER.g */]][2 /* ACTIVATOR.INITIALIZER */](pSize, size)));
                layer[1 /* LAYER.mW */].push(Array(pSize).fill(0));
                layer[2 /* LAYER.vW */].push(Array(pSize).fill(0));
                layer[3 /* LAYER.B */].push(0);
                layer[4 /* LAYER.mB */].push(0);
                layer[5 /* LAYER.vB */].push(0);
                layer[6 /* LAYER.Z */].push(0);
            }
            layer[9 /* LAYER.size */] = size;
        }
        return layer;
    };
    /**
     * @ignore
     */
    const forward = (layer, pA) => {
        layer[7 /* LAYER.pA */] = pA;
        //              
        const pSize = layer[10 /* LAYER.pSize */];
        let row = layer[9 /* LAYER.size */];
        while (row--) {
            let WpA = layer[3 /* LAYER.B */][row];
            const Wr = layer[0 /* LAYER.W */][row];
            let col = pSize;
            while (col--) {
                WpA += Wr[col] * pA[col];
            }
            layer[6 /* LAYER.Z */][row] = WpA; // Z = (WpA + B) 
        }
        return activators[layer[11 /* LAYER.g */]][0 /* ACTIVATOR.FORWARD */](layer[6 /* LAYER.Z */]); // g(Z) (Activation function directly alters values of Z)
    };
    const backward = (layer, pdA, alpha, beta1, beta2, dropout) => {
        // Z(L) = W(L) . A(L-1) + B(L)
        // A(L) = g{Z(L)}
        // dC/dW(L) = dC/dA(L) . dA(L)/dZ(L) . dZ(L)/dW(L)
        // dC/dW(L-1) = dC/dA(L) . dA(L)/dZ(L) . dZ(L)/dA(L-1) . dA(L-1)/dZ(L-1) . dZ(L-1)/dW(L-1)
        // dC/dW(L-2) = dC/dA(L) . dA(L)/dZ(L) . dZ(L)/dA(L-1) . dA(L-1)/dZ(L-1) . dZ(L-1)/dA(L-2) . dA(L-2)/dZ(L-2) . dZ(L-2)/dW(L-2)
        // dA(L)/dZ(L) = g'{Z(L)}        
        // dZ(L)/dW(L) = A(L-1)
        // dZ(L)/dA(L-1) = W(L)
        // dC/dW(L) = dC/dA(L) . g'{Z(L)} . A(L-1)
        // dC/dW(L-1) = dC/dA(L) . g'{Z(L)} . W(L) . g'{Z(L-1)} . A(L-2)
        // dC/dW(L-2) = dC/dA(L) . g'{Z(L)} . W(L) . g'{Z(L-1)} . W(L-1) . g'{Z(L-2)} . A(L-3)
        const dA = layer[8 /* LAYER.dA */].fill(0);
        const pA = layer[7 /* LAYER.pA */];
        //
        const B = layer[3 /* LAYER.B */];
        const mB = layer[4 /* LAYER.mB */];
        const vB = layer[5 /* LAYER.vB */];
        //                
        const dZ = activators[layer[11 /* LAYER.g */]][1 /* ACTIVATOR.BACKWARD */](layer[6 /* LAYER.Z */]);
        //
        const pSize = layer[10 /* LAYER.pSize */];
        let row = layer[9 /* LAYER.size */];
        while (row--) {
            const Wr = layer[0 /* LAYER.W */][row];
            const dZr = dZ[row] * pdA[row];
            //
            if (DRESS.rand() > dropout) {
                const mWr = layer[1 /* LAYER.mW */][row];
                const vWr = layer[2 /* LAYER.vW */][row];
                //
                let col = pSize;
                while (col--) {
                    // dA = W . dZ
                    dA[col] += Wr[col] * dZr;
                    // dW = dZ * pA
                    const dW = dZr * pA[col];
                    // W -= ALPHA * dW
                    mWr[col] = (1 - beta1) * dW + beta1 * mWr[col];
                    vWr[col] = (1 - beta2) * dW * dW + beta2 * vWr[col];
                    Wr[col] -= alpha * mWr[col] / (Math.sqrt(vWr[col]) + Number.EPSILON);
                }
                // B -= ALPHA * dZ
                mB[row] = (1 - beta1) * dZr + beta1 * mB[row];
                vB[row] = (1 - beta2) * dZr * dZr + beta2 * vB[row];
                B[row] -= alpha * mB[row] / (Math.sqrt(vB[row]) + Number.EPSILON);
            }
            else {
                let col = pSize;
                while (col--) {
                    dA[col] += Wr[col] * dZr;
                }
            }
        }
        return dA;
    };
    const activators = [
        // RELU
        [
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
            (fin, fout) => DRESS.randn() * Math.sqrt(6 / fin)
        ],
        // LEAKY
        [
            (values) => {
                let i = values.length;
                while (i--) {
                    if (values[i] <= 0) {
                        values[i] *= 0.2;
                    }
                }
                return values;
            },
            (values) => {
                let i = values.length;
                while (i--) {
                    values[i] = (values[i] > 0) ? 1 : 0.2;
                }
                return values;
            },
            (fin, fout) => DRESS.randn() * Math.sqrt(6 / fin)
        ],
        // SIGMOID
        [
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
                    values[i] *= (1 - values[i]);
                }
                return values;
            },
            (fin, fout) => DRESS.randn() * Math.sqrt(6 / (fin + fout))
        ],
        // TANH
        [
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
                    values[i] = (1 - values[i] * values[i]);
                }
                return values;
            },
            (fin, fout) => DRESS.randn() * Math.sqrt(6 / (fin + fout))
        ],
        // LINEAR
        [
            (values) => values,
            (values) => values.fill(1),
            (fin, fout) => DRESS.randn()
        ],
        // SOFTMAX
        [
            (values) => DRESS.softmax(values),
            (values) => values.fill(1),
            (fin, fout) => DRESS.randn()
        ]
    ];
    /**
     * @summary Build a Multilayer Perceptron.
     *
     * @description This method builds a basic feedforward artificial neural network, also known as a multilayer perceptron. It can be used for either classification or regression purposes.
     * The network is trained on the specified subjects and the specified numerical features. Each feature/outcome should be a property of the subject or be accessible using the dot notation.
     * If a feature/outcome is an array, then the length of the array is used for computation.
     *
     * The neural network uses the ADAM optimizer and supports the following activation functions in the hidden layers: relu (0), leaky relu (1), sigmoid (2), tanh (3), linear (4), and softmax (5).
     * By default, the network contains one input layer (the size of which is the same as the number of features) and one output layer (the size of which is dependent on the number of classes in a classification model, or 1 in a regression model).
     * The network also contains two hidden layers (the size of which are set heuristically based on the number of features and output). The layout of the hidden layers can be set as a numerical array in the hyperparameter.
     *
     * @param {object[]} subjects - The training subjects
     * @param {string} outcome - The outcome of the model. Must be numerical for regression or categorical for classification.
     * @param {string[]} features - An array of features to be used as classifiers/regressors.
     * @param {boolean} [classification=false] - Model type. Default to regression. Set to true to build a classification model.
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included alpha (ADAM optimizer), beta1 (ADAM optimizer), beta2 (ADAM optimizer), layout (the size of each layer), activator, epoch, and dropout.
     * @returns A multilayer perceptron containing the following properties:
     *   - seed (the randomly generated seed value),
     *   - outcome (the outcome of the model),
     *   - features (the features used to create the model),
     *   - layers (an array of layers of neurons),
     *   - classes (a list of distinct classes, only available in a classification model),
     *   - text,
     *
     *   - train (a method for training one or more subjects against the existing model),
     *   - predict (a method for making a prediction based on the model, accepts one subject as a parameter),
     *   - auc (a method for computing area under ROC curve or PR curve based on the model, accepts an array of subjects as a parameter. MUST include the dress-roc.js package.),
     *   - validate (a method for validating the performance of the mode, accepts an array of subjects as a parameter).
     */
    DRESS.multilayerPerceptron = (subjects, outcome = null, features = [], classification = false, hyperparameters = {}) => {
        const XY = (subjects, outcome, features, classes) => {
            return (classes) ?
                DRESS.tabulate(subjects, features, [], [(subject) => DRESS.classify(DRESS.get(subject, outcome), classes)]) :
                DRESS.tabulate(subjects, [...features, outcome]);
        };
        //
        const multilayerPerceptron = (layers, rows, outcome, features, classes, scales, hyperparameters) => {
            if (rows === null) {
                return null;
            }
            //
            const classification = Array.isArray(classes);
            const numRow = rows.length;
            const numFeature = features.length;
            const numClass = classification ? classes.length : 1;
            //
            const { alpha = 0.001, beta1 = 0.9, beta2 = 0.999, epoch = 1000, dropout = 0.25, layout = [~~((numFeature + numClass) / 2 + 1), ~~(Math.sqrt(numFeature * (numClass + 1)) + 1)], activator = 1 /* ACTIVATORS.LEAKY */ } = hyperparameters;
            // Normalize X
            let i = numFeature;
            while (i--) {
                const scale = scales[i];
                let j = numRow;
                while (j--) {
                    const value = rows[j][i];
                    if (value < scale[0]) {
                        scale[0] = value;
                    }
                    if (value > scale[1]) {
                        scale[1] = value;
                    }
                }
                //
                if (scale[0] === scale[1]) {
                    scale[1] += Number.EPSILON;
                }
                //
                j = numRow;
                while (j--) {
                    rows[j][i] -= scale[0];
                    rows[j][i] /= scale[1] - scale[0];
                }
            }
            const seed = DRESS.SEED;
            // If there is training data
            if (numRow) {
                // Setup neural network if not already defined.                
                if (layers.length === 0) {
                    let pSize = numFeature;
                    layers = layout.map(size => {
                        const l = layer(size, pSize, activator);
                        pSize = size;
                        return l;
                    });
                    layers.push(layer(numClass, pSize, classification ? 5 /* ACTIVATORS.SOFTMAX */ : 4 /* ACTIVATORS.LINEAR */));
                }
                else {
                    // Resize the network output layer
                    relayer(layers[layers.length - 1], numClass);
                }
                // Train neural network
                const numLayer = layers.length;
                const keys = Array.from(Array(numRow).keys());
                const losses = Array(numClass);
                let e = 0;
                while (e++ < epoch) {
                    DRESS.shuffle(keys);
                    const alpha_epoch = alpha * Math.sqrt(1 - (Math.pow(beta2, e))) / (1 - (Math.pow(beta1, e)));
                    let i = numRow;
                    while (i--) {
                        // forward                        
                        let pA = rows[keys[i]];
                        let l = 0;
                        while (l < numLayer) {
                            pA = forward(layers[l++], pA);
                        }
                        // loss                        
                        if (classification) {
                            const outcome = rows[keys[i]][numFeature];
                            let j = numClass;
                            while (j--) {
                                losses[j] = pA[j] - ((outcome === j) ? 1 : 0);
                            }
                        }
                        else {
                            losses[0] = pA[0] - rows[keys[i]][numFeature];
                        }
                        // backward
                        pA = losses;
                        while (l--) {
                            pA = backward(layers[l], pA, alpha_epoch, beta1, beta2, dropout);
                        }
                    }
                }
            }
            return {
                seed,
                outcome,
                features,
                classes,
                scales,
                layers,
                hyperparameters,
                text: '[' + outcome + ' = ' + features.join(' + ') + '] seed: ' + seed,
            };
        };
        //        
        let rows = null;
        let classes = classification ? [] : null;
        if (Array.isArray(subjects)) {
            rows = XY(subjects, outcome, features, classes);
        }
        let model = multilayerPerceptron([], rows, outcome, features, classes, Array(features.length).fill(null).map(() => [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]), hyperparameters);
        if (!model) {
            model = subjects;
        }
        return Object.assign(Object.assign({}, model), { async: DRESS.nameof(() => DRESS.multilayerPerceptron), 
            /**
             * @summary Fit the prepopulated X and Y arrays to the existing model.
             *
             * @param {any[][]} X
             * @param {any[]} Y
             */
            fit(X, Y) {
                const classes = this.classes;
                const rows = classes ?
                    X.map((row, i) => row.concat(DRESS.classify(Y[i], classes))) :
                    X.map((row, i) => row.concat(Y[i]));
                //            
                DRESS.SEED = this.seed;
                const model = multilayerPerceptron(this.layers, rows, this.outcome, this.features, classes, this.scales, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @sumarry Train one or more additional subjects against the existing model.
             *
             * @param {object[]} subjects - The subjects to be processed.
             */
            train(subjects) {
                const outcome = this.outcome;
                const features = this.features;
                const classes = this.classes;
                //
                let rows = null;
                if (Array.isArray(subjects)) {
                    rows = XY(subjects, outcome, features, classes);
                }
                //
                DRESS.SEED = this.seed;
                const model = multilayerPerceptron(this.layers, rows, outcome, features, classes, this.scales, this.hyperparameters);
                Object.keys(model).forEach(key => this[key] = model[key]);
            },
            /**
             * @summary Apply the feature values of one subject through the forward pass of the neural network.
             *
             * @description This method scales the feature values of one subject, and applies the scaled values through the forward pass of the neural network.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {any[]} The output values of the neural network.
             */
            forward(subject) {
                const scales = this.scales;
                const features = this.features;
                const numFeature = features.length;
                const X = Array(numFeature);
                let i = numFeature;
                while (i--) {
                    X[i] = (DRESS.numeric(DRESS.get(subject, features[i])) - scales[i][0]) / (scales[i][1] - scales[i][0]);
                }
                return this.layers.reduce((pA, layer) => forward(layer, pA), X);
            },
            /**
             * @summary Compute one or more outcome estimates based on the model.
             *
             * @description This method computes an array of outcome estimates on the model.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {number} The outcome estimates.
             */
            estimate(subject) {
                if (this.classes) {
                    return this.forward(subject);
                }
                else {
                    const scales = this.scales;
                    const features = this.features;
                    const numFeature = features.length;
                    const estimates = Array(numFeature + 1);
                    let i = numFeature;
                    while (i--) {
                        const value = DRESS.get(subject, features[i]);
                        DRESS.set(subject, features[i], (scales[i][1] - scales[i][0]) / 2 + scales[i][0]);
                        estimates[i + 1] = this.forward(subject)[0];
                        DRESS.set(subject, features[i], value);
                    }
                    estimates[0] = this.forward(subject)[0];
                    return estimates;
                }
            },
            /**
             * @summary Make a prediction based on the model
             *
             * @description This method computes the predicted outcome based on a test subject.
             *
             * @param {object} subject - A test subject.
             *
             * @returns {number} The predicted outcome.
             */
            predict(subject) {
                if (this.classes) {
                    return this.classes[this.estimate(subject).reduce((max, p, i, P) => P[max] > p ? max : i, 0)];
                }
                return this.forward(subject)[0];
            },
            /**
             * @summary Compute the area under the curve for a classification model.
             *
             * @description This method computes the area under the ROC or PR curve based on an array of test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             * @param {any} [curve=DRESS.roc] - A nonparametric curve algorithm. Default to DRESS.roc.
             *
             * @returns A ROC or PR curve
             */
            auc(subjects, curve = DRESS.roc) {
                return DRESS.auc(this, subjects, this.outcome, this.classes, curve);
            },
            /**
             * @summary Validate the performance of the model.
             *
             * @description This method computes the accuracy of the model based on the specified test subjects.
             *
             * @param {object[]} subjects - An array of test subjects
             *
             * @returns The performance of the model.
             */
            validate(subjects) {
                return DRESS.validate(this, subjects, this.outcome, this.classes);
            } });
    };
})(DRESS || (DRESS = {}));
