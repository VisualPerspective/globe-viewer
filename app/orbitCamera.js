import _ from 'lodash'

export default class OrbitCamera {
  constructor(gl) {
    this.gl = gl
    this.fov = 50

    this.orbit = 0

    this.elevation = 0
    this.minElevation = -(Math.PI / 2 * 0.99)
    this.maxElevation = (Math.PI / 2 * 0.99)

    this.distance = 2.5
    this.minDistance = 0.5
    this.maxDistance = 4

    this.dragging = false
    this.dragStart = undefined
    this.mousePosition = undefined

    this.mouseOrbitSpeed = 0.003
    this.mouseElevationSpeed = 0.003
    this.mouseDistanceSpeed = 0.001

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
      this.changeDistance(-e.wheelDelta * this.mouseDistanceSpeed)
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

      this.changeOrbit(deltaX * this.mouseOrbitSpeed)
      this.changeElevation(deltaY * this.mouseElevationSpeed)
    }

    this.mousePosition = newMousePosition
  }

  changeOrbit(amount) {
    this.orbit = this.orbit + amount
  }

  changeElevation(amount) {
    this.elevation = _.clamp(
      this.elevation + amount,
      this.minElevation,
      this.maxElevation
    )
  }

  changeDistance(amount) {
    this.distance = _.clamp(
      this.distance + amount,
      this.minDistance,
      this.maxDistance
    )
  }
}
