import Vue from 'vue'

export default function registerRangeStepper(propertyMap) {
  Vue.component('range-stepper', Vue.extend({
    data: function () {
      return propertyMap[this.property]
    },
    props: [
      'label',
      'property'
    ],
    template: `
      <div class="range-stepper range-control">
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
}
