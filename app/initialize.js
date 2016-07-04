import twgl from 'twgl.js'
import Controller from 'js/controller'

document.addEventListener('DOMContentLoaded', () => {
  let gl = twgl.getWebGLContext(
    document.querySelector(".map-canvas canvas")
  )

  new Controller(gl)
})

