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
