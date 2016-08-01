import platform from 'platform'
import _  from 'lodash'

export function toRadians(degrees) {
  return degrees / 180 * Math.PI
}

// Needed for IE11 compatibility
export function dispatchEvent(name, detail) {
  let evt = document.createEvent('CustomEvent')
  evt.initCustomEvent(name, false, false, detail || {})
  window.dispatchEvent(evt)
}
