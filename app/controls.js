import Vue from 'vue'
import registerRangeSlider from 'components/rangeSlider'
import registerRangeStepper from 'components/rangeStepper'

export default class Controls {
  constructor(scene, camera) {
    var propertyMap = {
      'latitude': {
        data: camera.latitude,
        formatted: function () { return '' }
      },
      'longitude': {
        data: camera.longitude,
        formatted: function () { return '' }
      },
      'zoom': {
        data: camera.zoom,
        formatted: function () { return '' }
      },
      'hourOfDay': {
        data: scene.hourOfDay,
        formatted: function () { return '' }
      },
      'dayOfYear': {
        data: scene.dayOfYear,
        formatted: function () { return '' }
      }
    }

    registerRangeSlider(propertyMap)
    registerRangeStepper(propertyMap)

    this.vue = new Vue({ el: '.map-container' })
    window.vue = this.vue
  }
}
