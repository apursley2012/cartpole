/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — replay-buffer.js                                    |
  | Purpose: Manages experience replay for browser training.                   |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

/**
 * Fixed-capacity replay memory backed by a circular buffer.
 *
 * This replaces Array#shift() while preserving the same logical behavior:
 * once full, the oldest experience is discarded when a new one is added.
 */
export class ReplayBuffer {
	// Circular-buffer state. #start always identifies the oldest stored item.
	#items;
	#start = 0;
	#size = 0;

	/** @param {number} capacity - Positive integer; invalid values throw RangeError. */
	constructor(capacity) {
		if (!Number.isInteger(capacity) || capacity <= 0) {
			throw new RangeError("ReplayBuffer capacity must be a positive integer.");
		}

		this.capacity = capacity;
		this.#items = new Array(capacity);
	}

	get length() {
		return this.#size;
	}

	/** Add an experience, overwriting the oldest entry once capacity is reached.
 * @param {*} value - Experience stored by the agent.
 * @returns {void}
 */
	push(value) {
		const writeIndex = (this.#start + this.#size) % this.capacity;

		if (this.#size < this.capacity) {
			this.#items[writeIndex] = value;
			this.#size += 1;
			return;
		}

		this.#items[this.#start] = value;
		this.#start = (this.#start + 1) % this.capacity;
	}

	/** @param {number} index - Logical oldest-first index.
 * @returns {*|undefined} Stored experience, or undefined outside the buffer.
 */
	at(index) {
		if (!Number.isInteger(index) || index < 0 || index >= this.#size) {
			return undefined;
		}

		return this.#items[(this.#start + index) % this.capacity];
	}

	// Legacy browser training samples with replacement to preserve behavior.
	/** Sample with replacement to preserve legacy replay semantics.
 * @param {number} count - Non-negative requested sample size.
 * @param {() => number} random - Random value in [0, 1).
 * @returns {Array<*>} Experiences; throws on invalid counts or empty source.
 */
	sampleWithReplacement(count, random = Math.random) {
		if (!Number.isInteger(count) || count < 0) {
			throw new RangeError("Sample count must be a non-negative integer.");
		}
		if (count > 0 && this.#size === 0) {
			throw new RangeError("Cannot sample from an empty replay buffer.");
		}

		return Array.from({ length: count }, () => {
			const index = Math.floor(random() * this.#size);
			return this.at(index);
		});
	}

	/** Sample unique experiences for the opt-in full-backprop training mode.
 * @param {number} count - Must not exceed the stored experience count.
 * @param {() => number} random - Random value in [0, 1).
 * @returns {Array<*>} Experiences; throws RangeError for invalid counts.
 */
	sampleWithoutReplacement(count, random = Math.random) {
		if (!Number.isInteger(count) || count < 0) {
			throw new RangeError("Sample count must be a non-negative integer.");
		}
		if (count > this.#size) {
			throw new RangeError("Cannot sample more unique items than the buffer contains.");
		}

		const indices = Array.from({ length: this.#size }, (_, index) => index);

		/*
     * A partial Fisher-Yates shuffle is enough because only `count` positions
     * are returned; the untouched suffix never needs to be randomized.
     */

		for (let i = 0; i < count; i += 1) {
			const swapIndex = i + Math.floor(random() * (indices.length - i));
			[indices[i], indices[swapIndex]] = [indices[swapIndex], indices[i]];
		}

		return indices.slice(0, count).map(index => this.at(index));
	}
}
