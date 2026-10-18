/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — app.js                                              |
  | Purpose: Coordinates the browser simulation, controls, and rendering.      |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { CartPoleEnvironment } from "./cartpole-env.js";
import { DQNAgent } from "./dqn-agent.js";
import { STATE_INDEX } from "./config.js";


const DRAWING = Object.freeze({
	trackStartX: 70,
	trackEndX: 850,
	trackY: 420,
	trackTickCount: 20,
	trackTickSpacing: 39,
	positionScale: 125,
	cartY: 370,
	cartHalfWidth: 78,
	cartHalfHeight: 37,
	cartWidth: 156,
	cartHeight: 74,
	cartRadius: 20,
	wheelOffsetX: 55,
	wheelOffsetY: 45,
	wheelRadius: 21,
	wheelHubRadius: 9,
	poleLength: 180,
	poleBaseOffsetY: 45,
	poleWidth: 18,
	pivotRadius: 21,
	pivotHubRadius: 9,
});

const COLORS = Object.freeze({
	paper: "#FFFDF6",
	ink: "#11172B",
	line: "#D7DCE8",
	coral: "#FF5F57",
	yellow: "#FFD65A",
	blue: "#4E78FF",
});

const SCORE_HISTORY_LIMIT = 100;
const TRAINING_LOG_LIMIT = 200;
const CONTINUOUS_STEPS_PER_FRAME = 4;
const CHART = Object.freeze({
	gridStartY: 30,
	gridSpacingY: 45,
	plotStartX: 48,
	plotEndPaddingX: 20,
	plotBottomPadding: 24,
	plotHorizontalPadding: 70,
	plotVerticalPadding: 48,
	// Keep the chart scale stable until scores exceed the CartPole-v1 step cap.
	minimumScoreScale: 500,
});


const environment = new CartPoleEnvironment();
let agent = new DQNAgent();
let state = environment.reset();
let running = false;
let manualMode = false;
let episode = 0;
// Keep only the rolling score window shown by the UI and chart.
let scores = [];
let pendingSingleEpisode = false;


/**
 * Return a required DOM element and fail with a useful message if markup and
 * JavaScript ever drift out of sync.
 *
 * @param {string} id
 * @returns {HTMLElement}
 */
function getRequiredElement(id) {
	const element = document.getElementById(id);

	if (!element) {
		throw new Error(`Missing required element: #${id}`);
	}

	return element;
}

const elements = Object.freeze({
	canvas: getRequiredElement("cartpoleCanvas"),
	chart: getRequiredElement("scoreChart"),
	trainingLog: getRequiredElement("trainingLog"),
	startButton: getRequiredElement("startBtn"),
	episodeButton: getRequiredElement("episodeBtn"),
	pauseButton: getRequiredElement("pauseBtn"),
	resetButton: getRequiredElement("resetBtn"),
	clearLogButton: getRequiredElement("clearLogBtn"),
	agentModeButton: getRequiredElement("agentModeBtn"),
	manualModeButton: getRequiredElement("manualModeBtn"),
	leftButton: getRequiredElement("leftBtn"),
	rightButton: getRequiredElement("rightBtn"),
	manualControls: getRequiredElement("manualControls"),
	modeText: getRequiredElement("modeText"),
	statusText: getRequiredElement("statusText"),
	episodeCount: getRequiredElement("episodeCount"),
	scoreValue: getRequiredElement("scoreValue"),
	averageScore: getRequiredElement("averageScore"),
	bestScore: getRequiredElement("bestScore"),
	epsilonValue: getRequiredElement("epsilonValue"),
	memoryValue: getRequiredElement("memoryValue"),
	cartPosition: getRequiredElement("cartPosition"),
	cartVelocity: getRequiredElement("cartVelocity"),
	poleAngle: getRequiredElement("poleAngle"),
	poleVelocity: getRequiredElement("poleVelocity"),
	chartRunCount: getRequiredElement("chartRunCount"),
});

const context = elements.canvas.getContext("2d");
const chartContext = elements.chart.getContext("2d");

if (!context || !chartContext) {
	throw new Error("Canvas rendering is not supported by this browser.");
}


function log(message) {
	const item = document.createElement("li");
	item.textContent = message;
	elements.trainingLog.prepend(item);

	// Keep recent diagnostics visible without retaining an unlimited DOM history.
	while (elements.trainingLog.children.length > TRAINING_LOG_LIMIT) {
		elements.trainingLog.lastElementChild.remove();
	}
}

function finishEpisode() {
	const score = environment.steps;

	scores.push(score);

	if (scores.length > SCORE_HISTORY_LIMIT) {
		scores.shift();
	}

	episode += 1;
	log(
		`Run ${episode}: exploration ${agent.explorationRate.toFixed(3)}, ` +
			`score ${score}`,
	);

	state = environment.reset();
	pendingSingleEpisode = false;

	/*
   * Compatibility note: the original browser implementation performs one
   * additional replay pass when an episode ends. It is intentionally retained.
   */
	if (!manualMode) {
		agent.experienceReplay();
	}
}

function takeStep(action) {
	const previousState = [...state];
	const result = environment.step(action);

	state = result.state;

	if (!manualMode) {
		agent.remember(
			previousState,
			action,
			result.reward,
			state,
			result.terminal,
		);
		agent.experienceReplay();
	}

	if (result.terminal) {
		finishEpisode();
	}
}


function drawCartPole() {
	context.clearRect(
		0,
		0,
		elements.canvas.width,
		elements.canvas.height,
	);
	context.fillStyle = COLORS.paper;
	context.fillRect(
		0,
		0,
		elements.canvas.width,
		elements.canvas.height,
	);

	drawTrack();
	drawCart();
}

function drawTrack() {
	context.strokeStyle = COLORS.line;
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(DRAWING.trackStartX, DRAWING.trackY);
	context.lineTo(DRAWING.trackEndX, DRAWING.trackY);
	context.stroke();

	for (let i = 0; i <= DRAWING.trackTickCount; i += 1) {
		const tickX =
			DRAWING.trackStartX + i * DRAWING.trackTickSpacing;

		context.beginPath();
		context.moveTo(tickX, DRAWING.trackY - 10);
		context.lineTo(tickX, DRAWING.trackY + 10);
		context.stroke();
	}
}

function drawCart() {
	const cartX =
		elements.canvas.width / 2 +
		state[STATE_INDEX.cartPosition] * DRAWING.positionScale;
	const cartY = DRAWING.cartY;

	context.fillStyle = COLORS.coral;
	drawRoundedRectangle(
		context,
		cartX - DRAWING.cartHalfWidth,
		cartY - DRAWING.cartHalfHeight,
		DRAWING.cartWidth,
		DRAWING.cartHeight,
		DRAWING.cartRadius,
	);
	context.fill();

	drawWheels(cartX, cartY);
	drawPole(cartX, cartY);
}

function drawWheels(cartX, cartY) {
	context.fillStyle = COLORS.ink;

	for (const wheelX of [
		cartX - DRAWING.wheelOffsetX,
		cartX + DRAWING.wheelOffsetX,
	]) {
		context.beginPath();
		context.arc(
			wheelX,
			cartY + DRAWING.wheelOffsetY,
			DRAWING.wheelRadius,
			0,
			Math.PI * 2,
		);
		context.fill();

		context.fillStyle = COLORS.paper;
		context.beginPath();
		context.arc(
			wheelX,
			cartY + DRAWING.wheelOffsetY,
			DRAWING.wheelHubRadius,
			0,
			Math.PI * 2,
		);
		context.fill();
		context.fillStyle = COLORS.ink;
	}
}

function drawPole(cartX, cartY) {
	const baseY = cartY - DRAWING.poleBaseOffsetY;
	const angle = state[STATE_INDEX.poleAngle];
	const tipX = cartX + Math.sin(angle) * DRAWING.poleLength;
	const tipY = baseY - Math.cos(angle) * DRAWING.poleLength;

	context.strokeStyle = COLORS.yellow;
	context.lineWidth = DRAWING.poleWidth;
	context.lineCap = "round";
	context.beginPath();
	context.moveTo(cartX, baseY);
	context.lineTo(tipX, tipY);
	context.stroke();

	context.fillStyle = COLORS.ink;
	context.beginPath();
	context.arc(
		cartX,
		baseY,
		DRAWING.pivotRadius,
		0,
		Math.PI * 2,
	);
	context.fill();

	context.fillStyle = COLORS.paper;
	context.beginPath();
	context.arc(
		cartX,
		baseY,
		DRAWING.pivotHubRadius,
		0,
		Math.PI * 2,
	);
	context.fill();
}

function drawRoundedRectangle(
	drawingContext,
	x,
	y,
	width,
	height,
	radius,
) {
	drawingContext.beginPath();
	drawingContext.roundRect(x, y, width, height, radius);
}


function drawChart() {
	chartContext.clearRect(
		0,
		0,
		elements.chart.width,
		elements.chart.height,
	);
	chartContext.fillStyle = COLORS.paper;
	chartContext.fillRect(
		0,
		0,
		elements.chart.width,
		elements.chart.height,
	);

	chartContext.strokeStyle = COLORS.line;
	chartContext.lineWidth = 1;

	for (
		let y = CHART.gridStartY;
		y < elements.chart.height;
		y += CHART.gridSpacingY
	) {
		chartContext.beginPath();
		chartContext.moveTo(CHART.plotStartX, y);
		chartContext.lineTo(elements.chart.width - CHART.plotEndPaddingX, y);
		chartContext.stroke();
	}

	if (!scores.length) {
		return;
	}

	const visibleScores = scores.slice(-SCORE_HISTORY_LIMIT);
	const maximumScore = Math.max(CHART.minimumScoreScale, ...visibleScores);

	chartContext.strokeStyle = COLORS.blue;
	chartContext.lineWidth = 3;
	chartContext.beginPath();

	visibleScores.forEach((score, index) => {
		const x =
			CHART.plotStartX +
			(
				index / Math.max(1, visibleScores.length - 1)
			) * (elements.chart.width - CHART.plotHorizontalPadding);
		const y =
			elements.chart.height -
			CHART.plotBottomPadding -
			(score / maximumScore) *
				(elements.chart.height - CHART.plotVerticalPadding);

		if (index === 0) {
			chartContext.moveTo(x, y);
		} else {
			chartContext.lineTo(x, y);
		}
	});

	chartContext.stroke();
}


function updateUI() {
	const average =
		scores.length > 0
			? scores.reduce((sum, value) => sum + value, 0) / scores.length
			: 0;

	elements.episodeCount.textContent = String(episode);
	elements.scoreValue.textContent = String(environment.steps);
	elements.averageScore.textContent = average.toFixed(1);
	elements.bestScore.textContent =
		scores.length > 0 ? String(Math.max(...scores)) : "0";
	elements.epsilonValue.textContent =
		agent.explorationRate.toFixed(3);
	elements.memoryValue.textContent =
		agent.memory.length.toLocaleString();
	elements.cartPosition.textContent =
		state[STATE_INDEX.cartPosition].toFixed(3);
	elements.cartVelocity.textContent =
		state[STATE_INDEX.cartVelocity].toFixed(3);
	elements.poleAngle.textContent =
		`${(
			state[STATE_INDEX.poleAngle] *
			180 /
			Math.PI
		).toFixed(2)}°`;
	elements.poleVelocity.textContent =
		state[STATE_INDEX.poleAngularVelocity].toFixed(3);
	elements.chartRunCount.textContent =
		`${episode} ${episode === 1 ? "RUN" : "RUNS"}`;

	elements.statusText.textContent =
		running
			? "Training"
			: pendingSingleEpisode
				? "Running Episode"
				: manualMode
					? "Manual Control"
					: "Ready";
}

function loop() {
	if (running || pendingSingleEpisode) {
		/*
     * Continuous mode advances faster than one-episode mode so training remains
     * practical while the animation loop still owns all visible updates.
     */
		const stepsPerFrame = running ? CONTINUOUS_STEPS_PER_FRAME : 1;

		for (let i = 0; i < stepsPerFrame; i += 1) {
			takeStep(agent.act(state));
		}
	}

	drawCartPole();
	drawChart();
	updateUI();
	requestAnimationFrame(loop);
}


function setModeUI() {
	elements.agentModeButton.classList.toggle("active", !manualMode);
	elements.manualModeButton.classList.toggle("active", manualMode);
	elements.agentModeButton.setAttribute(
		"aria-pressed",
		String(!manualMode),
	);
	elements.manualModeButton.setAttribute(
		"aria-pressed",
		String(manualMode),
	);
	elements.manualControls.hidden = !manualMode;
	elements.modeText.textContent =
		manualMode ? "Manual Mode" : "AI Agent Mode";
}

function selectAgentMode() {
	manualMode = false;
	running = false;
	pendingSingleEpisode = false;
	setModeUI();
	log("AI agent mode selected.");
}

function selectManualMode() {
	manualMode = true;
	running = false;
	pendingSingleEpisode = false;
	state = environment.reset();
	setModeUI();
	log("Manual control selected.");
}


elements.startButton.addEventListener("click", () => {
	manualMode = false;
	running = true;
	pendingSingleEpisode = false;
	setModeUI();
	log("Continuous training started.");
});

elements.episodeButton.addEventListener("click", () => {
	manualMode = false;
	running = false;
	pendingSingleEpisode = true;
	setModeUI();
	log("Running one training episode.");
});

elements.pauseButton.addEventListener("click", () => {
	running = false;
	pendingSingleEpisode = false;
	log("Simulation paused.");
});

elements.resetButton.addEventListener("click", () => {
	running = false;
	pendingSingleEpisode = false;
	episode = 0;
	scores = [];
	agent = new DQNAgent();
	state = environment.reset();
	elements.trainingLog.replaceChildren();
	log("Simulation reset. The agent is ready.");
});

elements.clearLogButton.addEventListener("click", () => {
	elements.trainingLog.replaceChildren();
});

elements.agentModeButton.addEventListener("click", selectAgentMode);
elements.manualModeButton.addEventListener("click", selectManualMode);
elements.leftButton.addEventListener("click", () => takeStep(0));
elements.rightButton.addEventListener("click", () => takeStep(1));

window.addEventListener("keydown", event => {
	// Do not hijack arrow keys while users operate other controls or edit text.
	const target = event.target;
	if (
		!manualMode ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		(target instanceof Element &&
			target.closest("button, a, input, select, textarea, [contenteditable]"))
	) {
		return;
	}

	if (event.key === "ArrowLeft") {
		event.preventDefault();
		takeStep(0);
	}

	if (event.key === "ArrowRight") {
		event.preventDefault();
		takeStep(1);
	}
});


setModeUI();
loop();
