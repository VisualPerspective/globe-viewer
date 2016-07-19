import Vue from 'vue'
import _ from 'lodash'

export default function registerCheckboxOption(
  controller,
  propertyMap
) {
  Vue.component('checkbox-option', Vue.extend({
    data: function () {
      return propertyMap[this.property].data
    },
    props: [
      'label',
      'property'
    ],
    template: `
      <label class="checkbox-option">
        <input type="checkbox" v-model="enabled">
        {{label}}
      </label>
    `,
    watch: {
      'enabled': {
        handler: function () {
          controller.updated(true)
        }
      }
    }
  }))
}
