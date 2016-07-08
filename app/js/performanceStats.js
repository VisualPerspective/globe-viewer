export default class PerformanceStats {
  constructor() {
    this.fps = 0
    this.frames = 0
    this.totalFrames = 0
    this.updated = 0
  }

  countFrame() {
    let time = window.performance.now()
    this.frames += 1
    this.totalFrames += 1
    if (time - this.updated > 200) {
      this.fps = this.frames / (time - this.updated) * 1000
      this.updated = time
      this.frames = 0
    }
  }
}
