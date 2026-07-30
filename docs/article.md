# How a Deep Q-Network Learns to Balance

CartPole looks simple: move a cart left or right and keep the pole upright. The challenge is that every action changes the next state, so the agent has to learn which short-term corrections support long-term stability.

My Deep Q-Network uses four observations: cart position, cart velocity, pole angle, and pole velocity. From those values, it chooses one of two actions—left or right—then stores the result so it can learn from the decision later.

The central equation from the original code is:

```python
q_update = reward + GAMMA * np.amax(self.model.predict(state_next)[0])
```

This equation combines the immediate reward with the best predicted future reward from the next state. The value of `GAMMA` is `0.95`, which means the agent gives strong weight to future outcomes. That is important in CartPole because a move that looks useful in one moment may cause the pole to fall later. The agent has to learn stability, not just quick reaction.

The browser version turns the Python notebook into a static front-end demo. It keeps the same major learning flow: a CartPole-v1 style environment, a DQN solver, replay memory, exploration decay, score tracking, and a solve goal of an average score of 195 across 100 runs. Since GitHub Pages cannot run Python, Gym, or Keras directly, the neural network is recreated in vanilla JavaScript with the same dense-layer structure from the notebook: 24 ReLU units, another 24 ReLU units, and a linear two-action output layer.

The result makes the learning process visible. Visitors can watch the cart move, run training episodes, monitor exploration and replay memory, or take manual control to experience the balancing problem themselves.
