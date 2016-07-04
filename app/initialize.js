import twgl from 'twgl.js'
import Controls from './controls'

document.addEventListener('DOMContentLoaded', () => {
  let gl = twgl.getWebGLContext(
    document.querySelector(".map-canvas canvas")
  )

  new Controls(gl)
})

