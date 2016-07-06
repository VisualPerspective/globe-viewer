import Vue from 'vue'

export default function registerRenderModes(
  controller,
  scene
) {
  Vue.component('render-modes', Vue.extend({
    data: function () {
      return scene
    },
    computed: {},
    props: [],
    template: `
      <div class="render-modes">
        <div class="top-row">
          <label>Mode</label>
        </div>
        <div class="radio-buttons">
          <label>
            <input type="radio" name="render-mode"
              value="dayAndNight" v-model="renderMode"
              checked>
            Day and Night
          </label>
          <div v-if="renderMode == 'dayAndNight'" class="sub-group">
            <range-slider
              label="Hour of Day"
              property="hourOfDay">
            </range-slider>
            <range-slider
              label="Day of Year"
              property="dayOfYear">
            </range-slider>
          </div>
          <label>
            <input type="radio" name="render-mode"
              value="day" v-model="renderMode">
            Day
          </label>
          <label>
            <input type="radio" name="render-mode"
              value="night" v-model="renderMode">
            Night
          </label>
        </div>
      </div>
    `,
    watch: {
      '$data': {
        handler: () => { controller.updated() },
        deep:true
      }
    }
  }))
}
