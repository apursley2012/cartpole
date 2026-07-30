class CartPoleEnvironment {
  constructor() {
    this.gravity = 9.8;
    this.massCart = 1.0;
    this.massPole = 0.1;
    this.totalMass = this.massPole + this.massCart;
    this.length = 0.5;
    this.poleMassLength = this.massPole * this.length;
    this.forceMag = 10.0;
    this.tau = 0.02;
    this.thetaThresholdRadians = 12 * 2 * Math.PI / 360;
    this.xThreshold = 2.4;
    this.maxSteps = 500;
    this.reset();
  }

  reset() {
    this.state = [
      Math.random() * 0.1 - 0.05,
      Math.random() * 0.1 - 0.05,
      Math.random() * 0.1 - 0.05,
      Math.random() * 0.1 - 0.05
    ];
    this.steps = 0;
    return [...this.state];
  }

  step(action) {
    const [x, xDot, theta, thetaDot] = this.state;
    const force = action === 1 ? this.forceMag : -this.forceMag;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const temp = (force + this.poleMassLength * thetaDot * thetaDot * sinTheta) / this.totalMass;
    const thetaAcc = (this.gravity * sinTheta - cosTheta * temp) /
      (this.length * (4.0 / 3.0 - this.massPole * cosTheta * cosTheta / this.totalMass));
    const xAcc = temp - this.poleMassLength * thetaAcc * cosTheta / this.totalMass;

    const nextX = x + this.tau * xDot;
    const nextXDot = xDot + this.tau * xAcc;
    const nextTheta = theta + this.tau * thetaDot;
    const nextThetaDot = thetaDot + this.tau * thetaAcc;

    this.state = [nextX, nextXDot, nextTheta, nextThetaDot];
    this.steps += 1;

    const terminal = nextX < -this.xThreshold ||
      nextX > this.xThreshold ||
      nextTheta < -this.thetaThresholdRadians ||
      nextTheta > this.thetaThresholdRadians ||
      this.steps >= this.maxSteps;

    return {
      state: [...this.state],
      reward: terminal && this.steps < this.maxSteps ? -1 : 1,
      terminal,
      score: this.steps
    };
  }
}
