import _ from 'lodash'

export default class OrbitCamera {
  constructor(gl) {
    this.gl = gl
    this.fov = 50

    this.longitude = 71
    this.minLongitude = -180
    this.maxLongitude = 180

    this.latitude = 42.3
    this.minLatitude = -90
    this.maxLatitude = 90

    this.zoom = 0.5
    this.minZoom = 0.0
    this.maxZoom = 1.0

    this.dragging = false
    this.dragStart = undefined
    this.mousePosition = undefined

    this.mouseLatitudeSpeed = 0.3
    this.mouseLongitudeSpeed = 0.3
    this.mouseZoomSpeed = 0.001

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

    document.addEventListener('mouseup', () => {
      this.dragging = false
    })

    gl.canvas.addEventListener('mousewheel', (e) => {
      this.changeZoom(-e.wheelDelta * this.mouseZoomSpeed)
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

      this.changeLongitude(deltaX * this.mouseLongitudeSpeed)
      this.changeLatitude(deltaY * this.mouseLatitudeSpeed)
    }

    this.mousePosition = newMousePosition
  }

  changeLatitude(amount) {
    this.latitude = _.clamp(
      this.latitude + amount,
      this.minLatitude,
      this.maxLatitude
    )
  }

  changeLongitude(amount) {
    this.longitude = _.clamp(
      this.longitude + amount,
      this.minLongitude,
      this.maxLongitude
    )
  }

  changeZoom(amount) {
    this.zoom = _.clamp(
      this.zoom + amount,
      this.minZoom,
      this.maxZoom
    )
  }
}
