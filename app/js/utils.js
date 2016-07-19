import platform from 'platform'

export function toRadians(degrees) {
  return degrees / 180 * Math.PI
}

// Needed for IE11 compatibility
export function dispatchEvent(name) {
  let evt = document.createEvent('CustomEvent')
  evt.initCustomEvent(name, false, false, {})
  window.dispatchEvent(evt)
}

// Edge becomes unstable if this is used
export function compositeOperation(ctx, mode) {
  if (platform.name == 'IE' || platform.name == 'Edge') {
    ctx.globalCompositeOperation = mode
  }
}
