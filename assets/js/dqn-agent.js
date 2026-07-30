class DQNAgent {
  constructor() {
    this.gamma = 0.95;
    this.learningRate = 0.001;
    this.memorySize = 1000000;
    this.batchSize = 20;
    this.explorationRate = 1.0;
    this.explorationMin = 0.01;
    this.explorationDecay = 0.995;
    this.memory = [];
    this.w1 = this.matrix(4, 24);
    this.b1 = new Array(24).fill(0);
    this.w2 = this.matrix(24, 24);
    this.b2 = new Array(24).fill(0);
    this.w3 = this.matrix(24, 2);
    this.b3 = new Array(2).fill(0);
  }

  matrix(rows, cols) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.16));
  }

  dense(input, weights, bias, relu = true) {
    return bias.map((b, j) => {
      let sum = b;
      for (let i = 0; i < input.length; i += 1) sum += input[i] * weights[i][j];
      return relu ? Math.max(0, sum) : sum;
    });
  }

  predict(state) {
    const h1 = this.dense(state, this.w1, this.b1, true);
    const h2 = this.dense(h1, this.w2, this.b2, true);
    return this.dense(h2, this.w3, this.b3, false);
  }

  act(state) {
    if (Math.random() < this.explorationRate) return Math.random() < 0.5 ? 0 : 1;
    const q = this.predict(state);
    return q[1] > q[0] ? 1 : 0;
  }

  remember(state, action, reward, nextState, terminal) {
    this.memory.push({ state: [...state], action, reward, nextState: [...nextState], terminal });
    if (this.memory.length > this.memorySize) this.memory.shift();
  }

  trainSample(sample) {
    const h1 = this.dense(sample.state, this.w1, this.b1, true);
    const h2 = this.dense(h1, this.w2, this.b2, true);
    const output = this.dense(h2, this.w3, this.b3, false);
    const nextQ = this.predict(sample.nextState);
    const target = sample.reward + (sample.terminal ? 0 : this.gamma * Math.max(...nextQ));
    const error = Math.max(-10, Math.min(10, target - output[sample.action]));

    for (let i = 0; i < 24; i += 1) this.w3[i][sample.action] += this.learningRate * error * h2[i];
    this.b3[sample.action] += this.learningRate * error;

    const h2Error = this.w3.map(row => row[sample.action] * error);
    for (let i = 0; i < 24; i += 1) {
      if (h2[i] <= 0) continue;
      for (let j = 0; j < 24; j += 1) this.w2[j][i] += this.learningRate * h2Error[i] * h1[j] * 0.2;
      this.b2[i] += this.learningRate * h2Error[i] * 0.2;
    }
  }

  experienceReplay() {
    if (this.memory.length < this.batchSize) return;
    for (let i = 0; i < this.batchSize; i += 1) {
      this.trainSample(this.memory[Math.floor(Math.random() * this.memory.length)]);
    }
    this.explorationRate = Math.max(this.explorationMin, this.explorationRate * this.explorationDecay);
  }
}
