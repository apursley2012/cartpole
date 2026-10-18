/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — cartpole-env.js                                     |
  | Purpose: Implements the browser CartPole simulation environment.           |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

/*
 * CartPole physics follow the Gym/Gymnasium classic-control formulation.
 * Source: https://github.com/Farama-Foundation/Gymnasium/blob/main/gymnasium/envs/classic_control/cartpole.py
 * License and attribution details: ../../../../Original/docs/third-party-notices.md
 */
import { CARTPOLE_DEFAULTS } from "./config.js";

/**
 * Browser implementation of the CartPole-v1 dynamics used by the original
 * interactive project.
 */
export class CartPoleEnvironment {
	constructor(config = CARTPOLE_DEFAULTS) {
		this.gravity = config.gravity;
		this.massCart = config.massCart;
		this.massPole = config.massPole;
		this.totalMass = this.massPole + this.massCart;
		this.length = config.poleHalfLength;
		this.poleMassLength = this.massPole * this.length;
		this.forceMag = config.forceMagnitude;
		this.tau = config.timeStepSeconds;
		this.thetaThresholdRadians =
			config.thetaThresholdDegrees * Math.PI / 180;
		this.xThreshold = config.xThreshold;
		this.maxSteps = config.maxSteps;

		this.reset();
	}

	/**
   * Reset the environment using the same random initialization range as the
   * original implementation.
   *
   * @returns {number[]} A copy of the four-value environment state.
   */
	reset() {
		this.state = Array.from(
			{ length: 4 },
			() => Math.random() * 0.1 - 0.05,
		);
		this.steps = 0;

		return [...this.state];
	}

	/**
   * Advance the environment by one action.
   *
   * `terminal` is retained for backward compatibility. `terminated` and
   * `truncated` are additional metadata and do not change existing behavior.
   *
   * @param {0|1} action 0 applies left force; 1 applies right force.
   * @returns {{
   *   state: number[],
   *   reward: number,
   *   terminal: boolean,
   *   terminated: boolean,
   *   truncated: boolean,
   *   score: number
   * }}
   */
	step(action) {
		if (action !== 0 && action !== 1) {
			throw new RangeError(`Action must be 0 or 1; received ${String(action)}.`);
		}

		const [x, xDot, theta, thetaDot] = this.state;
		const force = action === 1 ? this.forceMag : -this.forceMag;
		const cosTheta = Math.cos(theta);
		const sinTheta = Math.sin(theta);

		/*
     * Keep the equation order close to Gymnasium's classic-control source so
     * the browser physics can be compared directly with the referenced model.
     */
		const temp =
			(
				force +
				this.poleMassLength * thetaDot * thetaDot * sinTheta
			) / this.totalMass;

		const thetaAcc =
			(this.gravity * sinTheta - cosTheta * temp) /
			(
				this.length *
				(
					4 / 3 -
					this.massPole * cosTheta * cosTheta / this.totalMass
				)
			);

		const xAcc =
			temp -
			this.poleMassLength * thetaAcc * cosTheta / this.totalMass;

		// Use explicit Euler integration to match the referenced CartPole model.
		this.state = [
			x + this.tau * xDot,
			xDot + this.tau * xAcc,
			theta + this.tau * thetaDot,
			thetaDot + this.tau * thetaAcc,
		];
		this.steps += 1;

		/*
     * Track physical failure separately from the 500-step time limit while
     * retaining the combined `terminal` flag used by the existing agent.
     */
		const terminated =
			Math.abs(this.state[0]) > this.xThreshold ||
			Math.abs(this.state[2]) > this.thetaThresholdRadians;
		const truncated = this.steps >= this.maxSteps;
		const terminal = terminated || truncated;

		return {
			state: [...this.state],
			// Preserve the original reward rule exactly.
			reward: terminal && this.steps < this.maxSteps ? -1 : 1,
			terminal,
			terminated,
			truncated,
			score: this.steps,
		};
	}
}
