import * as d3 from 'd3'
import twgl from 'twgl.js'

import Controller from 'js/controller'

document.addEventListener('DOMContentLoaded', () => {
  let gl = twgl.getWebGLContext(
    document.querySelector(".map-canvas canvas")
  )

  d3.json('data/vectors.json', (error, vectors) => {
    new Controller(gl, vectors)
  })
})

