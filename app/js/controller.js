import Vue from 'vue'
import moment from 'moment'
import numeral from 'numeral'

import Scene from './scene'
import Renderer from './renderer'
import Camera from './camera'
import PerformanceStats from './performanceStats'
import registerRangeSlider from './components/rangeSlider'
import registerDebugPanel from './components/debugPanel'

export default class Controller {
  constructor(gl) {
    this.scene = new Scene(gl)
    this.renderer = new Renderer(gl, this.scene)
    this.camera = new Camera(gl)
    this.performanceStats = new PerformanceStats()

    let noFormat = function () {
      return ''
    }

    let degrees = function () {
      return numeral(this.value).format('0.00') + '°'
    }

    let hour = () => {
      return this.scene.calculatedMoment().format('h:mm a') + ' UTC'
    }

    let days = () => {
      return this.scene.calculatedMoment().format('YYYY-MM-DD')
    }

    let propertyMap = {
      'latitude': {
        data: this.camera.latitude,
        formatted: degrees
      },
      'longitude': {
        data: this.camera.longitude,
        formatted: degrees
      },
      'zoom': {
        data: this.camera.zoom,
        formatted: noFormat
      },
      'hourOfDay': {
        data: this.scene.hourOfDay,
        formatted: hour
      },
      'dayOfYear': {
        data: this.scene.dayOfYear,
        formatted: days
      }
    }

    registerRangeSlider(this, propertyMap)
    registerDebugPanel(this.performanceStats)

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
