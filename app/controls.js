import Vue from 'vue'
import registerRangeSlider from 'components/rangeSlider'
import registerRangeStepper from 'components/rangeStepper'

export default class Controls {
  constructor(camera) {
    var propertyMap = {
      'latitude': camera.latitude,
      'longitude': camera.longitude,
      'zoom': camera.zoom
    }

    registerRangeSlider(propertyMap)
    registerRangeStepper(propertyMap)

    this.vue = new Vue({ el: '.map-container' })
    window.vue = this.vue
  }
}
