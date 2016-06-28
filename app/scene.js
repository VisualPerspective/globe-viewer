import twgl from 'twgl.js'

var m4 = twgl.m4

export default class Scene {
  constructor(gl) {
    this.time = {
      value: 12, //UTC
      min: 0,
      max: 24
    }

    this.season = {
      value: 0.5, // 0-1 Jan1 - Dec31
      min: 0.0,
      max: 1.0
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
}
