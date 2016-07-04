import twgl from 'twgl.js'
import sunCoordinates from 'coordinates.js'
import globeVert from './shaders/globe.vert.glsl'
import frag from './shaders/shader.frag.glsl'

const m4 = twgl.m4

export default class Renderer {
  constructor(gl, scene) {
    this.gl = gl

    gl.clearColor(0, 0, 0, 0);

    gl.getExtension("OES_standard_derivatives")
    this.anisotropic = gl.getExtension("EXT_texture_filter_anisotropic")

    this.uniforms = {}
    for (name in scene.textures) {
      let texture = scene.textures[name]
      this.setupGlobeTexture(gl, texture)
      this.uniforms[name] = texture
    }

    this.globeProgram = twgl.createProgramInfo(gl, [globeVert, frag])

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
    this.updateCanvasSize(gl);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let model = m4.identity()
    let light = m4.identity()

    let moment = scene.calculatedMoment()
    let sun = sunCoordinates(_.toInteger(moment.format('x')))

    light = m4.rotateY(light, -sun.hourAngle)
    light = m4.rotateZ(light, -sun.declination)

    Object.assign(
      this.uniforms,
      camera.getRenderValues(gl),
      {
        model: model,
        time: time,
        lightDirection: m4.transformPoint(light, [-1, 0, 0])
      }
    )

    gl.useProgram(this.globeProgram.program)
    twgl.setBuffersAndAttributes(gl, this.globeProgram, scene.globeBuffer)
    twgl.setUniforms(this.globeProgram, this.uniforms)

    gl.drawElements(
      gl.TRIANGLES,
      scene.globeBuffer.numElements,
      gl.UNSIGNED_SHORT,
      0
    )
  }

  updateCanvasSize(gl) {
    let width = gl.canvas.parentNode.offsetWidth
    let height = gl.canvas.parentNode.offsetHeight

    if (width + 'px' != gl.canvas.style.width ||
        height + 'px' != gl.canvas.style.height) {
      // set the display size of the canvas.
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";

      // set the size of the drawingBuffer
      let devicePixelRatio = window.devicePixelRatio || 1;
      gl.canvas.width = Math.floor(width * devicePixelRatio);
      gl.canvas.height = Math.floor(height * devicePixelRatio);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }
  }
}
