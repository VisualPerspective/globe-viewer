import * as d3 from 'd3'
import _ from 'lodash'

export default class LayerCanvas {
  constructor(gl) {
    if (gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 8192) {
      this.width = 8192
      this.height = 4096
      this.scale = 1.0
    }
    else {
      this.width = 4096
      this.height = 2048
      this.scale = 0.5
    }

    this.projection = d3.geoEquirectangular()
      .scale(this.height / Math.PI)
      .translate([this.width / 2, this.height / 2])

    //this.canvas = d3.select('body').append('canvas')
    this.canvas = d3.select(document.createElement('canvas'))
      .attr('width', this.width)
      .attr('height', this.height)

    // based on https://bost.ocks.org/mike/map/
    this.ctx = this.canvas.node().getContext('2d')
    this.path = d3.geoPath().projection(this.projection).context(this.ctx)
  }
}
