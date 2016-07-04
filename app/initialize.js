import twgl from 'twgl.js'
import Controls from './controls'
import Scene from './scene'
import Renderer from './renderer'
import Camera from './camera'
import PerformanceStats from './performanceStats'

document.addEventListener('DOMContentLoaded', () => {
  var gl = twgl.getWebGLContext(
    document.querySelector(".map-canvas canvas")
  )

  var scene = new Scene(gl)
  var renderer = new Renderer(gl, scene)
  var camera = new Camera(gl)
  var performanceStats = new PerformanceStats()
  var controls = new Controls(
    renderer,
    scene,
    camera,
    performanceStats
  )
})

