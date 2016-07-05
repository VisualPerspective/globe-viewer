import _ from 'lodash'
import twgl from 'twgl.js'

import ControlRange from './controlRange'

const m4 = twgl.m4

export default class Camera {
  constructor(gl) {
    this.gl = gl
    this.fov = 50

    this.longitude = new ControlRange(0, -180, 180, true)
    this.latitude = new ControlRange(0, -90, 90)
    this.zoom = new ControlRange(0.5, 0, 1)

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

    window.addEventListener('wheel', (e) => {
      if (e.target == gl.canvas) {
        this.zoom.changeBy(-e.deltaY * 0.001)
        e.preventDefault()
        return false
      }
    })

    gl.canvas.addEventListener('scroll', () => {
      return false
    })
  }

  handleMouseMove(e) {
    let newMousePosition = { x: e.screenX, y: e.screenY }

    if (this.mousePosition !== undefined && this.dragging) {
      let deltaX = newMousePosition.x - this.mousePosition.x
      let deltaY = newMousePosition.y - this.mousePosition.y
      let zoomFactor = 1 - (this.zoom.value * 0.8);

      this.longitude.changeBy(deltaX * zoomFactor * 0.3)
      this.latitude.changeBy(deltaY * zoomFactor * 0.3)
    }

    this.mousePosition = newMousePosition
  }

  getRenderValues(gl) {
    let projection = m4.perspective(
      30 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.01,
      10
    )

    let eye = [0, 0, -(4.5 - this.zoom.value * 3)]
    let cameraMatrix = m4.rotateY(m4.identity(),
      -(this.longitude.value / 180 * Math.PI) + Math.PI / 2
    )

    cameraMatrix = m4.rotateX(cameraMatrix,
      this.latitude.value / 180 * Math.PI
    )

    eye = m4.transformPoint(cameraMatrix, eye)
    let up = m4.transformPoint(cameraMatrix, [0, 1, 0])
    let target = [0, 0, 0]
    let view = m4.inverse(m4.lookAt(eye, target, up))

    return {
      view: view,
      projection: projection,
      eye: eye
    }
  }
}
