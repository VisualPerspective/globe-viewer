import Vue from 'vue/dist/vue.js'

export default function registerProjections(
  controller,
  scene
) {
  Vue.component('projections', Vue.extend({
    data: function () {
      return scene
    },
    computed: {},
    props: [],
    template: `
      <div class="projections">
        <div class="radio-buttons">
          <div class="radio-button"
            v-bind:class="{ active: projection == 'sphere' }">
            <label>
              <input type="radio" name="projection"
                value="sphere" v-model="projection">
              Globe
            </label>
          </div>
          <div class="radio-button"
            v-bind:class="{ active: projection == 'plane' }">
            <label>
              <input type="radio" name="projection"
                value="plane" v-model="projection">
              Flat
            </label>
          </div>
        </div>
      </div>
    `,
    watch: {
      'projection': {
        handler: () => { controller.updated() }
      }
    }
  }))
}
