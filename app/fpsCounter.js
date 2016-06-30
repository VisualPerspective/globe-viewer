export default class FPSCounter {
  constructor() {
    this.frames = 0
    this.totalFrames = 0
    this.updated = 0
  }

  count(time) {
    this.frames += 1
    this.totalFrames += 1
    if (time - this.updated > 200) {
      this.setText(Math.ceil(this.frames / (time - this.updated) * 1000))
      this.updated = time
      this.frames = 0
    }
  }

  pause(time) {
    this.frames = 0
    this.updated = time
    this.setText('paused')
  }

  setText(text) {
    var fps = document.getElementById('fps')
    if (fps !== null) {
      fps.textContent = text
    }
  }
}
