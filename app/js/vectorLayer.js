import * as d3 from 'd3'
import * as topojson from 'topojson'
import _ from 'lodash'

import {
  compositeOperation,
  dispatchEvent
} from './utils'

export default class VectorLayer {
  constructor(gl) {
    this.options = {
      rivers: { enabled: false },
      countries: { enabled: true }
    }

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

    let projection = d3.geoEquirectangular()
      .scale(this.height / Math.PI)
      .translate([this.width / 2, this.height / 2]);

    //this.layer = d3.select('body').append('canvas')
    this.layer = d3.select(document.createElement('canvas'))
      .attr('width', this.width)
      .attr('height', this.height);

    // based on https://bost.ocks.org/mike/map/
    this.ctx = this.layer.node().getContext('2d')
    this.path = d3.geoPath().projection(projection).context(this.ctx);

    d3.json('data/vectors.json', (error, world) => {
      this.world = world
      this.land = topojson.feature(this.world, this.world.objects.land)
      this.lakes = topojson.feature(this.world, this.world.objects.lakes)
      this.rivers = topojson.feature(this.world, this.world.objects.rivers)
      this.countries = topojson.feature(this.world, this.world.objects.countries)
      this.draw()
    });
  }

  draw() {
    compositeOperation(this.ctx, 'source-over')
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, this.width, this.height)

    // land
    this.ctx.beginPath()
    this.path(this.land)
    this.ctx.fillStyle = '#f00'
    this.ctx.fill()

    // lakes
    this.ctx.beginPath()
    this.path(this.lakes)
    this.ctx.fillStyle = '#000'
    this.ctx.fill()

    // rivers
    if (this.options.rivers.enabled) {
      this.ctx.beginPath()
      this.path(this.rivers)
      this.ctx.lineWidth = 1.0 * this.scale
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)'
      this.ctx.stroke()
    }

    //countries
    if (this.options.countries.enabled) {
      compositeOperation(this.ctx, 'lighten')
      this.ctx.beginPath()
      this.path(this.countries)
      this.ctx.lineWidth = 3.0 * this.scale
      this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.4)'
      this.ctx.stroke()
    }

    _.defer(() => { dispatchEvent('vector-layer-updated') })
  }
}
