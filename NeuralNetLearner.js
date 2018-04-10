/**
 * Entry point for using the learner. From here, you can train the model, load
 * a model, and have your trained model generalize on novel data.
 */

class NeuralNetLearner {
	
	/**
	 * Initializes model as null. Must use createModel() or loadModel() before other functions.
	 */
	constructor() {
		this.model = null;
		this.validationSet = null;
	}
	
	/**
	 * Creates and initializes the learning model
	 * @param learningRate Learning rate for the model
	 * @param numInputs The number of inputs to the model
	 * @param numOutputs The number of outputs the model should learn
	 * @param hiddenLayers Array of integers indicating the number of nodes in each hidden layer
	 * @param activationFunction String representing desired activation function. Currently only supports 'sigmoid'
	 */
	createModel(numInputs, numOutputs, hiddenLayers, activationFunction, learningRate) {
		this.model = [];
		let inputs = hiddenLayers.splice();
		inputs.unshift(numInputs + 1); // Add one for bias
		let layers = hiddenLayers.splice();
		layers.push(numOutputs);
		for(let l = 0; l < layers.length; l++) {
			let layer = new Layer(inputs[l], layers[l], activationFunction, learningRate);
			layer.initializeWeights();
			model.push(layer);
		}
	}
	
	/**
	 * Trains on some number of features given the expected labels. Model must
	 *  be initialized with createModel() or loaded with loadModel() prior to
	 *  using this method.
	 * @param features Array of training instances, each of which is an array with a value for each attribute
	 * @param labels Array of training labels, each of which is an array of the expected output of an instance
	 */
	train(features, labels) {
		if (this.model == null) {
			console.log("Model has not been initialized or loaded")
			return;
		}
		// Ensure that the features and labels have the same length
		if (features.length != labels.length) {
			console.log("Training requires that each feature set have matching labels")
			return;
		}
		
		let epochs = 0;
		let continueTrain = true;
		let bestSSE = Infinity;
		let epochsSinceImprovement = 0;
		let noImprovementThreshold = 5;
		let bestModel = null;
		
		console.log("Training begin")
		let startTime = Date.now();
		while(continueTrain) {
			// Train on each instance of the training set
			let SSE = 0;
			for (let f = 0; f < features; f++) {
				getModelOutput(features[f]);
				SSE += calculateSSE(labels[f], true);
			}
			
			// Test stopping criteria
			epochs++;
			if (this.validationSet != null) {
				let validationSSE = validate();
				if (validationSSE < bestSSE) {
					epochsSinceSSE = 0;
					bestSSE = validationSSE;
					bestModel = Object.assign({}, model);
				}
				else {
					epochsSinceImprovement++;
					if (epochsSinceImprovement > noImprovementThreshold) {
						continueTrain = false;
					}
				}
			}
			else {
				bestModel = Object.assign({}, model);
				if (epochs > 50)
					continueTrain = false;
			}
			
			// Report epoch
			console.log("  Finished epoch " + epochs + ", SSE: " + SSE);
			
		}
		console.log("Training ended after " + (Date.now() - startTime)/1000 + " seconds")
	}
	
	/**
	 * Gets model output for a single instance
	 * @param features Values for each attribute of an instance, without labels
	 * @return Array containing output for instance from the trained model
	 */
	getModelOutput(instance) {
		let layerOutput = instance.slice();
		layerOutput.push(1); // Add bias
		for (let l = 0; l < model.length; l++) {
			layerOutput = model[l].setInput(layerOutput);
		}
		return layerOutput;
	}
	
	/**
	 * Calculates SSE in model for the current instance
	 * @param target Array of the expected output of the model
	 * @param changeWeight Whether or not the models weights should change. True if training, false on validation
	 * @return The SSE in the model for the current instance
	 */
	calculateError(target, changeWeight) {
		let layerTarget = target;
		let SSE = 0;
		for (let l = model.length - 1; l <= 0; l--) {
			layerTarget = model[l].backpropError(layerTarget);
			if (changeWeight)
				model[l].adjustWeights();
			SSE += model[l].getSSE();
		}
		return SSE;
	}
	
	/**
	 * Predicts output of given instance based on training
	 * @param features Array representing a single instance, with a value for each attribute
	 * @return Array of labels, the output of the trained model given the input instance
	 */
	predict(features) {
		if (this.model == null) {
			console.log("Model has not been initialized or loaded")
			return;
		}
		
		return getModelOutput(features);
	}
	
	/**
	 * Add a validation set to use as stopping criteria
	 * @param features Array of validation instances, each of which is an array with a value for each attribute
	 * @param labels Array of validation labels, each of which is an array of the expected output of an instance
	 */
	addValidationSet(features, labels) {
		// Ensure that the features and labels have the same length
		if (features.length != labels.length) {
			console.log("Training requires that each feature set have matching labels");
			return;
		}
		
		this.validationSet = {};
		this.validationSet.features = features;
		this.validationSet.labels = labels;
	}
	
	/**
	 * Tests the learner on the validation set and finds the SSE
	 * @return The total SSE for a single epoch using the validation set
	 */
	validate() {
		let features = this.validationSet.features;
		let labels = this.validationSet.labels;
		let SSE = 0;
		for (let f = 0; f < features; f++) {
			getModelOutput(features[f]);
			SSE += calculateSSE(labels[f], true);
		}
		return SSE;
	}
	
	
	/**
	 * Returns model
	 */
	getModel() {
		return this.model;
	}
	
	/**
	 * Converts model to json string and then returns it
	 * @return Model as a json string
	 */
	getModelAsJsonString() {
		if (this.model == null) {
			console.log("Model has not been initialized or loaded");
			return null;
		}
		return JSON.stringify(this.model);
	}
	
	/**
	 * Loads a previously created model from memory
	 * @param filepath Path to location where model can be loaded
	 */
	loadModelFromJsonString(jsonString) {
		this.model = JSON.parse(jsonString);
	}
}