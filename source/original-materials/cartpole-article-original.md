# Teaching an AI Agent to Balance: A Deep Q-Learning Approach to CartPole

The CartPole problem is a reinforcement learning challenge where an agent controls a cart that can move left or right while trying to keep a pole balanced upright. The task is simple to understand, but it requires the agent to learn timing, correction, and long-term decision-making from repeated interaction with the environment.

The original project used a Deep Q-Network training workflow. The agent observed the cart position, cart velocity, pole angle, and pole velocity, then selected one of two actions: move left or move right. Over repeated runs, the agent stored experiences, replayed batches of past decisions, and adjusted its Q-value predictions.

The central equation from the original code is:

```python
q_update = reward + GAMMA * np.amax(self.model.predict(state_next)[0])
```

This equation combines the immediate reward with the best predicted future reward from the next state. The value of `GAMMA` is `0.95`, which means the agent gives strong weight to future outcomes. That is important in CartPole because a move that looks useful in one moment may cause the pole to fall later. The agent has to learn stability, not just quick reaction.

The browser version turns the Python notebook into a static front-end demo. It keeps the same major learning flow: a CartPole-v1 style environment, a DQN solver, replay memory, exploration decay, score tracking, and a solve goal of an average score of 195 across 100 runs. Since GitHub Pages cannot run Python, Gym, or Keras directly, the neural network is recreated in vanilla JavaScript with the same dense-layer structure from the notebook: 24 ReLU units, another 24 ReLU units, and a linear two-action output layer.

The result is a portfolio-friendly app that makes the learning process visible. Instead of only reading notebook output, viewers can watch the cart move, run training episodes, monitor exploration, and see how the score changes over time.
