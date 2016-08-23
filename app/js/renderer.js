import twgl from 'twgl.js'
import Shaders from './shaders.js'

const m4 = twgl.m4

export default class Renderer {
  constructor(gl, scene) {
    this.gl = gl

    gl.clearColor(0, 0, 0, 0)

    this.derivatives = gl.getExtension('OES_standard_derivatives')
    this.anisotropic = gl.getExtension('EXT_texture_filter_anisotropic')

    this.uniforms = {}
    for (name in scene.textures) {
      let texture = scene.textures[name]
      this.setupGlobeTexture(gl, texture)
      this.uniforms[name] = texture
    }

    this.shaders = new Shaders(gl)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    window.addEventListener('texture-loaded', (e) => {
      this.uniforms[e.detail.texture + 'Size'] = new Float32Array([
        e.detail.width,
        e.detail.height
      ])
    })

    this.updateCanvasSize(gl)
    window.addEventListener('resize', () => {
      this.updateCanvasSize(gl)
    })
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

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let model = m4.identity()
    let light = scene.getSunVector()

    Object.assign(
      this.uniforms,
      camera.getValues(scene.projection),
      scene.getElevationScales(),
      {
        model: model,
        time: time,
        lightDirection: m4.transformPoint(light, [-1, 0, 0]),
        flatProjection: scene.projection == 'plane'
      }
    )

    let program = this.shaders.getProgram(scene.projection, scene.renderMode)

    gl.useProgram(program.program)
    twgl.setBuffersAndAttributes(
      gl, program, scene[scene.projection + 'Buffer']
    )
    twgl.setUniforms(program, this.uniforms)

    gl.drawElements(
      gl.TRIANGLES,
      scene[scene.projection + 'Buffer'].numElements,
      gl.UNSIGNED_SHORT,
      0
    )
  }

  updateCanvasSize(gl) {
    let width = gl.canvas.parentNode.offsetWidth
    let height = gl.canvas.parentNode.offsetHeight

    if (width + 'px' != gl.canvas.style.width ||
        height + 'px' != gl.canvas.style.height) {
      // set the display size of the canvas
      gl.canvas.style.width = width + "px"
      gl.canvas.style.height = height + "px"

      // set the size of the drawingBuffer
      // https://www.khronos.org/webgl/wiki/HandlingHighDPI
      let devicePixelRatio = window.devicePixelRatio || 1

      // Slightly lower res on retina-ish displays
      if (devicePixelRatio > 1 && width > 1500) {
        devicePixelRatio -= 0.5
      }

      gl.canvas.width = Math.floor(width * devicePixelRatio)
      gl.canvas.height = Math.floor(height * devicePixelRatio)

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }
  }
}
