import twgl from 'twgl.js'
import moment from 'moment'

import ControlRange from './controlRange'
import octahedronSphere from './octahedronSphere'
import sunCoordinates from './coordinates.js'

const m4 = twgl.m4

export default class Scene {
  constructor(gl) {
    this.hourOfDay = new ControlRange(12, 0.001, 23.999)
    this.dayOfYear = new ControlRange(182, 1, 365)

    this.elevationScale = new ControlRange(25, 1, 50)

    let sphere = octahedronSphere(6) // approx 30k vertices

    this.globeBuffer = twgl.createBufferInfoFromArrays(gl, {
      position: { numComponents: 3, data: _.flattenDeep(sphere.triangles) },
      texcoord: { numComponents: 2, data: _.flattenDeep(sphere.uvs) }
    })

    this.renderMode = 'dayAndNight'

    this.textures = twgl.createTextures(gl, {
      diffuseMap: {
        format: gl.RGB,
        internalFormat: gl.RGB,
        src: 'data/color-4096.jpg'
      },
      topographyMap: {
        format: gl.LUMINANCE,
        internalFormat: gl.LUMINANCE,
        src: 'data/topo-bathy-4096.jpg'
      },
      landmaskMap: {
        src: 'data/landmask-4096.png',
        format: gl.LUMINANCE,
        internalFormat: gl.LUMINANCE,
      },
      lightsMap: {
        src: 'data/lights-4096.png',
        format: gl.LUMINANCE,
        internalFormat: gl.LUMINANCE,
      }
    }, () => {
      window.dispatchEvent(new Event('texture-loaded'))
    })
  }

  calculatedMoment() {
    return moment('2016-01-01T00:00:00.000Z')
      .utcOffset(0)
      .dayOfYear(this.dayOfYear.value)
      .add(this.hourOfDay.value * 60 * 60, 'seconds')
  }

  getSunVector() {
    let moment = this.calculatedMoment()
    let sun = sunCoordinates(_.toInteger(moment.format('x')))

    let light = m4.identity()
    light = m4.rotateY(light, -sun.hourAngle)
    light = m4.rotateZ(light, -sun.declination)
    return light
  }

  getElevationScales() {
    var land = 8848 / 6371000
    var ocean = 0

    if (this.renderMode === 'elevation') {
      land = this.elevationScale.value * land
      ocean = -this.elevationScale.value * (10034 / 6371000)
    }

    return {
      oceanElevationScale: ocean,
      landElevationScale: land
    }
  }
}
