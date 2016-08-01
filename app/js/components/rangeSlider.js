import Vue from 'vue/dist/vue.js'
import _ from 'lodash'

export default function registerRangeSlider(
  controller,
  propertyMap
) {
  Vue.component('range-slider', Vue.extend({
    beforeCreate: function () {
      this.updateFormatted = function (vm) {
        vm.formatted = propertyMap[vm.property].formatted(vm)
      }

      this.throttleFormatted = _.throttle(this.updateFormatted, 50)
    },
    ready: function () {
      this.updateFormatted(this)
    },
    data: function () {
      return _.extend(
        propertyMap[this.property].data,
        { 'formatted': '' }
      )
    },
    props: [
      'label',
      'property',
      'vertical'
    ],
    template: `
      <div v-bind:class="['range-slider', 'range-control', { vertical: vertical }]">
        <div class="top-row">
          <label>{{label}}</label>
          <span>{{formatted}}</span>
        </div>
        <div class="slider">
          <input type='range'
            :min='min'
            :max='max'
            step="any"
            v-model.number="value">
        </div>
      </div>
    `,
    watch: {
      'value': {
        handler: function () {
          this.throttleFormatted(this)
          controller.updated()
        }
      }
    }
  }))
}
