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

// globalCompositeOperation doesn't work as expected
// on some platforms, so for now just skip it which results
// in somewhat blurrier borders/rivers
export function compositeOperation(ctx, mode) {
  if (!_.includes(platform.name, ['IE', 'Edge', 'Chrome Mobile'])) {
    ctx.globalCompositeOperation = mode
  }
}
