/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — dqn-agent.js                                        |
  | Purpose: Implements the browser Deep Q-Network agent.                      |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

/*
 * The DQN architecture and core hyperparameter lineage follow the CartPole
 * starter implementation associated with Grzegorz Surma's MIT-licensed source:
 * https://github.com/gsurma/cartpole
 * License details: ../../../../Original/docs/third-party-notices.md
 *
 * The browser implementation, compatibility mode, and full-backprop option
 * are maintained as project-specific JavaScript source.
 */
import { AGENT_DEFAULTS, NETWORK_SHAPE } from "./config.js";
import { ReplayBuffer } from "./replay-buffer.js";

/**
 * Small neural-network DQN agent used by the browser demo.
 *
 * The default `legacy` training mode intentionally preserves the project's
 * original learning behavior. A standards-oriented `full-backprop` mode is
 * available as an opt-in without changing the existing demo's default logic.
 */
export class DQNAgent {
	

	constructor(config = {}) {
		const settings = { ...AGENT_DEFAULTS, ...config };

		this.gamma = settings.gamma;
		this.learningRate = settings.learningRate;
		this.memorySize = settings.memorySize;
		this.batchSize = settings.batchSize;
		this.explorationRate = settings.explorationRate;
		this.explorationMin = settings.explorationMin;
		this.explorationDecay = settings.explorationDecay;
		this.trainingMode = settings.trainingMode;
		this.targetSyncInterval = settings.targetSyncInterval;
		this.trainingSteps = 0;

		this.memory = new ReplayBuffer(this.memorySize);
		this.w1 = this.createWeightMatrix(
			NETWORK_SHAPE.input,
			NETWORK_SHAPE.hidden1,
		);
		this.b1 = new Array(NETWORK_SHAPE.hidden1).fill(0);
		this.w2 = this.createWeightMatrix(
			NETWORK_SHAPE.hidden1,
			NETWORK_SHAPE.hidden2,
		);
		this.b2 = new Array(NETWORK_SHAPE.hidden2).fill(0);
		this.w3 = this.createWeightMatrix(
			NETWORK_SHAPE.hidden2,
			NETWORK_SHAPE.output,
		);
		this.b3 = new Array(NETWORK_SHAPE.output).fill(0);

		this.syncTargetNetwork();
	}

	/**
   * Create a randomly initialized weight matrix using the same initialization
   * range as the original implementation.
   */
	createWeightMatrix(rows, columns) {
		return Array.from(
			{ length: rows },
			() => Array.from(
				{ length: columns },
				() => (Math.random() - 0.5) * 0.16,
			),
		);
	}

	/**
   * Apply a dense layer.
   *
   * @param {number[]} input
   * @param {number[][]} weights
   * @param {number[]} bias
   * @param {boolean} useRelu
   * @returns {number[]}
   */
	dense(input, weights, bias, useRelu = true) {
		return bias.map((biasValue, outputIndex) => {
			let sum = biasValue;

			for (let inputIndex = 0; inputIndex < input.length; inputIndex += 1) {
				sum += input[inputIndex] * weights[inputIndex][outputIndex];
			}

			return useRelu ? Math.max(0, sum) : sum;
		});
	}

	/** Predict Q-values for the two actions using the active network.\n	 * @param {number[]} state - Cart position, velocity, angle, and angular velocity.\n	 * @returns {number[]} Q-values ordered by action (left, right).\n	 */
	predict(state) {
		return this.predictWithWeights(
			state,
			this.w1,
			this.b1,
			this.w2,
			this.b2,
			this.w3,
			this.b3,
		);
	}

	/** Predict next-state Q-values using the periodically synchronized target network.\n	 * @param {number[]} state - Four-element CartPole state.\n	 * @returns {number[]} Q-values for the two actions.\n	 */
	predictTarget(state) {
		return this.predictWithWeights(
			state,
			this.targetW1,
			this.targetB1,
			this.targetW2,
			this.targetB2,
			this.targetW3,
			this.targetB3,
		);
	}

	predictWithWeights(state, w1, b1, w2, b2, w3, b3) {
		const hidden1 = this.dense(state, w1, b1, true);
		const hidden2 = this.dense(hidden1, w2, b2, true);

		return this.dense(hidden2, w3, b3, false);
	}

	

	/**
   * Select an action using the original epsilon-greedy policy.
   *
   * @param {number[]} state
   * @returns {0|1}
   */
	act(state) {
		if (Math.random() < this.explorationRate) {
			return Math.random() < 0.5 ? 0 : 1;
		}

		const qValues = this.predict(state);
		return qValues[1] > qValues[0] ? 1 : 0;
	}

	/** Store a transition for replay. Terminal includes failure and step-limit episodes.\n	 * @param {number[]} state - State before the action.\n	 * @param {0|1} action - Selected action.\n	 * @param {number} reward - Immediate reward.\n	 * @param {number[]} nextState - State after the action.\n	 * @param {boolean} terminal - Whether the episode has ended.\n	 * @returns {void}\n	 */
	remember(state, action, reward, nextState, terminal) {
		this.memory.push({
			state: [...state],
			action,
			reward,
			nextState: [...nextState],
			terminal,
		});
	}

	

	/**
   * Train one transition.
   *
   * Legacy mode preserves the exact update behavior of the original browser
   * implementation, including updating only the second hidden and output
   * layers. Full-backprop mode is an opt-in corrected implementation.
   */
	trainSample(sample) {
		if (this.trainingMode === "full-backprop") {
			this.trainSampleWithFullBackprop(sample);
			return;
		}

		this.trainSampleLegacy(sample);
	}

	trainSampleLegacy(sample) {
		const hidden1 = this.dense(sample.state, this.w1, this.b1, true);
		const hidden2 = this.dense(hidden1, this.w2, this.b2, true);
		const output = this.dense(hidden2, this.w3, this.b3, false);
		const nextQ = this.predict(sample.nextState);
		const target =
			sample.reward +
			(
				sample.terminal
					? 0
					: this.gamma * Math.max(...nextQ)
			);
		// Bound temporal-difference errors to prevent unusually large updates.
		const error = Math.max(
			-10,
			Math.min(10, target - output[sample.action]),
		);

		for (let i = 0; i < NETWORK_SHAPE.hidden2; i += 1) {
			this.w3[i][sample.action] +=
				this.learningRate * error * hidden2[i];
		}
		this.b3[sample.action] += this.learningRate * error;

		// Preserve original ordering: hidden error uses the just-updated w3 value.
		const hidden2Error = this.w3.map(
			row => row[sample.action] * error,
		);

		for (let i = 0; i < NETWORK_SHAPE.hidden2; i += 1) {
			if (hidden2[i] <= 0) {
				continue;
			}

			for (let j = 0; j < NETWORK_SHAPE.hidden1; j += 1) {
				// Preserve the original 0.2 layer-specific update multiplier.
				this.w2[j][i] +=
					this.learningRate *
					hidden2Error[i] *
					hidden1[j] *
					0.2;
			}

			this.b2[i] +=
				this.learningRate * hidden2Error[i] * 0.2;
		}
	}

	trainSampleWithFullBackprop(sample) {
		const hidden1 = this.dense(sample.state, this.w1, this.b1, true);
		const hidden2 = this.dense(hidden1, this.w2, this.b2, true);
		const output = this.dense(hidden2, this.w3, this.b3, false);
		const nextQ = this.predictTarget(sample.nextState);
		const target =
			sample.reward +
			(
				sample.terminal
					? 0
					: this.gamma * Math.max(...nextQ)
			);
		// Bound temporal-difference errors to prevent unusually large updates.
		const error = Math.max(
			-10,
			Math.min(10, target - output[sample.action]),
		);

		// Use the same pre-update weights for every gradient; in-place updates would change backpropagation.
		const outputGradient = error;
		const hidden2Gradient = new Array(NETWORK_SHAPE.hidden2).fill(0);
		const hidden1Gradient = new Array(NETWORK_SHAPE.hidden1).fill(0);

		for (let i = 0; i < NETWORK_SHAPE.hidden2; i += 1) {
			hidden2Gradient[i] =
				hidden2[i] > 0
					? this.w3[i][sample.action] * outputGradient
					: 0;
		}

		for (let j = 0; j < NETWORK_SHAPE.hidden1; j += 1) {
			if (hidden1[j] <= 0) {
				continue;
			}

			let propagatedError = 0;

			for (let i = 0; i < NETWORK_SHAPE.hidden2; i += 1) {
				propagatedError += this.w2[j][i] * hidden2Gradient[i];
			}

			hidden1Gradient[j] = propagatedError;
		}

		for (let i = 0; i < NETWORK_SHAPE.hidden2; i += 1) {
			this.w3[i][sample.action] +=
				this.learningRate * outputGradient * hidden2[i];
		}
		this.b3[sample.action] += this.learningRate * outputGradient;

		for (let j = 0; j < NETWORK_SHAPE.hidden1; j += 1) {
			for (let i = 0; i < NETWORK_SHAPE.hidden2; i += 1) {
				this.w2[j][i] +=
					this.learningRate * hidden2Gradient[i] * hidden1[j];
			}
		}

		for (let i = 0; i < NETWORK_SHAPE.hidden2; i += 1) {
			this.b2[i] += this.learningRate * hidden2Gradient[i];
		}

		for (let k = 0; k < NETWORK_SHAPE.input; k += 1) {
			for (let j = 0; j < NETWORK_SHAPE.hidden1; j += 1) {
				this.w1[k][j] +=
					this.learningRate *
					hidden1Gradient[j] *
					sample.state[k];
			}
		}

		for (let j = 0; j < NETWORK_SHAPE.hidden1; j += 1) {
			this.b1[j] += this.learningRate * hidden1Gradient[j];
		}

		this.trainingSteps += 1;

		if (this.trainingSteps % this.targetSyncInterval === 0) {
			this.syncTargetNetwork();
		}
	}

	/** Train a replay batch only after enough experiences have accumulated.\n	 * @returns {void}\n	 */
	experienceReplay() {
		if (this.memory.length < this.batchSize) {
			return;
		}

		/*
     * Legacy mode keeps the original with-replacement batch semantics.
     * The opt-in full-backprop path uses unique samples per replay batch.
     */
		const batch =
			this.trainingMode === "full-backprop"
				? this.memory.sampleWithoutReplacement(this.batchSize)
				: this.memory.sampleWithReplacement(this.batchSize);

		for (const sample of batch) {
			this.trainSample(sample);
		}

		this.explorationRate = Math.max(
			this.explorationMin,
			this.explorationRate * this.explorationDecay,
		);
	}

	

	syncTargetNetwork() {
		/*
     * Target weights are consumed only by full-backprop mode; synchronizing
     * them does not alter the default legacy training path.
     */
		this.targetW1 = this.cloneMatrix(this.w1);
		this.targetB1 = [...this.b1];
		this.targetW2 = this.cloneMatrix(this.w2);
		this.targetB2 = [...this.b2];
		this.targetW3 = this.cloneMatrix(this.w3);
		this.targetB3 = [...this.b3];
	}

	cloneMatrix(matrix) {
		return matrix.map(row => [...row]);
	}
}
