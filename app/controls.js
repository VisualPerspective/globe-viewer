import Vue from 'vue'
import moment from 'moment'
import numeral from 'numeral'
import registerRangeSlider from 'components/rangeSlider'

export default class Controls {
  constructor(scene, camera) {
    var noFormat = function() {
      return ''
    }

    var degrees = function() {
      return numeral(this.value).format('0.00') + '°'
    }

    var hour = function() {
      return scene.calculatedMoment().format('h:mm a') + ' UTC'
    }

    var days = function() {
      return scene.calculatedMoment().format('YYYY-MM-DD')
    }

    var propertyMap = {
      'latitude': {
        data: camera.latitude,
        formatted: degrees
      },
      'longitude': {
        data: camera.longitude,
        formatted: degrees
      },
      'zoom': {
        data: camera.zoom,
        formatted: noFormat
      },
      'hourOfDay': {
        data: scene.hourOfDay,
        formatted: hour
      },
      'dayOfYear': {
        data: scene.dayOfYear,
        formatted: days
      }
    }

    registerRangeSlider(propertyMap)

    this.vue = new Vue({ el: '.map-container' })
    window.vue = this.vue
  }
}
