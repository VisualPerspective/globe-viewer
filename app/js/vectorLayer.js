import * as d3 from 'd3'
import * as topojson from 'topojson'

export default class VectorLayer {
  constructor() {
    this.width = 8192
    this.height = 4096

    let projection = d3.geoEquirectangular()
      .scale(this.height / Math.PI)
      .translate([this.width / 2, this.height / 2]);

    //this.layer = d3.select('body').append('canvas')
    this.layer = d3.select(document.createElement('canvas'))
      .attr('width', this.width)
      .attr('height', this.height);

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
    this.ctx.beginPath()
    this.path(this.rivers)
    this.ctx.lineWidth = 1.0
    this.ctx.strokeStyle = '#000'
    this.ctx.stroke()

    //countries
    this.ctx.beginPath()
    this.path(this.countries)
    this.ctx.lineWidth = 2.0
    this.ctx.strokeStyle = '#00f'
    this.ctx.stroke()

    window.dispatchEvent(new Event('vector-layer-updated'))
  }
}
