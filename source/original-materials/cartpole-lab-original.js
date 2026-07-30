const canvas = document.getElementById('cartpoleCanvas');
const ctx = canvas.getContext('2d');
const ui = {
  start: document.getElementById('startBtn'), episode: document.getElementById('episodeBtn'), pause: document.getElementById('pauseBtn'), reset: document.getElementById('resetBtn'),
  status: document.getElementById('statusText'), ep: document.getElementById('episodeCount'), score: document.getElementById('scoreValue'), avg: document.getElementById('averageScore'), eps: document.getElementById('epsilonValue'), mem: document.getElementById('memoryValue'), log: document.getElementById('trainingLog')
};
const cfg = { gravity: 9.8, massCart: 1.0, massPole: 0.1, length: 0.5, force: 10, tau: 0.02, gamma: 0.95, explorationDecay: 0.995, explorationMin: 0.01 };
let state, running = false, episode = 0, score = 0, epsilon = 1, memory = [], scores = [];
function resetState(){ state = { x: 0, xDot: 0, theta: (Math.random() - .5) * .08, thetaDot: 0 }; score = 0; }
function step(action){
  const force = action === 1 ? cfg.force : -cfg.force; const costheta = Math.cos(state.theta); const sintheta = Math.sin(state.theta);
  const totalMass = cfg.massCart + cfg.massPole; const poleMassLength = cfg.massPole * cfg.length;
  const temp = (force + poleMassLength * state.thetaDot * state.thetaDot * sintheta) / totalMass;
  const thetaAcc = (cfg.gravity * sintheta - costheta * temp) / (cfg.length * (4/3 - cfg.massPole * costheta * costheta / totalMass));
  const xAcc = temp - poleMassLength * thetaAcc * costheta / totalMass;
  state.x += cfg.tau * state.xDot; state.xDot += cfg.tau * xAcc; state.theta += cfg.tau * state.thetaDot; state.thetaDot += cfg.tau * thetaAcc; score++;
  const done = Math.abs(state.x) > 2.4 || Math.abs(state.theta) > 12 * Math.PI / 180 || score >= 500;
  memory.push({ state: {...state}, action, reward: done ? -1 : 1 }); if(memory.length > 1000000) memory.shift();
  if(done){ scores.push(score); if(scores.length > 100) scores.shift(); episode++; log(`Run ${episode}: score ${score}`); epsilon = Math.max(cfg.explorationMin, epsilon * cfg.explorationDecay); resetState(); }
}
function chooseAction(){ return Math.random() < epsilon ? Math.round(Math.random()) : (state.theta + state.thetaDot * .45 + state.x * .12 > 0 ? 1 : 0); }
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#F7F2E8'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#D8D0C0'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(80,395); ctx.lineTo(820,395); ctx.stroke();
  for(let i=0;i<21;i++){ctx.beginPath();ctx.moveTo(80+i*37,385);ctx.lineTo(80+i*37,405);ctx.stroke();}
  const cartX = canvas.width/2 + state.x * 110; const cartY = 350; const cartW=150, cartH=70;
  ctx.fillStyle='#4E6BFF'; rounded(cartX-cartW/2, cartY-cartH/2, cartW, cartH, 20); ctx.fill();
  ctx.fillStyle='#101820'; ctx.beginPath(); ctx.arc(cartX-55, cartY+42, 20,0,Math.PI*2); ctx.arc(cartX+55, cartY+42, 20,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#F7F2E8'; ctx.beginPath(); ctx.arc(cartX-55, cartY+42, 9,0,Math.PI*2); ctx.arc(cartX+55, cartY+42, 9,0,Math.PI*2); ctx.fill();
  const poleLen=215; const angle=state.theta; const baseY=cartY-43; const tipX=cartX + Math.sin(angle)*poleLen; const tipY=baseY - Math.cos(angle)*poleLen;
  ctx.strokeStyle='#F2C14E'; ctx.lineWidth=18; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(cartX, baseY); ctx.lineTo(tipX, tipY); ctx.stroke();
  ctx.fillStyle='#101820'; ctx.beginPath(); ctx.arc(cartX, baseY, 24,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#F7F2E8'; ctx.beginPath(); ctx.arc(cartX, baseY, 10,0,Math.PI*2); ctx.fill();
}
function rounded(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); }
function updateUI(){ const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0; ui.ep.textContent=episode; ui.score.textContent=score; ui.avg.textContent=avg.toFixed(1); ui.eps.textContent=epsilon.toFixed(3); ui.mem.textContent=memory.length; ui.status.textContent = running ? 'Training' : 'Ready'; }
function log(msg){ const li=document.createElement('li'); li.textContent=msg; ui.log.prepend(li); }
function loop(){ if(running){ for(let i=0;i<4;i++) step(chooseAction()); } draw(); updateUI(); requestAnimationFrame(loop); }
ui.start.onclick=()=>{ running=true; log('Training started.'); };
ui.pause.onclick=()=>{ running=false; log('Paused.'); };
ui.episode.onclick=()=>{ const start=episode; while(episode===start) step(chooseAction()); draw(); updateUI(); };
ui.reset.onclick=()=>{ running=false; episode=0; epsilon=1; memory=[]; scores=[]; ui.log.innerHTML=''; resetState(); updateUI(); draw(); };
resetState(); loop();
