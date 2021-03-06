/**
 * General structure for a fully-connected layer of nodes
 */

class Layer {
	/**
	 * Layer constructor
	 * @param inputs The number of input this layer will recieve, that is, the number of nodes in the previous layer
	 * @param nodes The number of hidden nodes for this layer
	 * @param activationFunction String name for the activation function to be used in this layer. Currently only supports 'sigmoid'
	 */
	constructor(inputs, nodes, activationFunction, learningRate) {
		this.numInputs = inputs + 1; // Add one for bias
		this.numNodes = nodes;
		this.C = learningRate;
		this.activationFunction = activationFunction;
		this.weights = [];
		this.myInput = new Array(this.numInputs);
		this.myOutput = new Array(this.numNodes + 1);
		//Bias node always outputs 1
		this.myOutput[this.numNodes] = 1;
		this.myError = new Array(this.numNodes);
		this.initializeWeights();
	}
	
	/**
	 * Layer copy constructor. Used when recreating model from JSON string
	 * @param object Layer object as object
	 */
	copyConstructor(object) {
		this.numInputs = object.numInputs;
		this.numNodes = object.numNodes;
		this.C = object.C;
		this.activationFunction = object.activationFunction;
		this.weights = object.weights;
		this.myInput = object.myInput;
		this.myOutput = object.myOutput;
		this.myError = object.myError;
	}

	/**
	 * @return Number of nodes in this layer, including bias node
	 */
	getNodes() {
		// Add one to account for bias node
		return numNodes + 1;
	}
	
	activate(net) {
		switch(this.activationFunction) {
			default:
				return this.sigmoid(net);
		}
	}
	
	derivative(out) {
		switch(this.activationFunction) {
			default:
				return this.derivativeSigmoid(out);
		}
	}

	/**
	 * Sigmoid activation function
	 */
	sigmoid(net) {
		return 1/(1 + Math.pow(Math.E, (net * -1)));
	}

	/**
	 * Derivative of sigmoid activation function
	 */
	derivativeSigmoid(out) {
		return out * (1 - out);
	}

	/**
	 * Initializes weights from all nodes of previous layer to all nodes in
	 *  this layer, assuming full conenction. Initialization is random
	 *  values between -0.1 and 0.1
	 */
	initializeWeights() {
		// Create weights for each node
		for (let n = 0; n < this.numNodes; n++) {
			let nodeWeights = [];
			// Each input gets a random weight
			for (let i = 0; i < this.numInputs; i++) {
				// Add a random weight between -1 and 1
				nodeWeights.push(Math.random()*2 - 1);
			}
			this.weights.push(nodeWeights);
		}
	}
	
	coordStringToInt(coord) {
		if (coord === "PASS")
			return -1;
		let bits = coord.split("-");
		let num = 0;
		num = (parseInt(bits[0]) - 1) * 8 + (parseInt(bits[1] - 1));
		return num;
	}

	/**
	 * Prepare output of nodes of this layer given input from previous layer
	 * @param error Array of output from nodes of previous layer
	 * @return Array of output from nodes in this layer
	 */
	setInput(input) {
		// Ensure that number of inputs matches expected
		if (input.length != this.numInputs) {
			console.log("Unexpected number of inputs");
			return null;
		}

		this.myInput = input.slice();
		// Iterate over each node, store output
		for (let n = 0; n < this.numNodes; n++) {
			// Sum net from inputs * weights
			let net = 0;
			let nodeWeights = this.weights[n];
			for (let i = 0; i < nodeWeights.length; i++) {
				if (typeof this.myInput[i] == "string")
					this.myInput[i] = this.coordStringToInt(this.myInput[i]);
				net += nodeWeights[i] * this.myInput[i];
			}
			this.myOutput[n] = this.activate(net);
		}
		return this.myOutput;
	}

	/**
	 * Get output without changing the input
	 * @return Array of output from nodes in this layer
	 */
	getOutput() {
		return this.myOutput;
	}

	/**
	 * Calculates part of the target for the previous layer given the same from
	 *  the next layer. For output layer, this should be the output minus
	 *  expected; for the hidden layers it is the sum of next layer's outputs
	 *  times the weight to the nodes from this layer.
	 * @param error Array of target for this layer's nodes from next layer
	 * @return Array of target for nodes of previous layer
	 */
	backpropError(target) {
		// Ensure that number of inputs matches expected
		if (target.length != this.numNodes) {
			console.log("Unexpected number of inputs");
			return null;
		}

		// The error for each node in this layer is it's target
		for (let n = 0; n < this.numNodes; n++) {
			let nodeError = target[n];
			nodeError *= this.derivative(this.myOutput[n]);
			this.myError[n] = nodeError;
		}

		// Find target of previous layer using the weights
		let previousLayerTarget = [];
		for (let i = 0; i < this.numInputs - 1; i++) {
			let nodeTarget = 0;
			// Input node's target is weighted error of each node in this layer
			for (let n = 0; n < this.numNodes; n++) {
				nodeTarget += this.weights[n][i] * this.myError[n];
			}
			previousLayerTarget.push(nodeTarget);
		}
		return previousLayerTarget;
	}

	/**
	 * Adjust weights of this layer according to output of input layer. It is
	 *  HIGHLY recommended that this be used only after backpropagating error
	 *  to the previous layer using backpropError() method.
	 */
	adjustWeights() {
		for (let n = 0; n < this.numNodes; n++) {
			for (let i = 0; i < this.numInputs; i++) {
				let deltaWeight = this.C * this.myInput[i] * this.myError[n];
				this.weights[n][i] += deltaWeight;
			}
		}
	}

	/**
	 * Calculates and returns the SSE in the current layer
	 * @return SSE in the current layer
	 */
	getSSE() {
		let SSE = 0;
		for (let n = 0; n < this.numNodes; n++) {
			SSE += Math.pow(this.myError[n], 2);
		}
		return SSE;
	}
}
