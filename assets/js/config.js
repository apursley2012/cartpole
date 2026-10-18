/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — config.js                                           |
  | Purpose: Defines browser simulation configuration and defaults.            |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

/**
 * Shared configuration for the browser CartPole experience.
 *
 * The learning defaults follow the attributed CartPole DQN starter values.
 * Source lineage: https://github.com/gsurma/cartpole
 * License details: ../../../../Original/docs/third-party-notices.md.
 */
// Agent learning and replay defaults.
export const AGENT_DEFAULTS = Object.freeze({
	gamma: 0.95,
	learningRate: 0.001,
	memorySize: 1_000_000,
	batchSize: 20,
	explorationRate: 1.0,
	explorationMin: 0.01,
	explorationDecay: 0.995,
	trainingMode: "legacy",
	targetSyncInterval: 100,
});

// Dense network dimensions mirror the maintained source model.
export const NETWORK_SHAPE = Object.freeze({
	input: 4,
	hidden1: 24,
	hidden2: 24,
	output: 2,
});

// Browser physics constants for the CartPole-v1-style environment.
export const CARTPOLE_DEFAULTS = Object.freeze({
	gravity: 9.8,
	massCart: 1.0,
	massPole: 0.1,
	poleHalfLength: 0.5,
	forceMagnitude: 10.0,
	timeStepSeconds: 0.02,
	thetaThresholdDegrees: 12,
	xThreshold: 2.4,
	maxSteps: 500,
});

// Named positions keep state-vector access readable across UI/rendering code.
export const STATE_INDEX = Object.freeze({
	cartPosition: 0,
	cartVelocity: 1,
	poleAngle: 2,
	poleAngularVelocity: 3,
});
