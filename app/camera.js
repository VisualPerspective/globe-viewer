import _ from 'lodash'

export default class Camera {
  constructor(gl) {
    this.gl = gl
    this.fov = 50

    this.longitude = {
      value: 71,
      min: -180,
      max: 180,
      mouseSpeed: 0.3
    }

    this.latitude = {
      value: 42.3,
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

    this.sphereMode = true

    document.addEventListener('keydown', (e) => {
      this.sphereMode = !this.sphereMode
    })

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
      this.changeZoom(-e.wheelDelta * this.zoom.mouseSpeed)
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

      this.changeLongitude(deltaX * this.longitude.mouseSpeed)
      this.changeLatitude(deltaY * this.latitude.mouseSpeed)
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
    this.longitude.value = _.clamp(
      this.longitude.value + amount,
      this.longitude.min,
      this.longitude.max
    )
  }

  changeZoom(amount) {
    this.zoom.value = _.clamp(
      this.zoom.value + amount,
      this.zoom.min,
      this.zoom.max
    )
  }
}
