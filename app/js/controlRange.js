import _ from 'lodash'

export default class ControlRange {
  constructor(value, min, max, wrap = false) {
    this.value = value
    this.min = min
    this.max = max
    this.wrap = wrap
  }

  changeBy(amount) {
    this.changeTo(this.value + amount)
  }

  changeTo(value) {
    if (this.wrap) {
      this.setWrap(value)
    }
    else {
      this.setClamp(value)
    }
  }

  setClamp(value) {
    this.value = _.clamp(value, this.min, this.max)
  }

  setWrap(value) {
    if (value > this.max) {
      let remainder = value % this.max
      value = this.min + remainder
    }
    else if (value < this.min) {
      value = this.max - (this.min - value)
    }

    this.value = value
  }
}
