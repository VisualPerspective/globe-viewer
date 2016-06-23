import twgl from 'twgl.js'
import planeVert from './shaders/plane.vert.glsl'
import sphereVert from './shaders/sphere.vert.glsl'
import frag from './shaders/shader.frag.glsl'

var m4 = twgl.m4

export default class Renderer {
  constructor(gl, scene) {
    this.gl = gl

    gl.clearColor(0, 0, 0, 0);

    gl.getExtension("OES_standard_derivatives")
    var ext = gl.getExtension("EXT_texture_filter_anisotropic")

    gl.texParameterf(gl.TEXTURE_2D,
      ext.TEXTURE_MAX_ANISOTROPY_EXT, 4)

    this.uniforms = {
      lightDirection: [1, 0.2, -1]
    }

    for (name in scene.textures) {
      var texture = scene.textures[name]
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 16)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

      this.uniforms[name] = texture
    }

    this.planeProgram = twgl.createProgramInfo(gl, [planeVert, frag])
    this.sphereProgram = twgl.createProgramInfo(gl, [sphereVert, frag])

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  render(time, scene, camera) {
    var gl = this.gl
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    var model = m4.identity()
    var light = m4.identity()

    var projection = m4.perspective(
      30 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.01,
      10
    )

    var sphereEye = [0, 0, -(1.5 + camera.zoom * 3)]
    var sphereCamera = m4.identity()
    sphereCamera = m4.rotateY(sphereCamera,
      -(camera.longitude / 180 * Math.PI) + Math.PI / 2
    )
    sphereCamera = m4.rotateX(sphereCamera, (camera.latitude / 180 * Math.PI))
    sphereEye = m4.transformPoint(sphereCamera, sphereEye)
    var sphereUp = m4.transformPoint(sphereCamera, [0, 1, 0])
    var sphereTarget = [0, 0, 0]

    var planeEye = [0, (0.2 + camera.zoom * 2), 0]
    var planeCamera = m4.identity()
    planeCamera = m4.translate(planeCamera, [
      (camera.longitude / 180),
      0,
      (camera.latitude / 180)
    ])
    planeEye = m4.transformPoint(planeCamera, planeEye)
    var planeUp = [0, 0, 1]
    var planeTarget = m4.transformPoint(planeCamera, [0, 0, 0])

    var program = this.planeProgram
    var buffer = scene.planeBuffer
    var eye = planeEye
    var up = planeUp
    var target = planeTarget

    if (camera.sphereMode) {
      program = this.sphereProgram
      buffer = scene.sphereBuffer
      eye = sphereEye
      up = sphereUp
      target = sphereTarget
    }

    var view = m4.inverse(m4.lookAt(eye, target, up))
    var viewProjection = m4.multiply(view, projection)

    Object.assign(this.uniforms, {
      model: model,
      view: view,
      projection: projection,
      planeEye: planeEye,
      sphereEye: sphereEye,
      time: time,
      lightDirection: m4.transformPoint(light, [1, 0.2, -1])
    })

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
