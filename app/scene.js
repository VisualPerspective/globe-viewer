import twgl from 'twgl.js'
import moment from 'moment'

import sunCoordinates from 'coordinates.js'

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

    this.globeBuffer = twgl.primitives.createSphereBufferInfo(
      gl,
      1, // radius
      75, // subdivisions around
      75 // vertical subdivisions
    )

    this.textures = twgl.createTextures(gl, {
      diffuseMap: { src: 'data/color-4096.png' },
      topographyMap: { src: 'data/topo-bathy-4096.png' },
      landmaskMap: { src: 'data/landmask-4096.png' },
      lightsMap: { src: 'data/lights-4096.png' }
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
