import { createProgramInfo as create } from 'twgl.js'
import sphereVert from '../shaders/sphere.vert.glsl'
import planeVert from '../shaders/plane.vert.glsl'
import dayAndNightFrag from '../shaders/dayAndNight.frag.glsl'
import dayFrag from '../shaders/day.frag.glsl'
import nightFrag from '../shaders/night.frag.glsl'
import elevationFrag from '../shaders/elevation.frag.glsl'

export default class Shaders {
  constructor(gl) {
    this.shaders = {
      'sphere': {
        'dayAndNight': create(gl, [sphereVert, dayAndNightFrag]),
        'day': create(gl, [sphereVert, dayFrag]),
        'night': create(gl, [sphereVert, nightFrag]),
        'elevation': create(gl, [sphereVert, elevationFrag])
      },
      'plane': {
        'dayAndNight': create(gl, [planeVert, dayAndNightFrag]),
        'day': create(gl, [planeVert, dayFrag]),
        'night': create(gl, [planeVert, nightFrag]),
        'elevation': create(gl, [planeVert, elevationFrag])
      }
    }
  }

  getProgram(projection, renderMode) {
    return this.shaders[projection][renderMode]
  }
}
