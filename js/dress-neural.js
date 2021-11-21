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
        do: (new Array(size)).fill(1),
        df: 1,
        size,
        pSize,
        g
    });
    /**
     * @ignore
     */
    let reoptimize = (layer) => {
        let row = layer.size;
        while (row--) {
            layer.mW[row].fill(0);
            layer.vW[row].fill(0);
        }
        layer.mB.fill(0);
        layer.vB.fill(0);
        return layer;
    };
    /**
     * @ignore
     */
    let drop = (layer, dilution) => {
        let row = layer.size;
        let off = 0;
        while (row--) {
            if (DRESS.random() < dilution) {
                layer.do[row] = 0;
                off++;
            }
            else {
                layer.do[row] = 1;
            }
        }
        layer.df = 1 - off / layer.size + 1e-8;
        return layer;
    };
    /**
     * @ignore
     */
    let forward = (layer, pA) => {
        layer.pA = pA;
        //                
        let row = layer.size;
        while (row--) {
            let WpA = 0;
            if (layer.do[row]) {
                WpA = layer.B[row];
                let col = layer.pSize;
                while (col--) {
                    WpA += layer.W[row][col] * pA[col];
                }
            }
            // Z = (WpA + B) / dilution_factor
            layer.Z[row] = WpA / layer.df;
        }
        return activators[layer.g][0](layer.Z);
    };
    /**
     * @ignore
     */
    let backward = (layer, pdA, alpha, beta1, beta2, beta1epoch, beta2epoch) => {
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
        const dZ = activators[layer.g][1](layer.Z);
        layer.dA.fill(0);
        let row = layer.size;
        while (row--) {
            if (layer.do[row]) {
                const Wr = layer.W[row];
                const mWr = layer.mW[row];
                const vWr = layer.vW[row];
                //
                const dZr = dZ[row] * pdA[row] * layer.df;
                let col = layer.pSize;
                while (col--) {
                    // dA = W . dZ
                    layer.dA[col] += Wr[col] * dZr;
                    if (alpha) {
                        // dW = dZ * pA
                        const dW = dZr * layer.pA[col];
                        // W -= ALPHA * dW
                        mWr[col] = (1 - beta1) * dW + beta1 * mWr[col];
                        vWr[col] = (1 - beta2) * dW * dW + beta2 * vWr[col];
                        Wr[col] -= alpha * (mWr[col] / beta1epoch) / (Math.sqrt(vWr[col] / beta2epoch) + 1e-8);
                    }
                }
                if (alpha) {
                    // B -= ALPHA * dZ
                    layer.mB[row] = (1 - beta1) * dZr + beta1 * layer.mB[row];
                    layer.vB[row] = (1 - beta2) * dZr * dZr + beta2 * layer.vB[row];
                    layer.B[row] -= alpha * (layer.mB[row] / beta1epoch) / (Math.sqrt(layer.vB[row] / beta2epoch) + 1e-8);
                }
            }
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
                values[i] *= (1 - values[i]);
            }
            return values;
        },
        (fin, fout) => DRESS.randn() * Math.sqrt(6 / (fin + fout))
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
                values[i] = (1 - values[i] * values[i]);
            }
            return values;
        },
        (fin, fout) => DRESS.randn() * Math.sqrt(6 / (fin + fout))
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
        (fin, fout) => DRESS.randn() * Math.sqrt(6 / fin)
    ];
    /**
     * @ignore
     */
    let leaky = [
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
    ];
    /**
     * @ignore
     */
    let linear = [
        (values) => values,
        (values) => values.fill(1),
        (fin, fout) => DRESS.randn()
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
        (values) => values.fill(1),
        (fin, fout) => DRESS.randn()
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
     * The network is trained on the specified subjects and the specified numerical features. Each feature/outcome should be a property of the subject or is accessible using the dot notation.
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
     * @param {object} [hyperparameters={}] - An object that specifies the hyperparameters for the model. Supported hyperparameters included alpha, beta1, beta2, layout, activator, epoch, and dilution.
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
    DRESS.multilayerPerceptron = (subjects, outcome, features, classification = true, hyperparameters = {}) => {
        let XY = (subjects, outcome, features, classes, scales) => {
            const numSubject = subjects.length;
            const numFeature = features.length;
            const X = new Array(numSubject);
            const Y = new Array(numSubject);
            // Get feature values and outcome values
            let i = numSubject;
            while (i--) {
                X[i] = new Array(numFeature);
                let j = numFeature;
                while (j--) {
                    const scale = scales[j];
                    let v = DRESS.numeric(DRESS.get(subjects[i], features[j]));
                    X[i][j] = v;
                    if (v < scale[0 /* MIN */]) {
                        scale[0] = v;
                    }
                    if (v > scale[1 /* MAX */]) {
                        scale[1] = v;
                    }
                }
                if (classes) {
                    const value = DRESS.categoric(DRESS.get(subjects[i], outcome));
                    let cls = classes.indexOf(value);
                    if (cls === -1) {
                        cls = classes.push(value) - 1;
                    }
                    Y[i] = cls;
                }
                else {
                    Y[i] = DRESS.numeric(DRESS.get(subjects[i], outcome));
                }
            }
            // Normalize Feature Values to [0, 1]
            i = numFeature;
            while (i--) {
                const min = scales[i][0 /* MIN */];
                let range = scales[i][1 /* MAX */] - min;
                if (range === 0) {
                    range = 1e-8;
                }
                let j = numSubject;
                while (j--) {
                    X[j][i] -= min;
                    X[j][i] /= range;
                }
            }
            return [X, Y];
        };
        let round = (X, Y, layers, classification, alpha, beta1, beta2, dilution, epoch) => {
            const beta1epoch = 1 - (Math.pow(beta1, epoch));
            const beta2epoch = 1 - (Math.pow(beta2, epoch));
            const numLayer_1 = layers.length - 1;
            const numSubject = X.length;
            const keys = [...Array(numSubject).keys()].sort(_ => DRESS.random() - 0.5);
            let i = numSubject;
            while (i--) {
                // forward
                let l = 0;
                let pA = forward(layers[l++], X[keys[i]]);
                while (l < numLayer_1) {
                    pA = forward(drop(layers[l++], dilution), pA);
                }
                pA = forward(layers[l++], pA);
                // loss
                let j = pA.length;
                const temp = new Array(j);
                if (classification) {
                    while (j--) {
                        temp[j] = pA[j] - ((Y[keys[i]] === j) ? 1 : 0);
                    }
                }
                else {
                    while (j--) {
                        temp[j] = pA[j] - Y[keys[i]];
                    }
                }
                pA = temp;
                // backward
                while (l--) {
                    pA = backward(layers[l], pA, alpha, beta1, beta2, beta1epoch, beta2epoch);
                }
            }
        };
        const alpha = (hyperparameters.alpha || (hyperparameters.alpha = 0.001));
        const beta1 = (hyperparameters.beta1 || (hyperparameters.beta1 = 0.8)) - 1e-8;
        const beta2 = (hyperparameters.beta2 || (hyperparameters.beta2 = 0.99)) - 1e-8;
        const epoch = Math.round(hyperparameters.epoch || (hyperparameters.epoch = 1000));
        const dilution = (hyperparameters.dilution || (hyperparameters.dilution = 0.25));
        const layout = (hyperparameters.layout || (hyperparameters.layout = []));
        const activator = (hyperparameters.activator || (hyperparameters.activator = 1 /* LEAKY */));
        let seed;
        let layers;
        let classes;
        let scales;
        if (Array.isArray(subjects)) {
            seed = DRESS.SEED;
            const numSubject = subjects.length;
            const numFeature = features.length;
            // Get Values
            classes = classification ? [] : null;
            scales = new Array(numFeature).fill(null).map(_ => [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
            const [X, Y] = XY(subjects, outcome, features, classes, scales);
            const numClass = classes ? classes.length : 0;
            // Setup Neural Network
            if (layout.length === 0) {
                layout.push(Math.ceil((numFeature + numClass) / 2) + 1, Math.ceil(Math.sqrt(numFeature + numClass)) + 1);
            }
            let pSize = numFeature;
            layers = layout.map(size => {
                const l = layer(size, pSize, activator);
                pSize = size;
                return l;
            });
            if (classification) {
                layers.push(layer(numClass, pSize, 5 /* SOFTMAX */));
            }
            else {
                layers.push(layer(1, pSize, 4 /* LINEAR */));
            }
            // Train Network
            if (numSubject) {
                let e = 0;
                while (e++ < epoch) {
                    round(X, Y, layers, classification, alpha, beta1, beta2, dilution, e);
                }
            }
        }
        else {
            seed = subjects['seed'] || 0;
            outcome = subjects['outcome'] || '';
            features = subjects['features'] || [];
            layers = subjects['layers'] || [];
            classes = subjects['classes'] || null;
            scales = subjects['scales'] || [];
            hyperparameters = subjects['hyperparameters'] || {};
        }
        return {
            seed,
            outcome,
            features,
            layers: layers.map(layer => drop(layer, 0)),
            classes,
            scales,
            hyperparameters,
            text: '[' + outcome + '] seed: ' + seed,
            predict(subject) {
                const features = this.features;
                const scales = this.scales;
                let j = features.length;
                const X = new Array(j);
                while (j--) {
                    X[j] = (DRESS.numeric(DRESS.get(subject, features[j])) - scales[j][0 /* MIN */]) / (scales[j][1 /* MAX */] - scales[j][0 /* MIN */]);
                }
                const pA = this.layers.reduce((pA, layer) => forward(layer, pA), X);
                if (this.classes) {
                    return this.classes[pA.map((value, index) => [value, index]).sort((a, b) => a[0] - b[0]).pop()[1]];
                }
                return pA[0];
            },
            roc(subjects, roc = DRESS.roc) {
                if (this.classes) {
                    const numSubject = subjects.length;
                    const outcome = this.outcome;
                    const features = this.features;
                    const numFeature = features.length;
                    const layers = this.layers;
                    const expectations = new Array(numSubject);
                    const pAs = new Array(numSubject);
                    let i = numSubject;
                    while (i--) {
                        expectations[i] = DRESS.categoric(DRESS.get(subjects[i], outcome));
                        let j = numFeature;
                        const X = new Array(j);
                        while (j--) {
                            X[j] = DRESS.numeric(DRESS.get(subjects[i], features[j]));
                        }
                        pAs[i] = layers.reduce((pA, layer) => forward(layer, pA), X).slice();
                    }
                    return this.classes.map((cls, clsIndex) => {
                        const predictions = new Array(numSubject);
                        let i = numSubject;
                        while (i--) {
                            predictions[i] = [(expectations[i] === cls) ? 1 : 0, pAs[i][clsIndex]];
                        }
                        return roc({ predictions }, [cls], ['multilayerPerceptron']);
                    });
                }
                return null;
            },
            performance(subjects) {
                const numSubject = subjects.length;
                const outcome = this.outcome;
                const predictions = new Array(numSubject);
                if (this.classes) {
                    let i = numSubject;
                    while (i--) {
                        predictions[i] = [
                            DRESS.categoric(DRESS.get(subjects[i], outcome)),
                            this.predict(subjects[i])
                        ];
                    }
                    return DRESS.accuracies(predictions);
                }
                else {
                    let i = numSubject;
                    while (i--) {
                        predictions[i] = [
                            DRESS.numeric(DRESS.get(subjects[i], outcome)),
                            this.predict(subjects[i])
                        ];
                    }
                    return DRESS.errors(predictions);
                }
            },
            train(subjects) {
                const hyperparameters = this.hyperparameters;
                const [X, Y] = XY(subjects, this.outcome, this.features, this.classes, this.scales);
                let e = 0;
                while (e++ < hyperparameters.epoch) {
                    round(X, Y, this.layers, this.classification, hyperparameters.alpha, hyperparameters.beta1, hyperparameters.beta2, hyperparameters.dilution, e);
                }
                this.layers.map(layer => drop(layer, 0));
            }
        };
    };
    DRESS.cGAN = (subjects, features, condition, hyperparameters = {}) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        let loss = (pA, Y) => {
            let y = pA[0];
            return [(y - Y) / (y * (1 - y) + 1e-8)];
        };
        let doForward = (pA, layers, dilution) => {
            const numLayer_1 = layers.length - 1;
            let l = 0;
            pA = forward(layers[l++], pA);
            while (l < numLayer_1) {
                pA = forward(drop(layers[l++], dilution), pA);
            }
            return forward(layers[l++], pA);
        };
        let doBackward = (pA, layers, alpha, beta1, beta2, beta1epoch, beta2epoch) => {
            let l = layers.length;
            while (l--) {
                pA = backward(layers[l], pA, alpha, beta1, beta2, beta1epoch, beta2epoch);
            }
            return pA;
        };
        let noise = (pA) => {
            let i = pA.length;
            while (i--) {
                pA[i] = DRESS.randn();
            }
            return pA;
        };
        let XY = (subjects, features, condition, scales) => {
            const numFeature = features.length;
            const numSubject = subjects.length;
            const X = new Array(numSubject);
            const Y = new Array(numSubject);
            let keys = null;
            // Get Feature Values and Condition Labels
            let i = numSubject;
            while (i--) {
                X[i] = new Array(numFeature);
                let j = numFeature;
                while (j--) {
                    const scale = scales[j];
                    let v = DRESS.numeric(DRESS.get(subjects[i], features[j]));
                    X[i][j] = v;
                    if (v < scale[0 /* MIN */]) {
                        scale[0] = v;
                    }
                    if (v > scale[1 /* MAX */]) {
                        scale[1] = v;
                    }
                }
                if (condition) {
                    const object = DRESS.get(subjects[i], condition);
                    if (typeof object === 'object') {
                        if (!keys) {
                            keys = Object.keys(object).sort();
                        }
                        Y[i] = keys.map(key => object[key] ? 1 : 0);
                    }
                    else {
                        Y[i] = [object ? 1 : 0];
                    }
                }
            }
            // Normalize Feature Values to [-1, 1]
            i = numFeature;
            while (i--) {
                const min = scales[i][0 /* MIN */];
                let range = scales[i][1 /* MAX */] - min;
                if (range === 0) {
                    range = 1e-8;
                }
                let j = numSubject;
                while (j--) {
                    X[j][i] -= min;
                    X[j][i] *= 2 / range;
                    X[j][i] -= 1;
                }
            }
            return [X, Y];
        };
        let round = (X, Y, latentSpace, discriminator, generator, discriminatorHP, generatorHP, smoothing) => {
            // Randomize Samples     
            const numSubject = X.length;
            const keys = [...Array(numSubject).keys()].sort(_ => DRESS.random() - 0.5);
            // Train Discriminator
            let alpha = discriminatorHP.alpha;
            let beta1 = discriminatorHP.beta1;
            let beta2 = discriminatorHP.beta2;
            let epoch = discriminatorHP.epoch;
            let e = 0;
            let dLoss = 0;
            // Reset optimizer
            discriminator.map(layer => reoptimize(layer));
            while (e++ < epoch) {
                const beta1epoch = 1 - (Math.pow(beta1, e));
                const beta2epoch = 1 - (Math.pow(beta2, e));
                let i = numSubject;
                while (i--) {
                    // Real sample  
                    let x = doForward(X[keys[i]].concat(Y[keys[i]]), discriminator, discriminatorHP.dilution);
                    let y = DRESS.random() > (smoothing / 10) ? 1 + (DRESS.random() * 2 - 1) * smoothing : DRESS.random() * smoothing;
                    dLoss += Math.abs(x[0] - y);
                    doBackward(loss(x, y), discriminator, alpha, beta1, beta2, beta1epoch, beta2epoch);
                    // Fake sample
                    x = doForward(doForward(noise(latentSpace).concat(Y[keys[i]]), generator, 0).concat(Y[keys[i]]), discriminator, discriminatorHP.dilution);
                    y = DRESS.random() > (smoothing / 10) ? DRESS.random() * smoothing : 1 + (DRESS.random() * 2 - 1) * smoothing;
                    dLoss += Math.abs(x[0] - y);
                    doBackward(loss(x, y), discriminator, alpha, beta1, beta2, beta1epoch, beta2epoch);
                }
            }
            dLoss /= (epoch * numSubject * 2);
            // Train Generator
            alpha = generatorHP.alpha;
            beta1 = generatorHP.beta1;
            beta2 = generatorHP.beta2;
            epoch = generatorHP.epoch;
            e = 0;
            let gLoss = 0;
            // Reset optimizer
            generator.map(layer => reoptimize(layer));
            while (e++ < epoch) {
                const beta1epoch = 1 - (Math.pow(beta1, e));
                const beta2epoch = 1 - (Math.pow(beta2, e));
                let i = numSubject * 2;
                while (i--) {
                    let x = doForward(doForward(noise(latentSpace).concat(Y[keys[i >>> 1]]), generator, generatorHP.dilution).concat(Y[keys[i >>> 1]]), discriminator, 0);
                    let y = 1;
                    gLoss += Math.abs(x[0] - y);
                    doBackward(doBackward(loss(x, y), discriminator, 0, 0, 0, 0, 0), generator, alpha, beta1, beta2, beta1epoch, beta2epoch);
                }
            }
            gLoss /= (epoch * numSubject * 2);
            return [dLoss, gLoss];
        };
        const numIteration = Math.round(hyperparameters.iteration || (hyperparameters.iteration = 1000));
        const latent = Math.round(hyperparameters.latent || (hyperparameters.latent = features.length));
        const smoothing = hyperparameters.smoothing || (hyperparameters.smoothing = 0.1);
        const discriminatorHP = (hyperparameters.discriminator || (hyperparameters.discriminator = {}));
        discriminatorHP.alpha = ((_a = hyperparameters.discriminator).alpha || (_a.alpha = 0.001));
        discriminatorHP.beta1 = ((_b = hyperparameters.discriminator).beta1 || (_b.beta1 = 0.5)) - 1e-8;
        discriminatorHP.beta2 = ((_c = hyperparameters.discriminator).beta2 || (_c.beta2 = 0.99)) - 1e-8;
        discriminatorHP.epoch = Math.round((_d = hyperparameters.discriminator).epoch || (_d.epoch = 1));
        discriminatorHP.dilution = ((_e = hyperparameters.discriminator).dilution || (_e.dilution = 0.5));
        discriminatorHP.layout = ((_f = hyperparameters.discriminator).layout || (_f.layout = []));
        discriminatorHP.activator = ((_g = hyperparameters.discriminator).activator || (_g.activator = 1 /* LEAKY */));
        const generatorHP = (hyperparameters.generator || (hyperparameters.generator = {}));
        generatorHP.alpha = ((_h = hyperparameters.generator).alpha || (_h.alpha = 0.0005));
        generatorHP.beta1 = ((_j = hyperparameters.generator).beta1 || (_j.beta1 = 0.5)) - 1e-8;
        generatorHP.beta2 = ((_k = hyperparameters.generator).beta2 || (_k.beta2 = 0.99)) - 1e-8;
        generatorHP.epoch = Math.round((_l = hyperparameters.generator).epoch || (_l.epoch = 1));
        generatorHP.dilution = ((_m = hyperparameters.generator).dilution || (_m.dilution = 0.5));
        generatorHP.layout = ((_o = hyperparameters.generator).layout || (_o.layout = []));
        generatorHP.activator = ((_p = hyperparameters.generator).activator || (_p.activator = 0 /* RELU */));
        let seed;
        let scales;
        let discriminator;
        let generator;
        let losses;
        if (Array.isArray(subjects)) {
            seed = DRESS.SEED;
            // Get Values
            const numFeature = features.length;
            scales = new Array(numFeature).fill(null).map(_ => [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
            const [X, Y] = XY(subjects, features, condition, scales);
            const numLabel = Y.length ? Y[0].length : 0;
            // Create Discriminator
            if (discriminatorHP.layout.length === 0) {
                discriminatorHP.layout.push((numFeature + numLabel) * (numFeature + latent), numFeature * (numLabel + latent));
            }
            let pSize = numFeature + numLabel;
            discriminator = discriminatorHP.layout.map(size => {
                const l = layer(size, pSize, discriminatorHP.activator);
                pSize = size;
                return l;
            });
            discriminator.push(layer(1, pSize, 2 /* SIGMOID */));
            // Create Generator
            if (generatorHP.layout.length === 0) {
                generatorHP.layout.push(numFeature * (numLabel + latent), (numFeature + numLabel) * (numFeature + latent));
            }
            pSize = latent + numLabel;
            generator = generatorHP.layout.map(size => {
                const l = layer(size, pSize, generatorHP.activator);
                pSize = size;
                return l;
            });
            generator.push(layer(numFeature, pSize, 3 /* TANH */));
            // Train
            const latentSpace = new Array(latent);
            losses = new Array(numIteration);
            let i = 0;
            while (i < numIteration) {
                const [dLoss, gLoss] = round(X, Y, latentSpace, discriminator, generator, discriminatorHP, generatorHP, smoothing);
                losses[i++] = { discriminator: dLoss, generator: gLoss };
            }
        }
        else {
            seed = subjects['seed'] || 0;
            features = subjects['features'] || [];
            condition = subjects['condition'] || null;
            scales = subjects['scales'] || [];
            discriminator = subjects['discriminator'] || [];
            generator = subjects['generator'] || [];
            losses = subjects['losses'] || [];
            hyperparameters = subjects['hyperparameters'] || {};
        }
        return {
            seed,
            features,
            condition,
            scales,
            discriminator,
            generator,
            losses,
            hyperparameters,
            text: '[' + features.join(', ') + (condition ? (' || ' + condition) : '') + ']	seed: ' + seed
                + '	discriminator: ' + DRESS.clamp(losses.length ? losses[losses.length - 1].discriminator : 0)
                + '	generator: ' + DRESS.clamp(losses.length ? losses[losses.length - 1].generator : 0),
            generate(encoding) {
                const object = {};
                doForward(noise(new Array(this.hyperparameters.latent)).concat((typeof encoding === 'object') ? Object.keys(encoding).sort().map(key => encoding[key] ? 1 : 0) : [encoding ? 1 : 0]), this.generator, 0)
                    .map((v, i) => DRESS.set(object, features[i], (v + 1) * (scales[i][1 /* MAX */] - scales[i][0 /* MIN */]) / 2 + scales[i][0 /* MIN */]));
                return object;
            },
            train(subjects) {
                const hyperparameters = this.hyperparameters;
                const losses = this.losses;
                const discriminator = this.discriminator;
                const generator = this.generator;
                const [X, Y] = XY(subjects, this.features, this.condition, this.scales);
                const latentSpace = new Array(hyperparameters.latent);
                let i = 0;
                while (i++ < hyperparameters.iteration) {
                    const [dLoss, gLoss] = round(X, Y, latentSpace, discriminator, generator, hyperparameters.discriminator, hyperparameters.generator, hyperparameters.smoothing);
                    losses.push({ discriminator: dLoss, generator: gLoss });
                }
                //
                this.text = '[' + this.features.join(', ') + (this.condition ? (' || ' + this.condition) : '') + ']	seed: ' + this.seed
                    + '	discriminator: ' + DRESS.clamp(losses.length ? losses[losses.length - 1].discriminator : 0)
                    + '	generator: ' + DRESS.clamp(losses.length ? losses[losses.length - 1].generator : 0);
            }
        };
    };
})(DRESS || (DRESS = {}));
