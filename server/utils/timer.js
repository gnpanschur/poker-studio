const BLIND_LEVELS = [
  { small: 10, big: 20 },
  { small: 20, big: 40 },
  { small: 30, big: 60 },
  { small: 50, big: 100 },
  { small: 75, big: 150 },
  { small: 100, big: 200 },
  { small: 150, big: 300 },
  { small: 200, big: 400 },
  { small: 300, big: 600 },
  { small: 500, big: 1000 },
  { small: 1000, big: 2000 },
  { small: 2000, big: 4000 }
];

class BlindTimer {
  constructor(intervalMinutes = 3, onBlindIncrease) {
    this.intervalSeconds = intervalMinutes * 60;
    this.currentLevelIndex = 0;
    this.remainingSeconds = this.intervalSeconds;
    this.timerId = null;
    this.onBlindIncrease = onBlindIncrease;
    this.isRunning = false;
  }

  getCurrentBlinds() {
    return BLIND_LEVELS[Math.min(this.currentLevelIndex, BLIND_LEVELS.length - 1)];
  }

  getNextBlinds() {
    return BLIND_LEVELS[Math.min(this.currentLevelIndex + 1, BLIND_LEVELS.length - 1)];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        // Increase blind level
        if (this.currentLevelIndex < BLIND_LEVELS.length - 1) {
          this.currentLevelIndex++;
        }
        this.remainingSeconds = this.intervalSeconds;
        if (this.onBlindIncrease) {
          this.onBlindIncrease(this.getCurrentBlinds());
        }
      }
    }, 1000);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.currentLevelIndex = 0;
    this.remainingSeconds = this.intervalSeconds;
  }

  getState() {
    return {
      currentLevel: this.currentLevelIndex + 1,
      smallBlind: this.getCurrentBlinds().small,
      bigBlind: this.getCurrentBlinds().big,
      nextSmallBlind: this.getNextBlinds().small,
      nextBigBlind: this.getNextBlinds().big,
      remainingSeconds: this.remainingSeconds,
      intervalSeconds: this.intervalSeconds
    };
  }
}

module.exports = {
  BlindTimer,
  BLIND_LEVELS
};
