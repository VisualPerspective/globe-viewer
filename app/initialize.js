import twgl from 'twgl.js'
import Scene from './scene'
import Renderer from './renderer'
import OrbitCamera from './orbitCamera'
import FPSCounter from './fpsCounter'

document.addEventListener('DOMContentLoaded', () => {
  var gl = twgl.getWebGLContext(document.querySelector(".map-canvas"))

  var scene = new Scene(gl)
  var renderer = new Renderer(gl, scene)
  var camera = new OrbitCamera(gl)
  var fpsCounter = new FPSCounter()

  function render(time) {
    if (document.hasFocus() || fpsCounter.totalFrames < 100) {
      fpsCounter.count(time)
      renderer.render(time, scene, camera)
    }
    else {
      fpsCounter.pause(time)
    }
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
})

