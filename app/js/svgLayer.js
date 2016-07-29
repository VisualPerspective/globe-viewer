import * as d3 from 'd3'
import * as geo from 'd3-geo'
import * as projection from 'd3-geo-projection'
import * as topojson from 'topojson'
import _ from 'lodash'
import twgl from 'twgl.js'

import { updateCanvasSize } from './utils'

const m4 = twgl.m4

export default class SVGLayer {
  constructor(gl, vectors, camera) {
    this.gl = gl
    this.camera = camera
    this.options = { countries: { enabled: true } }
    this.countries = topojson.feature(vectors, vectors.objects.countries)

    this.canvas = d3.select('.map-canvas').append('canvas')
      .attr('class', 'svg-layer')

    this.ctx = this.canvas.node().getContext('2d')

    this.projection = projection.geoSatellite()

    this.path = geo.geoPath().projection(this.projection).context(this.ctx)

    window.addEventListener('resize', () => { this.resize() })
    this.resize()
    this.draw()
  }

  project() {
    let distance = this.camera.getDistance()
    let renderValues = this.camera.getRenderValues(this.gl)

    let scale = m4.transformPoint(
      renderValues.projection,
      [0, 0.75, -(distance - 1)]
    )[1]

    this.projection
      .distance(distance)
      .scale(this.height * scale * 2 / 3)
      .translate([this.width / 2, this.height / 2])
      .rotate([
        -this.camera.longitude.value,
        -this.camera.latitude.value,
        0
      ])
      .clipAngle(
        Math.acos(1 / distance) * 180 / Math.PI - 1e-6
      )
      .precision(10)
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    this.ctx.beginPath()
    this.path(this.countries)
    this.ctx.lineWidth = 0.25
    this.ctx.strokeStyle = '#fff'
    this.ctx.stroke()
  }

  resize() {
    let canvasNode = this.canvas.node()
    updateCanvasSize(canvasNode)
    this.width = canvasNode.width
    this.height = canvasNode.height

    this.draw()
  }
}
