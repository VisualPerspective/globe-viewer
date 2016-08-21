import Vue from 'vue/dist/vue.js'
import moment from 'moment'
import numeral from 'numeral'
import _ from 'lodash'
import Stats from 'stats.js'

import Scene from './scene'
import Renderer from './renderer'
import Camera from './camera'
import LayerCanvas from './layerCanvas'
import LandMaskLayer from './landMaskLayer'
import BordersLayer from './bordersLayer'
import registerRangeSlider from './components/rangeSlider'
import registerCheckboxOption from './components/checkboxOption'
import registerRenderModes from './components/renderModes'
import registerProjections from './components/projections'

export default class Controller {
  constructor(gl, vectors) {
    this.layerCanvas = new LayerCanvas(gl)
    this.layers = {
      landmask: new LandMaskLayer(gl, vectors, this.layerCanvas),
      borders: new BordersLayer(gl, vectors, this.layerCanvas)
    }

    this.scene = new Scene(gl, this.layerCanvas, this.layers)
    this.renderer = new Renderer(gl, this.scene)

    this.camera = new Camera(gl)

    let noFormat = () => ''

    let degrees = (vm) => {
      return numeral(vm.value).format('0.00') + '°'
    }

    let hour = () => {
      return this.scene.calculatedMoment().format('h:mm a') + ' UTC'
    }

    let day = () => {
      return this.scene.calculatedMoment().format('YYYY-MM-DD')
    }

    let multiple = (vm) => {
      if (vm.value === 1) {
        return '(Realistic) 1x'
      }
      else {
        return numeral(vm.value).format('0.00') + 'X'
      }
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
        formatted: day
      },
      'elevationScale': {
        data: this.scene.elevationScale,
        formatted: multiple
      },
      'rivers': {
        data: this.layers['landmask'].options.rivers,
        layer: 'landmask'
      },
      'countries': {
        data: this.layers['borders'].options.countries,
        layer: 'borders'
      }
    }

    registerRangeSlider(this, propertyMap)
    registerCheckboxOption(this, propertyMap)
    registerRenderModes(this, this.scene)
    registerProjections(this, this.scene)

    //this.enableStats()

    this.vue = new Vue({ el: '.map-controls' })

    this.updateQueued = false
    _.each(this.layers, (layer, name) => {
      _.defer(() => { this.layerUpdated(name) })
    })

    window.addEventListener('resize', () => { this.updated() })
    window.addEventListener('texture-loaded', () => { this.updated() })
  }

  enableStats() {
    this.stats = new Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.dom.style.left = 'auto'
    this.stats.dom.style.right = '0'
    document.body.appendChild(this.stats.dom)
  }

  layerUpdated(layer) {
    this.layers[layer].draw()
  }

  updated() {
    if (!this.updateQueued) {
      this.updateQueued = true
      window.requestAnimationFrame(() => {
        this.renderFrame()
        this.updateQueued = false
        if (!this.loaded) {
          this.loaded = true
          let loading = document.querySelector('.loading')
          loading.parentNode.removeChild(loading)
        }
      })
    }
  }

  renderFrame() {
    if (this.stats) {
      this.stats.begin()
    }

    this.renderer.render(
      window.performance.now(),
      this.scene,
      this.camera,
      this.renderer
    )

    if (this.stats) {
      this.stats.end()
    }
  }
}
