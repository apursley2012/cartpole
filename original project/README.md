# Original CartPole Python Project

**Author:** Alysha Pursley

This directory contains the maintained version of my original Python/Jupyter CartPole Deep Q-Learning project. This is the pre-demo project I built before the repository gained the browser presentation. The sibling `../Updated/web-demo/` directory contains the separate static HTML/CSS/JavaScript demo of the same control problem.

## What is here

- `cartpole.py` — runnable Python training entry point.
- `cartpole.ipynb` — notebook form of the maintained training workflow.
- `scores/score_logger.py` — score persistence, chart generation, and solve-condition reporting.
- `requirements.txt` — Python runtime dependencies.

My original notebook referenced `scores.score_logger.ScoreLogger`, but the surviving repository/archive copy did not include that module, so that preserved copy could not run end to end. This maintained source restores that required component using the behavior of the MIT-licensed upstream logger documented in `docs/third-party-notices.md`.

## Running the source project

Python 3.10+ is recommended.

```bash
cd original-project
python -m venv .venv
```

Activate the virtual environment using the command for the local operating system, then install dependencies and run:

```bash
python -m pip install -r requirements.txt
python cartpole.py
```

The training loop is stochastic and can run for a substantial amount of time. Generated `scores.csv`, `scores.png`, `solved.csv`, and `solved.png` files are runtime output and are not part of the packaged source.

## Preserved behavior

The maintained source keeps the established project behavior that matters to the learning exercise:

- CartPole-v1 environment
- four observations and two actions
- 24-unit ReLU hidden layer
- second 24-unit ReLU hidden layer
- linear two-action output
- gamma `0.95`
- learning rate `0.001`
- replay capacity `1,000,000`
- replay batch size `20`
- epsilon-greedy exploration from `1.0` to `0.01`
- exploration decay `0.995`
- terminal reward inversion
- score goal of `195` averaged across `100` consecutive runs

Compatibility updates use Gymnasium's current reset/step API, current Keras optimizer arguments, explicit environment cleanup, and Python 3 syntax.

## Source attribution

The DQN starter structure and score-logging behavior closely follow Grzegorz Surma's MIT-licensed CartPole implementation. The complete citation and license notice are in `docs/third-party-notices.md`.

Gymnasium provides the CartPole environment itself and is separately attributed there.
