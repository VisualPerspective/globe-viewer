import Vue from 'vue'
import _ from 'lodash'

export default function registerCheckboxOption(
  controller,
  propertyMap
) {
  Vue.component('checkbox-option', Vue.extend({
    data: function () {
      console.log(propertyMap[this.property].data)
      return propertyMap[this.property].data
    },
    props: [
      'label',
      'property'
    ],
    template: `
      <div class="checkbox-option">
        <label>
          <input type="checkbox" v-model="enabled">
          {{label}}
        </label>
      </div>
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
