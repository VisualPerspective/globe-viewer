import * as d3 from 'd3'
import * as topojson from 'topojson'
import _ from 'lodash'

import {
  compositeOperation,
  dispatchEvent
} from './utils'

export default class LandMaskLayer {
  constructor(gl, vectors, layerCanvas) {
    this.options = { rivers: { enabled: false } }
    this.layerCanvas = layerCanvas
    this.land = topojson.feature(vectors, vectors.objects.land)
    this.lakes = topojson.feature(vectors, vectors.objects.lakes)
    this.rivers = topojson.feature(vectors, vectors.objects.rivers)
  }

  draw() {
    let ctx = this.layerCanvas.ctx
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.layerCanvas.width, this.layerCanvas.height)

    // land
    ctx.beginPath()
    this.layerCanvas.path(this.land)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.lineWidth = 1.0 * this.scale
    ctx.strokeStyle = '#fff'
    ctx.stroke()

    // lakes
    ctx.beginPath()
    this.layerCanvas.path(this.lakes)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.lineWidth = 1.0 * this.layerCanvas.scale
    ctx.strokeStyle = '#000'
    ctx.stroke()

    // rivers
    if (this.options.rivers.enabled) {
      ctx.beginPath()
      this.layerCanvas.path(this.rivers)
      ctx.lineWidth = 1.0 * this.layerCanvas.scale
      ctx.strokeStyle = '#000'
      ctx.stroke()
    }

    dispatchEvent('landmask-updated')
  }
}
