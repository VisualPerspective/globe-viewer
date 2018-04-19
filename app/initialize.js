import * as d3 from 'd3'
import * as twgl from 'twgl.js/dist/4.x/twgl-full'
import styles from 'styles/styles.scss'
import Controller from 'js/controller'

document.addEventListener('DOMContentLoaded', () => {
  let gl = twgl.getWebGLContext(
    document.querySelector(".map-canvas canvas")
  )

  d3.json('data/vectors.json').then(vectors => {
    new Controller(gl, vectors)
  })
})

