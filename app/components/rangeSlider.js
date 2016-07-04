import Vue from 'vue'

export default function registerRangeSlider(
  controls,
  propertyMap
) {
  Vue.component('range-slider', Vue.extend({
    data: function () {
      return propertyMap[this.property].data
    },
    computed: {
      formatted: function () {
        return propertyMap[this.property].formatted.apply(this)
      }
    },
    props: [
      'label',
      'property'
    ],
    template: `
      <div class="range-slider range-control">
        <div class="top-row">
          <label>{{label}}</label>
          <span>{{formatted}}</span>
        </div>
        <div class="slider">
          <input type='range'
            min='{{min}}'
            max='{{max}}'
            property='{{property}}'
            step="any"
            v-model='value'>
        </div>
      </div>
    `,
    watch: {
      '$data': {
        handler: () => { controls.updated() },
        deep:true
      }
    }
  }))
}
