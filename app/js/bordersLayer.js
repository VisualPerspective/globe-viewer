import * as d3 from 'd3'
import * as topojson from 'topojson'
import _ from 'lodash'

import {
  compositeOperation,
  dispatchEvent
} from './utils'

export default class BordersLayer {
  constructor(gl, vectors, layerCanvas) {
    this.options = { countries: { enabled: true } }
    this.layerCanvas = layerCanvas
    this.countries = topojson.feature(vectors, vectors.objects.countries)
    this.draw()
  }

  draw() {
    let ctx = this.layerCanvas.ctx
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.layerCanvas.width, this.layerCanvas.height)

    // countries
    if (this.options.countries.enabled) {
      ctx.beginPath()
      this.layerCanvas.path(this.countries)
      ctx.lineWidth = 1.0 * this.layerCanvas.scale
      ctx.strokeStyle = '#fff'
      ctx.stroke()
    }

    dispatchEvent('borders-updated')
  }
}
