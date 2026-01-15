export class GameLoop {
  private isRunning: boolean;
  private lastFrameTime: number;
  private accumulatedTime: number;
  private targetFPS: number;
  private frameTime: number;
  private updateCallback: (deltaTime: number) => void;
  private renderCallback: () => void;

  constructor(targetFPS: number = 60) {
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
    this.targetFPS = targetFPS;
    this.frameTime = 1000 / targetFPS;
    this.updateCallback = () => {};
    this.renderCallback = () => {};
  }

  setUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback;
  }

  setRenderCallback(callback: () => void): void {
    this.renderCallback = callback;
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }

  isLoopRunning(): boolean {
    return this.isRunning;
  }

  getTargetFPS(): number {
    return this.targetFPS;
  }

  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameTime = 1000 / fps;
  }

  private loop(): void {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= this.frameTime) {
      this.updateCallback(this.frameTime / 1000);
      this.accumulatedTime -= this.frameTime;
    }

    this.renderCallback();

    requestAnimationFrame(() => this.loop());
  }
}
