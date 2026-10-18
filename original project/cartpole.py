#!/usr/bin/env python3
# +----------------------------------------------------------------------------+
# | CartPole Balance Lab — cartpole.py                                         |
# | Purpose: Runs the original Python CartPole reinforcement-learning          |
# | workflow.                                                                  |
# | Author: Alysha Pursley                                                     |
# | Copyright: Preserve original and third-party notices; see notices.         |
# +----------------------------------------------------------------------------+
"""
============================================================================
Run the maintained Python Deep Q-Network training workflow for CartPole-v1.

This module owns the DQN agent, Gymnasium compatibility helpers, and training
loop for the original Python/Jupyter implementation. The DQN structure and
hyperparameters retain the starter lineage documented in
docs/third-party-notices.md.

Project author/maintainer: Alysha Pursley.
============================================================================
"""

import random
from collections import deque

import gymnasium as gym
import numpy as np
from keras.layers import Dense, Input
from keras.models import Sequential
from keras.optimizers import Adam

from scores.score_logger import ScoreLogger


# ============================================================================
# Training Configuration
# ============================================================================

ENV_NAME = "CartPole-v1"

GAMMA = 0.95
LEARNING_RATE = 0.001

MEMORY_SIZE = 1_000_000
BATCH_SIZE = 20

EXPLORATION_MAX = 1.0
EXPLORATION_MIN = 0.01
EXPLORATION_DECAY = 0.995


# ============================================================================
# Deep Q-Network Agent
# ============================================================================

class DQNSolver:
    """Train the two-action value model used by the CartPole agent."""

    def __init__(self, observation_space, action_space):
        self.exploration_rate = EXPLORATION_MAX
        self.action_space = action_space
        self.memory = deque(maxlen=MEMORY_SIZE)

        self.model = Sequential(
            [
                Input(shape=(observation_space,)),
                Dense(24, activation="relu"),
                Dense(24, activation="relu"),
                Dense(self.action_space, activation="linear"),
            ]
        )
        self.model.compile(
            loss="mse",
            optimizer=Adam(learning_rate=LEARNING_RATE),
        )

    def remember(self, state, action, reward, next_state, done):
        """Store one transition in replay memory."""
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state):
        """Choose an action with the established epsilon-greedy policy."""
        if np.random.rand() < self.exploration_rate:
            return random.randrange(self.action_space)

        q_values = self.model.predict(state, verbose=0)
        return int(np.argmax(q_values[0]))

    def experience_replay(self):
        """Train from a random sample of prior transitions."""
        if len(self.memory) < BATCH_SIZE:
            return

        batch = random.sample(self.memory, BATCH_SIZE)

        for state, action, reward, next_state, terminal in batch:
            q_update = reward

            if not terminal:
                next_q_values = self.model.predict(next_state, verbose=0)[0]
                q_update = reward + GAMMA * np.amax(next_q_values)

            q_values = self.model.predict(state, verbose=0)
            q_values[0][action] = q_update

            # Preserve the original one-target-per-transition fit sequence.
            self.model.fit(state, q_values, verbose=0)

        self.exploration_rate *= EXPLORATION_DECAY
        self.exploration_rate = max(
            EXPLORATION_MIN,
            self.exploration_rate,
        )


# ============================================================================
# Gymnasium Compatibility Helpers
# ============================================================================

def reset_environment(env):
    """Return the observation from the Gymnasium reset result."""
    observation, _info = env.reset()
    return observation


def step_environment(env, action):
    """Combine Gymnasium termination states for the established training loop."""
    next_state, reward, terminated, truncated, info = env.step(action)
    terminal = terminated or truncated
    return next_state, reward, terminal, info


# ============================================================================
# Training Loop
# ============================================================================

def cartpole():
    """Train until the score logger reports the established solve condition."""
    env = gym.make(ENV_NAME)
    score_logger = ScoreLogger(ENV_NAME)
    observation_space = env.observation_space.shape[0]
    action_space = env.action_space.n
    dqn_solver = DQNSolver(observation_space, action_space)
    run = 0

    try:
        while True:
            run += 1
            state = reset_environment(env)
            state = np.reshape(state, [1, observation_space])
            step = 0

            while True:
                step += 1
                action = dqn_solver.act(state)
                next_state, reward, terminal, _info = step_environment(
                    env,
                    action,
                )
                # Preserve the original terminal penalty before replay storage.
                reward = reward if not terminal else -reward
                next_state = np.reshape(
                    next_state,
                    [1, observation_space],
                )

                dqn_solver.remember(
                    state,
                    action,
                    reward,
                    next_state,
                    terminal,
                )
                state = next_state

                if terminal:
                    print(
                        f"Run: {run}, "
                        f"exploration: {dqn_solver.exploration_rate}, "
                        f"score: {step}"
                    )
                    if score_logger.add_score(step, run):
                        return
                    break

                dqn_solver.experience_replay()
    finally:
        env.close()


if __name__ == "__main__":
    cartpole()
