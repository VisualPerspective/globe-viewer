import twgl from 'twgl.js'
import Renderer from './renderer'
import FPSCounter from './fpsCounter'

document.addEventListener('DOMContentLoaded', () => {
  var gl = twgl.getWebGLContext(document.getElementById("c"))
  var renderer = new Renderer(gl)
  var fpsCounter = new FPSCounter()

  function render(time) {
    if (document.hasFocus() || fpsCounter.totalFrames < 100) {
      fpsCounter.count(time)
      renderer.render(time)
    }
    else {
      fpsCounter.pause(time)
    }
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
})

