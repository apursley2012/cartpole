# +----------------------------------------------------------------------------+
# | CartPole Balance Lab — score_logger.py                                     |
# | Purpose: Records training scores and creates score visualizations.         |
# | Author: Alysha Pursley                                                     |
# | Copyright: Preserve original and third-party notices; see notices.         |
# +----------------------------------------------------------------------------+
"""
============================================================================
Persist CartPole training scores, generate charts, and report solve status.

This module owns file-based score output and plotting for the original
Python/Jupyter implementation so those side effects stay separate from DQN
training. Its behavior follows Grzegorz Surma's MIT-licensed CartPole score
logger; attribution and license details are recorded in
../docs/third-party-notices.md.

Project integration/maintenance: Alysha Pursley.
============================================================================
"""

import csv
from collections import deque
from pathlib import Path
from statistics import mean

import matplotlib

# Render charts directly to files so training does not depend on a GUI backend.
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


# ============================================================================
# Output Paths
# ============================================================================

SCORES_DIR = Path(__file__).resolve().parent
SCORES_CSV_PATH = SCORES_DIR / "scores.csv"
SCORES_PNG_PATH = SCORES_DIR / "scores.png"
SOLVED_CSV_PATH = SCORES_DIR / "solved.csv"
SOLVED_PNG_PATH = SCORES_DIR / "solved.png"

# ============================================================================
# Solve Criteria
# ============================================================================

AVERAGE_SCORE_TO_SOLVE = 195
CONSECUTIVE_RUNS_TO_SOLVE = 100


# ============================================================================
# Score Persistence and Chart Generation
# ============================================================================

class ScoreLogger:
    """Persist run scores and generate the original project charts."""

    def __init__(self, env_name):
        self.scores = deque(maxlen=CONSECUTIVE_RUNS_TO_SOLVE)
        self.env_name = env_name

        for path in (SCORES_PNG_PATH, SCORES_CSV_PATH):
            path.unlink(missing_ok=True)

    def add_score(self, score, run):
        """Record one run and return True when the solve condition is met."""
        self._save_csv(SCORES_CSV_PATH, score)
        self._save_png(
            input_path=SCORES_CSV_PATH,
            output_path=SCORES_PNG_PATH,
            x_label="runs",
            y_label="scores",
            average_of_n_last=CONSECUTIVE_RUNS_TO_SOLVE,
            show_goal=True,
            show_trend=True,
            show_legend=True,
        )

        self.scores.append(score)
        mean_score = mean(self.scores)
        print(
            "Scores: "
            f"(min: {min(self.scores)}, "
            f"avg: {mean_score}, "
            f"max: {max(self.scores)})\n"
        )

        solved = (
            mean_score >= AVERAGE_SCORE_TO_SOLVE
            and len(self.scores) >= CONSECUTIVE_RUNS_TO_SOLVE
        )
        if not solved:
            return False

        # ============================================================================
        # Match the established logger definition: the solve point is the run
        # preceding the 100-run window whose average first reaches the goal.
        # ============================================================================
        solve_score = run - CONSECUTIVE_RUNS_TO_SOLVE
        print(f"Solved in {solve_score} runs, {run} total runs.")

        self._save_csv(SOLVED_CSV_PATH, solve_score)
        self._save_png(
            input_path=SOLVED_CSV_PATH,
            output_path=SOLVED_PNG_PATH,
            x_label="trials",
            y_label="steps before solve",
            average_of_n_last=None,
            show_goal=False,
            show_trend=False,
            show_legend=False,
        )
        return True

    def _save_png(
        self,
        input_path,
        output_path,
        x_label,
        y_label,
        average_of_n_last,
        show_goal,
        show_trend,
        show_legend,
    ):
        x_values, y_values = self._read_scores(input_path)

        figure, axis = plt.subplots()
        axis.plot(x_values, y_values, label="score per run")

        average_range = (
            average_of_n_last
            if average_of_n_last is not None
            else len(x_values)
        )
        average_values = y_values[-average_range:]
        axis.plot(
            x_values[-average_range:],
            [np.mean(average_values)] * len(average_values),
            linestyle="--",
            label=f"last {average_range} runs average",
        )

        if show_goal:
            axis.plot(
                x_values,
                [AVERAGE_SCORE_TO_SOLVE] * len(x_values),
                linestyle=":",
                label=f"{AVERAGE_SCORE_TO_SOLVE} score average goal",
            )

        # A linear trend needs at least two post-initial data points.
        if show_trend and len(x_values) > 2:
            trend_x = x_values[1:]
            coefficients = np.polyfit(
                np.array(trend_x),
                np.array(y_values[1:]),
                1,
            )
            trend = np.poly1d(coefficients)
            axis.plot(
                trend_x,
                trend(trend_x),
                linestyle="-.",
                label="trend",
            )

        axis.set_title(self.env_name)
        axis.set_xlabel(x_label)
        axis.set_ylabel(y_label)

        if show_legend:
            axis.legend(loc="upper left")

        figure.savefig(output_path, bbox_inches="tight")
        plt.close(figure)

    @staticmethod
    def _read_scores(path):
        with path.open("r", newline="", encoding="utf-8") as scores_file:
            rows = csv.reader(scores_file)
            y_values = [int(row[0]) for row in rows]

        return list(range(len(y_values))), y_values

    @staticmethod
    def _save_csv(path, score):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", newline="", encoding="utf-8") as scores_file:
            csv.writer(scores_file).writerow([score])
