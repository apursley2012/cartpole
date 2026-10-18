# Third-Party Notices

Author: Alysha Pursley

I keep external code and reference material explicitly attributed so the project does not present third-party work as my original source. The license blocks below are reproduced from the cited projects as required notices.

## CartPole DQN starter lineage

The Python DQN structure in `source/cartpole.py` and `source/cartpole.ipynb` is based on the CartPole starter code that accompanied the original project materials. That starter implementation closely matches Grzegorz Surma's public CartPole DQN project, including the network shape, hyperparameters, replay-memory pattern, epsilon-greedy action selection, and `ScoreLogger` integration.

Source:

- Grzegorz Surma, **cartpole**: https://github.com/gsurma/cartpole
- License: MIT
- Copyright: © 2018 Grzegorz Surma

My maintained Python source keeps that learning structure while adding current Gymnasium/Keras API handling, explicit environment cleanup, clearer naming/comments, and repository integration. `source/scores/score_logger.py` provides the logger required by the original training loop and follows the behavior of Surma's MIT-licensed `scores/score_logger.py`.

### MIT license notice for Grzegorz Surma's CartPole project

```text
MIT License

Copyright (c) 2018 Grzegorz Surma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## CartPole environment dynamics

The browser environment in `assets/js/cartpole-env.js` follows the standard CartPole classic-control equations and termination thresholds used by Gym/Gymnasium. The implementation is organized for this project's browser runtime, but the underlying environment formulation is not presented as an original invention.

Sources:

- Gymnasium CartPole source: https://github.com/Farama-Foundation/Gymnasium/blob/main/gymnasium/envs/classic_control/cartpole.py
- Gymnasium CartPole documentation: https://gymnasium.farama.org/environments/classic_control/cart_pole/
- License: MIT
- Copyright: © 2016 OpenAI; © 2022 Farama Foundation

The Gymnasium source also credits the classic CartPole implementation by Rich Sutton and the CartPole problem described by Barto, Sutton, and Anderson.

### MIT license notice for Gymnasium

```text
The MIT License

Copyright (c) 2016 OpenAI
Copyright (c) 2022 Farama Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Runtime libraries

The maintained notebook imports third-party libraries rather than vendoring their source:

- NumPy: https://numpy.org/
- Keras: https://keras.io/
- Gymnasium: https://gymnasium.farama.org/

Their source code is not copied into this repository. Their names, APIs, and licenses remain the property of their respective projects.

## Project-authored source

Unless a file or section is specifically identified above as derived from or dependent on third-party material, the project-specific HTML, CSS, browser application structure, tests, documentation, and integration code are authored under Alysha Pursley's project authorship.
