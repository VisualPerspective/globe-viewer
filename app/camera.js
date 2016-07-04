import _ from 'lodash'

export default class Camera {
  constructor(gl) {
    this.gl = gl
    this.fov = 50

    this.longitude = {
      value: 0,
      min: -180,
      max: 180,
      mouseSpeed: 0.3
    }

    this.latitude = {
      value: 0,
      min: -90,
      max: 90,
      mouseSpeed: 0.3
    }

    this.zoom = {
      value: 0.5,
      min: 0.0,
      max: 1.0,
      mouseSpeed: 0.001
    }

    this.dragging = false
    this.dragStart = undefined
    this.mousePosition = undefined

    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e)
    })

    gl.canvas.addEventListener('mousedown', () => {
      this.dragging = true
    })

    document.addEventListener('selectstart', (e) => {
      if (this.dragging === true) {
        e.preventDefault()
      }
    })

    document.addEventListener('mouseup', () => {
      this.dragging = false
    })

    gl.canvas.addEventListener('mousewheel', (e) => {
      this.changeZoom(e.wheelDelta * this.zoom.mouseSpeed)
      e.preventDefault()
      return false
    })

    gl.canvas.addEventListener('scroll', () => {
      return false
    })
  }

  handleMouseMove(e) {
    var newMousePosition = { x: e.screenX, y: e.screenY }

    if (this.mousePosition !== undefined && this.dragging) {
      var deltaX = newMousePosition.x - this.mousePosition.x
      var deltaY = newMousePosition.y - this.mousePosition.y
      var zoomFactor = 1 - (this.zoom.value * 0.8);

      this.changeLongitude(
        deltaX * zoomFactor *
        this.longitude.mouseSpeed
      )

      this.changeLatitude(
        deltaY * zoomFactor *
        this.latitude.mouseSpeed
      )
    }

    this.mousePosition = newMousePosition
  }

  changeLatitude(amount) {
    this.latitude.value = _.clamp(
      this.latitude.value + amount,
      this.latitude.min,
      this.latitude.max
    )
  }

  changeLongitude(amount) {
    var value = this.longitude.value + amount;
    if (value > this.longitude.max) {
      var remainder = value % this.longitude.max
      value = this.longitude.min + remainder
    }
    else if (value < this.longitude.min) {
      value = this.longitude.max - (this.longitude.min - value)
    }

    this.longitude.value = value
  }

  changeZoom(amount) {
    this.zoom.value = _.clamp(
      this.zoom.value + amount,
      this.zoom.min,
      this.zoom.max
    )
  }
}
