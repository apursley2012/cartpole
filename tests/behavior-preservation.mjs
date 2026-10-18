/*
 * ============================================================================
 * CartPole // Balance Lab — behavior-preservation.mjs
 * Focused Node regression checks for browser-demo domain modules.
 * No DOM or network access required; run with `node tests/behavior-preservation.mjs`
 * from web-demo/, or `node web-demo/tests/behavior-preservation.mjs` from root.
 * Project author: Alysha Pursley
 * ============================================================================
 */
import assert from "node:assert/strict";
import { CartPoleEnvironment } from "../assets/js/cartpole-env.js";
import { DQNAgent } from "../assets/js/dqn-agent.js";
import { ReplayBuffer } from "../assets/js/replay-buffer.js";
import { AGENT_DEFAULTS, CARTPOLE_DEFAULTS } from "../assets/js/config.js";

// Check behavior and boundaries without modifying production code.
assert.equal(CARTPOLE_DEFAULTS.maxSteps, 500);
assert.equal(AGENT_DEFAULTS.gamma, 0.95);
assert.equal(AGENT_DEFAULTS.batchSize, 20);
assert.equal(AGENT_DEFAULTS.trainingMode, "legacy");

const environment = new CartPoleEnvironment();
assert.equal(environment.reset().length, 4);
assert.throws(() => environment.step(-1), RangeError);
assert.throws(() => environment.step(2), RangeError);
const transition = environment.step(0);
assert.equal(transition.state.length, 4);
assert.ok(transition.state.every(Number.isFinite));
assert.equal(typeof transition.terminal, "boolean");
assert.equal(typeof transition.terminated, "boolean");
assert.equal(typeof transition.truncated, "boolean");

const replay = new ReplayBuffer(2);
assert.equal(replay.length, 0);
assert.deepEqual(replay.sampleWithReplacement(0), []);
assert.throws(() => replay.sampleWithReplacement(1), RangeError);
for (const invalid of [-1, 0.5, NaN, "1"]) {
  assert.throws(() => replay.sampleWithReplacement(invalid), RangeError);
  assert.throws(() => replay.sampleWithoutReplacement(invalid), RangeError);
}
replay.push("first");
replay.push("second");
replay.push("third");
assert.equal(replay.length, 2);
assert.equal(replay.at(0), "second");
assert.equal(replay.at(1), "third");
assert.deepEqual(replay.sampleWithReplacement(2, () => 0), ["second", "second"]);
assert.deepEqual(replay.sampleWithoutReplacement(2, () => 0), ["second", "third"]);
assert.throws(() => replay.sampleWithoutReplacement(3), RangeError);

const agent = new DQNAgent({ explorationRate: 0 });
const values = agent.predict([0, 0, 0, 0]);
assert.equal(values.length, 2);
assert.ok(values.every(Number.isFinite));
assert.ok([0, 1].includes(agent.act([0, 0, 0, 0])));
console.log("CartPole behavior-preservation regression checks passed.");
