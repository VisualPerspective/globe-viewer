import twgl from 'twgl.js'
import planeVert from './plane.vert.glsl'
import sphereVert from './sphere.vert.glsl'
import frag from './shader.frag.glsl'

var m4 = twgl.m4

export default class Renderer {
  constructor(gl) {
    this.gl = gl

    gl.getExtension("OES_standard_derivatives")

    var ext = gl.getExtension("EXT_texture_filter_anisotropic")

    this.planeProgram = twgl.createProgramInfo(gl, [planeVert, frag])
    this.planeBuffer = twgl.primitives.createPlaneBufferInfo(
      gl, 2, 1, 250, 250
    )

    this.sphereProgram = twgl.createProgramInfo(gl, [sphereVert, frag])
    this.sphereBuffer = twgl.primitives.createPlaneBufferInfo(
      gl, 2, 1, 250, 250
    )

    this.textures = twgl.createTextures(gl, {
      diffuseMap: { src: 'data/color-natural-8192.png' },
      topographyMap: { src: 'data/topography-8192.png' },
      bathymetryMap: { src: 'data/bathymetry-8192.png' }
    })

    if (ext) {
      gl.texParameterf(
        gl.TEXTURE_2D,
        ext.TEXTURE_MAX_ANISOTROPY_EXT,
        4
      )

      for (name in this.textures) {
        var texture = this.textures[name]
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      }
    }

    this.uniforms = {
      diffuseMap: this.textures.diffuseMap,
      topographyMap: this.textures.topographyMap,
      bathymetryMap: this.textures.bathymetryMap,
      lightPosition: [1, 1, -1]
    }
  }

  render(time, camera) {
    var gl = this.gl
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    var model = m4.identity()

    var projection = m4.perspective(
      30 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.01,
      10
    )

    var eye = [0, 0, -camera.distance]

    var cameraMatrix = m4.identity()
    cameraMatrix = m4.rotateY(cameraMatrix, -camera.orbit)
    cameraMatrix = m4.rotateX(cameraMatrix, camera.elevation)
    eye = m4.transformPoint(cameraMatrix, eye)

    var target = [0, 0, 0]
    var up = [0, 1, 0]

    var view = m4.inverse(m4.lookAt(eye, target, up))
    var viewProjection = m4.multiply(view, projection)

    Object.assign(this.uniforms, {
      model: model,
      view: view,
      projection: projection
    })

    var program = this.planeProgram;
    var buffer = this.planeBuffer;

    if (camera.sphereMode) {
      program = this.sphereProgram;
      buffer = this.sphereBuffer;
    }

    gl.useProgram(program.program)
    twgl.setBuffersAndAttributes(gl, program, buffer)
    twgl.setUniforms(program, this.uniforms)

    gl.drawElements(
      gl.TRIANGLES,
      buffer.numElements,
      gl.UNSIGNED_SHORT,
      0
    )
  }
}
