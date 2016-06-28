import Vue from 'vue'

export default class Controller {
  constructor(camera) {
    var propertyMap = {
      'latitude': camera.latitude,
      'longitude': camera.longitude,
      'zoom': camera.zoom
    }

    Vue.component('range-slider', Vue.extend({
      data: function () {
        return propertyMap[this.property]
      },
      props: [
        'label',
        'property'
      ],
      template: `
        <div class="range-slider">
          <label>{{label}}</label>
          <div class="slider">
	    <input type='range'
	      min='{{min}}'
	      max='{{max}}'
              property='{{property}}'
              step="any"
	      v-model='value'>
	    <input type='number'
	      v-model='value'
              step="any">
          </div>
        </div>
      `
    }))

    this.vue = new Vue({ el: '.map-container' })
    window.vue = this.vue
  }
}
