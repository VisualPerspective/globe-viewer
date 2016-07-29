import platform from 'platform'
import _  from 'lodash'

export function toRadians(degrees) {
  return degrees / 180 * Math.PI
}

// Needed for IE11 compatibility
export function dispatchEvent(name) {
  let evt = document.createEvent('CustomEvent')
  evt.initCustomEvent(name, false, false, {})
  window.dispatchEvent(evt)
}

export function updateCanvasSize(canvas) {
  let width = canvas.parentNode.offsetWidth
  let height = canvas.parentNode.offsetHeight

  if (width + 'px' != canvas.style.width ||
      height + 'px' != canvas.style.height) {
    // set the display size of the canvas
    canvas.style.width = width + "px"
    canvas.style.height = height + "px"

    // set the size of the drawingBuffer
    // https://www.khronos.org/webgl/wiki/HandlingHighDPI
    let devicePixelRatio = (window.devicePixelRatio || 1)
    canvas.width = Math.floor(width * devicePixelRatio)
    canvas.height = Math.floor(height * devicePixelRatio)
  }
}
