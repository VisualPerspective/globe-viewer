import Vue from 'vue'
import moment from 'moment'
import numeral from 'numeral'
import registerRangeSlider from 'components/rangeSlider'
import registerDebugPanel from 'components/debugPanel'

export default class Controls {
  constructor(renderer, scene, camera, performanceStats) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.performanceStats = performanceStats

    var noFormat = function () {
      return ''
    }

    var degrees = function () {
      return numeral(this.value).format('0.00') + '°'
    }

    var hour = function () {
      return scene.calculatedMoment().format('h:mm a') + ' UTC'
    }

    var days = function () {
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

    registerRangeSlider(this, propertyMap)
    registerDebugPanel(performanceStats)

    this.vue = new Vue({
      el: '.map-container'
    })

    this.updateQueued = false
    this.updated()
    window.addEventListener('resize', () => { this.updated() })
    window.addEventListener('texture-loaded', () => { this.updated() })
  }

  updated() {
    if (!this.updateQueued) {
      this.updateQueued = true
      window.requestAnimationFrame(() => {
        this.renderFrame()
        this.updateQueued = false
      })
    }
  }

  renderFrame() {
    this.renderer.render(
      window.performance.now(),
      this.scene,
      this.camera,
      this.renderer
    )

    this.performanceStats.countFrame()
  }
}
