import twgl from 'twgl.js'
import moment from 'moment'

var m4 = twgl.m4

export default class Scene {
  constructor(gl) {
    this.hourOfDay = {
      value: 12, //UTC
      min: 0.001,
      max: 23.999
    }

    this.dayOfYear = {
      value: 182,
      min: 1,
      max: 365
    }

    this.planeBuffer = twgl.primitives.createPlaneBufferInfo(
      gl,
      2, // width
      1, // height
      50, // width subdivisions
      50  // height subdivisions
    )

    this.sphereBuffer = twgl.primitives.createSphereBufferInfo(
      gl,
      1, // radius
      75, // subdivisions around
      75 // vertical subdivisions
    )

    this.textures = twgl.createTextures(gl, {
      diffuseMap: { src: 'data/color-4096.png' },
      topographyMap: { src: 'data/topography-4096.png' },
      bathymetryMap: { src: 'data/bathymetry-4096.png' },
      landmaskMap: { src: 'data/landmask-4096.png' },
      lightsMap: { src: 'data/lights-4096.png' }
    })
  }

  calculatedMoment() {
    return moment('2016-01-01T00:00:00.000Z')
      .utcOffset(0)
      .dayOfYear(this.dayOfYear.value)
      .add(this.hourOfDay.value * 60 * 60, 'seconds')
  }
}
