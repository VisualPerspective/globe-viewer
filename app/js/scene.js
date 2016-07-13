import twgl from 'twgl.js'
import moment from 'moment'

import octahedronSphere from './octahedronSphere'
import sunCoordinates from './coordinates.js'

const m4 = twgl.m4

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
}
