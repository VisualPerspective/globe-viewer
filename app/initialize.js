import twgl from 'twgl.js'
import Renderer from './renderer'
import OrbitCamera from './orbitCamera'
import FPSCounter from './fpsCounter'

document.addEventListener('DOMContentLoaded', () => {
  var gl = twgl.getWebGLContext(document.getElementById("c"))
  var renderer = new Renderer(gl)
  var camera = new OrbitCamera(gl)
  var fpsCounter = new FPSCounter()

  function render(time) {
    if (document.hasFocus() || fpsCounter.totalFrames < 100) {
      fpsCounter.count(time)
      renderer.render(time, camera)
    }
    else {
      fpsCounter.pause(time)
    }
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
})

