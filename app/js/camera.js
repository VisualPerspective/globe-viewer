import _ from 'lodash'
import hammer from 'hammerjs'
import twgl from 'twgl.js'

import ControlRange from './controlRange'
import { toRadians } from './utils'

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

    this.hammer = new Hammer(gl.canvas)
    this.hammer.get('pinch').set({ enable: true })

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

    gl.canvas.addEventListener('scroll', () => {
      return false
    })

    this.hammer.on('pan', (e) => {
      if (e.pointerType != 'mouse') {
        this.handlePan(e.velocityX * 8, e.velocityY * 8)
      }

      return false
    });

    this.hammer.on('pinchstart', (e) => {
      this.lastZoom = this.zoom.value
      this.pinching = true
    })

    this.hammer.on('pinchend', (e) => {
      this.pinching = false
    })

    this.hammer.on('pinch', (e) => {
      if (this.pinching) {
        this.zoom.changeTo(this.lastZoom + (e.scale - 1) * 0.5)
      }
    })

    window.addEventListener('wheel', (e) => {
      let amount = -e.deltaY * 0.001

      // Deal with Firefox mousewheel speed being slower
      if (e.mozInputSource === 1) {
        amount *= 50;
      }

      if (e.target == gl.canvas) {
        this.zoom.changeBy(amount)
        e.preventDefault()
      }
    })
  }

  handleMouseMove(e) {
    let newMousePosition = { x: e.screenX, y: e.screenY }

    if (this.mousePosition !== undefined && this.dragging) {
      let deltaX = newMousePosition.x - this.mousePosition.x
      let deltaY = newMousePosition.y - this.mousePosition.y
      this.handlePan(deltaX * 0.3, deltaY * 0.3)
      e.stopPropagation()
    }

    this.mousePosition = newMousePosition
  }

  handlePan(deltaX, deltaY) {
    let zoomFactor = 1 - (this.zoom.value * 0.8)

    this.longitude.changeBy(-deltaX * zoomFactor )
    this.latitude.changeBy(deltaY * zoomFactor)
  }

  getRenderValues(gl) {
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    let fov = toRadians(30) / _.clamp(aspect, 0.0, 1.0)
    let projection = m4.perspective(fov, aspect, 0.01, 10)
    let eye = [0, 0, -(4.5 - this.zoom.value * 3)]
    let camera = m4.identity()
    m4.rotateY(camera, toRadians(this.longitude.value + 90), camera)
    m4.rotateX(camera, toRadians(this.latitude.value), camera)

    eye = m4.transformPoint(camera, eye)
    let up = m4.transformPoint(camera, [0, 1, 0])
    let target = [0, 0, 0]
    let view = m4.inverse(m4.lookAt(eye, target, up))

    return {
      view: view,
      projection: projection,
      eye: eye
    }
  }
}
