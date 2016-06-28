import twgl from 'twgl.js'
import Controls from './controls'
import Scene from './scene'
import Renderer from './renderer'
import Camera from './camera'
import FPSCounter from './fpsCounter'

document.addEventListener('DOMContentLoaded', () => {
  var gl = twgl.getWebGLContext(
    document.querySelector(".map-canvas canvas")
  )

  var scene = new Scene(gl)
  var renderer = new Renderer(gl, scene)
  var camera = new Camera(gl)
  var fpsCounter = new FPSCounter()
  var controls = new Controls(camera)

  function tick(time) {
    if (
      document.hasFocus() ||
      fpsCounter.totalFrames < 100
    ) {
      updateMap(time)
    }
    else {
      fpsCounter.pause(time)
    }
    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)

  function updateMap(time) {
    fpsCounter.count(time)
    renderer.render(time, scene, camera)
  }

  window.addEventListener('resize', () => {
    updateMap(window.performance.now(), true)
  })
})

