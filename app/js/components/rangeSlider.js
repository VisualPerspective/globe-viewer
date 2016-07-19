import Vue from 'vue'
import _ from 'lodash'

export default function registerRangeSlider(
  controller,
  propertyMap
) {
  Vue.component('range-slider', Vue.extend({
    init: function () {
      this.updateFormatted = function (vm) {
        vm.formatted = propertyMap[vm.property].formatted(vm)
      }

      this.throttleFormatted = _.throttle(this.updateFormatted, 50)
    },
    ready: function () {
      this.updateFormatted(this)
    },
    data: function () {
      return propertyMap[this.property].data
    },
    props: [
      'label',
      'property',
      'formatted'
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
            step="any"
            v-model="value">
        </div>
      </div>
    `,
    watch: {
      'value': {
        handler: function () {
          this.throttleFormatted(this);
          controller.updated()
        }
      }
    }
  }))
}
