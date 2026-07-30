const env = new CartPoleEnvironment();
let agent = new DQNAgent();
let state = env.reset();
let running = false;
let manualMode = false;
let episode = 0;
let scores = [];
let pendingSingleEpisode = false;

const $ = id => document.getElementById(id);
const canvas = $('cartpoleCanvas');
const ctx = canvas.getContext('2d');
const chart = $('scoreChart');
const chartCtx = chart.getContext('2d');

function log(message) {
  const li = document.createElement('li');
  li.textContent = message;
  $('trainingLog').prepend(li);
}

function finishEpisode() {
  const score = env.steps;
  scores.push(score);
  if (scores.length > 100) scores.shift();
  episode += 1;
  log(`Run ${episode}: exploration ${agent.explorationRate.toFixed(3)}, score ${score}`);
  state = env.reset();
  pendingSingleEpisode = false;
  if (!manualMode) agent.experienceReplay();
}

function takeStep(action) {
  const previousState = [...state];
  const result = env.step(action);
  state = result.state;
  if (!manualMode) {
    agent.remember(previousState, action, result.reward, state, result.terminal);
    agent.experienceReplay();
  }
  if (result.terminal) finishEpisode();
}

function drawCartPole() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFFDF6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#D7DCE8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 420);
  ctx.lineTo(850, 420);
  ctx.stroke();
  for (let i = 0; i <= 20; i += 1) {
    ctx.beginPath();
    ctx.moveTo(70 + i * 39, 410);
    ctx.lineTo(70 + i * 39, 430);
    ctx.stroke();
  }

  const cartX = canvas.width / 2 + state[0] * 125;
  const cartY = 370;
  ctx.fillStyle = '#FF5F57';
  roundRect(ctx, cartX - 78, cartY - 37, 156, 74, 20);
  ctx.fill();
  ctx.fillStyle = '#11172B';
  for (const wheelX of [cartX - 55, cartX + 55]) {
    ctx.beginPath(); ctx.arc(wheelX, cartY + 45, 21, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFDF6'; ctx.beginPath(); ctx.arc(wheelX, cartY + 45, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#11172B';
  }

  const poleLength = 225;
  const baseY = cartY - 45;
  const tipX = cartX + Math.sin(state[2]) * poleLength;
  const tipY = baseY - Math.cos(state[2]) * poleLength;
  ctx.strokeStyle = '#FFD65A';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cartX, baseY); ctx.lineTo(tipX, tipY); ctx.stroke();
  ctx.fillStyle = '#11172B'; ctx.beginPath(); ctx.arc(cartX, baseY, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFDF6'; ctx.beginPath(); ctx.arc(cartX, baseY, 10, 0, Math.PI * 2); ctx.fill();
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawChart() {
  chartCtx.clearRect(0, 0, chart.width, chart.height);
  chartCtx.fillStyle = '#FFFDF6';
  chartCtx.fillRect(0, 0, chart.width, chart.height);
  chartCtx.strokeStyle = '#D7DCE8';
  chartCtx.lineWidth = 1;
  for (let y = 30; y < chart.height; y += 45) {
    chartCtx.beginPath(); chartCtx.moveTo(48, y); chartCtx.lineTo(chart.width - 20, y); chartCtx.stroke();
  }
  if (!scores.length) return;
  const visible = scores.slice(-100);
  const max = Math.max(500, ...visible);
  chartCtx.strokeStyle = '#4E78FF';
  chartCtx.lineWidth = 3;
  chartCtx.beginPath();
  visible.forEach((score, i) => {
    const x = 48 + (i / Math.max(1, visible.length - 1)) * (chart.width - 70);
    const y = chart.height - 24 - (score / max) * (chart.height - 48);
    if (i === 0) chartCtx.moveTo(x, y); else chartCtx.lineTo(x, y);
  });
  chartCtx.stroke();
}

function updateUI() {
  const average = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  $('episodeCount').textContent = episode;
  $('scoreValue').textContent = env.steps;
  $('averageScore').textContent = average.toFixed(1);
  $('bestScore').textContent = scores.length ? Math.max(...scores) : 0;
  $('epsilonValue').textContent = agent.explorationRate.toFixed(3);
  $('memoryValue').textContent = agent.memory.length.toLocaleString();
  $('cartPosition').textContent = state[0].toFixed(3);
  $('cartVelocity').textContent = state[1].toFixed(3);
  $('poleAngle').textContent = `${(state[2] * 180 / Math.PI).toFixed(2)}°`;
  $('poleVelocity').textContent = state[3].toFixed(3);
  $('statusText').textContent = running ? 'Training' : pendingSingleEpisode ? 'Running Episode' : manualMode ? 'Manual Control' : 'Ready';
}

function loop() {
  if (running || pendingSingleEpisode) {
    const stepsPerFrame = running ? 4 : 1;
    for (let i = 0; i < stepsPerFrame; i += 1) takeStep(agent.act(state));
  }
  drawCartPole();
  drawChart();
  updateUI();
  requestAnimationFrame(loop);
}

$('startBtn').addEventListener('click', () => { manualMode = false; setModeUI(); running = true; pendingSingleEpisode = false; log('Continuous training started.'); });
$('episodeBtn').addEventListener('click', () => { manualMode = false; setModeUI(); running = false; pendingSingleEpisode = true; log('Running one training episode.'); });
$('pauseBtn').addEventListener('click', () => { running = false; pendingSingleEpisode = false; log('Simulation paused.'); });
$('resetBtn').addEventListener('click', () => {
  running = false; pendingSingleEpisode = false; episode = 0; scores = []; agent = new DQNAgent(); state = env.reset();
  $('trainingLog').innerHTML = '<li>Simulation reset. The agent is ready.</li>';
});
$('clearLogBtn').addEventListener('click', () => { $('trainingLog').innerHTML = ''; });
$('agentModeBtn').addEventListener('click', () => { manualMode = false; running = false; pendingSingleEpisode = false; setModeUI(); log('AI agent mode selected.'); });
$('manualModeBtn').addEventListener('click', () => { manualMode = true; running = false; pendingSingleEpisode = false; state = env.reset(); setModeUI(); log('Manual control selected.'); });
$('leftBtn').addEventListener('click', () => takeStep(0));
$('rightBtn').addEventListener('click', () => takeStep(1));
window.addEventListener('keydown', event => {
  if (!manualMode) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); takeStep(0); }
  if (event.key === 'ArrowRight') { event.preventDefault(); takeStep(1); }
});

function setModeUI() {
  $('agentModeBtn').classList.toggle('active', !manualMode);
  $('manualModeBtn').classList.toggle('active', manualMode);
  $('manualControls').hidden = !manualMode;
  $('modeText').textContent = manualMode ? 'Manual Mode' : 'AI Agent Mode';
}

setModeUI();
loop();
