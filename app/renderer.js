import twgl from 'twgl.js'
import sunCoordinates from 'coordinates.js'
import globeVert from './shaders/globe.vert.glsl'
import frag from './shaders/shader.frag.glsl'

var m4 = twgl.m4

export default class Renderer {
  constructor(gl, scene) {
    this.gl = gl

    gl.clearColor(0, 0, 0, 0);

    gl.getExtension("OES_standard_derivatives")
    var ext = gl.getExtension("EXT_texture_filter_anisotropic")

    gl.texParameterf(gl.TEXTURE_2D,
      ext.TEXTURE_MAX_ANISOTROPY_EXT, 16)

    this.uniforms = {}
    for (name in scene.textures) {
      var texture = scene.textures[name]
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 16)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

      this.uniforms[name] = texture
    }

    this.planeProgram = twgl.createProgramInfo(gl, [planeVert, frag])
    this.sphereProgram = twgl.createProgramInfo(gl, [sphereVert, frag])

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
  }

  render(time, scene, camera) {
    var gl = this.gl
    var width = gl.canvas.parentNode.offsetWidth
    var height = gl.canvas.parentNode.offsetHeight

    if (width + 'px' != gl.canvas.style.width ||
        height + 'px' != gl.canvas.style.height) {
      // set the display size of the canvas.
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";

      // set the size of the drawingBuffer
      var devicePixelRatio = window.devicePixelRatio || 1;
      gl.canvas.width = Math.floor(width * devicePixelRatio);
      gl.canvas.height = Math.floor(height * devicePixelRatio);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      console.log(gl.canvas.width, gl.canvas.height)
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    var model = m4.identity()
    var light = m4.identity()

    var time = scene.calculatedMoment()
    var sun = sunCoordinates(_.toInteger(time.format('x')))

    light = m4.rotateY(light, -sun.hourAngle)
    light = m4.rotateZ(light, -sun.declination)

    var projection = m4.perspective(
      30 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.01,
      10
    )

    let eye = [0, 0, -(4.5 - camera.zoom.value * 3)]
    let cameraMatrix = m4.rotateY(m4.identity(),
      -(camera.longitude.value / 180 * Math.PI) + Math.PI / 2
    )

    cameraMatrix = m4.rotateX(cameraMatrix,
      camera.latitude.value / 180 * Math.PI
    )

    eye = m4.transformPoint(cameraMatrix, eye)
    let up = m4.transformPoint(cameraMatrix, [0, 1, 0])
    let target = [0, 0, 0]

    let view = m4.inverse(m4.lookAt(eye, target, up))
    let viewProjection = m4.multiply(view, projection)

    Object.assign(this.uniforms, {
      model: model,
      view: view,
      projection: projection,
      eye: eye,
      time: time,
      lightDirection: m4.transformPoint(light, [-1, 0, 0])
    })

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
}
