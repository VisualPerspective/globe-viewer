import * as d3 from 'd3'
import * as geo from 'd3-geo'
import * as projection from 'd3-geo-projection'
import * as topojson from 'topojson'
import _ from 'lodash'
import twgl from 'twgl.js'

const m4 = twgl.m4

export default class SVGLayer {
  constructor(gl, vectors, camera) {
    this.gl = gl
    this.camera = camera
    this.options = { countries: { enabled: true } }
    this.countries = topojson.feature(vectors, vectors.objects.countries)

    this.svg = d3.select('.map-canvas').append('svg')
      .attr('class', 'svg-layer')

    this.projection = projection.geoSatellite()

    this.graticule = geo.geoGraticule()
        .extent([[-93, 27], [-47 + 1e-6, 57 + 1e-6]])
        .step([3, 3])

    this.path = geo.geoPath().projection(this.projection)

    console.log(this)
    this.boundaryPaths = this.svg.selectAll('.boundary')
      .data(this.countries.features)
      .enter().insert('path')
      .attr('class', 'boundary')
      .attr('d', this.path);

    window.addEventListener('resize', () => { this.resize() })
    this.resize()
    this.draw()
  }

  draw() {
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

    this.boundaryPaths.attr('d', this.path)
  }

  resize() {
    this.width = this.gl.canvas.parentNode.offsetWidth
    this.height = this.gl.canvas.parentNode.offsetHeight
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
    this.draw()
  }
}
