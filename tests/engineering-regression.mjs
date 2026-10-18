/*
 * ============================================================================
 * CartPole // Balance Lab — engineering-regression.mjs
 * Checks replay memory, agent learning modes, and environment boundaries.
 * Project author: Alysha Pursley
 * ============================================================================
 */
import assert from "node:assert/strict";
import { ReplayBuffer } from "../assets/js/replay-buffer.js";
import { DQNAgent } from "../assets/js/dqn-agent.js";
import { CartPoleEnvironment } from "../assets/js/cartpole-env.js";

for (const capacity of [0, -1, 1.2, NaN, "4"]) {
  assert.throws(() => new ReplayBuffer(capacity), RangeError);
}
const buffer = new ReplayBuffer(3);
for (let value = 0; value < 10_000; value += 1) buffer.push(value);
assert.equal(buffer.length, 3);
assert.deepEqual([buffer.at(0), buffer.at(1), buffer.at(2)], [9997, 9998, 9999]);
assert.equal(buffer.at(3), undefined);
assert.equal(buffer.at(-1), undefined);
assert.deepEqual(buffer.sampleWithoutReplacement(3, () => 0), [9997, 9998, 9999]);

const initialState = [0, 0, 0, 0];
for (const trainingMode of ["legacy", "full-backprop"]) {
  const agent = new DQNAgent({
    trainingMode,
    batchSize: 2,
    memorySize: 3,
    targetSyncInterval: 1,
  });
  assert.equal(agent.predict(initialState).length, 2);
  agent.remember(initialState, 0, 1, initialState, false);
  agent.experienceReplay();
  assert.equal(agent.memory.length, 1);
  agent.remember(initialState, 1, -1, initialState, true);
  agent.experienceReplay();
  assert.equal(agent.memory.length, 2);
  assert.ok(agent.predict(initialState).every(Number.isFinite));
  assert.ok(agent.explorationRate < 1);
}

const env = new CartPoleEnvironment();
env.state = [0, 0, 0, 0];
const left = env.step(0);
assert.equal(left.state[0], 0);
assert.equal(left.state[2], 0);
assert.ok(left.state[1] < 0);
assert.ok(left.state[3] > 0);
env.state = [0, 0, 0, 0];
env.steps = 0;
const right = env.step(1);
assert.ok(right.state[1] > 0);
assert.ok(right.state[3] < 0);
console.log("Engineering regression checks passed.");
