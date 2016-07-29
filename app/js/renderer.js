import twgl from 'twgl.js'
import globeVert from '../shaders/globe.vert.glsl'
import dayAndNightFrag from '../shaders/dayAndNight.frag.glsl'
import dayFrag from '../shaders/day.frag.glsl'
import nightFrag from '../shaders/night.frag.glsl'
import elevationFrag from '../shaders/elevation.frag.glsl'
import { updateCanvasSize } from './utils'

const m4 = twgl.m4

export default class Renderer {
  constructor(gl, scene) {
    this.gl = gl

    gl.clearColor(1, 1, 1, 1)

    this.derivatives = gl.getExtension('OES_standard_derivatives')
    this.anisotropic = gl.getExtension('EXT_texture_filter_anisotropic')

    this.uniforms = {}
    for (name in scene.textures) {
      let texture = scene.textures[name]
      this.setupGlobeTexture(gl, texture)
      this.uniforms[name] = texture
    }

    this.programs = {
      'dayAndNight': twgl.createProgramInfo(gl, [globeVert, dayAndNightFrag]),
      'day': twgl.createProgramInfo(gl, [globeVert, dayFrag]),
      'night': twgl.createProgramInfo(gl, [globeVert, nightFrag]),
      'elevation': twgl.createProgramInfo(gl, [globeVert, elevationFrag])
    }

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
  }

  setupGlobeTexture(gl, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture)

    if (this.anisotropic) {
      gl.texParameterf(
        gl.TEXTURE_2D,
        this.anisotropic.TEXTURE_MAX_ANISOTROPY_EXT,
        16
      )
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  }

  render(time, scene, camera) {
    let gl = this.gl
    updateCanvasSize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let model = m4.identity()
    let light = scene.getSunVector()

    Object.assign(
      this.uniforms,
      camera.getRenderValues(gl),
      scene.getElevationScales(),
      {
        model: model,
        time: time,
        lightDirection: m4.transformPoint(light, [-1, 0, 0])
      }
    )

    let program = this.programs[scene.renderMode]
    gl.useProgram(program.program)
    twgl.setBuffersAndAttributes(gl, program, scene.globeBuffer)
    twgl.setUniforms(program, this.uniforms)

    gl.drawElements(
      gl.TRIANGLES,
      scene.globeBuffer.numElements,
      gl.UNSIGNED_SHORT,
      0
    )
  }
}
