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
          <div class="radio-button"
            v-bind:class="{ active: renderMode == 'dayAndNight' }">
            <label>
              <input type="radio" name="render-mode"
                value="dayAndNight" v-model="renderMode"
                checked>
              Day and Night
            </label>
            <div v-show="renderMode == 'dayAndNight'" class="sub-group">
              <range-slider
                label="Hour of Day"
                property="hourOfDay">
              </range-slider>
              <range-slider
                label="Day of Year"
                property="dayOfYear">
              </range-slider>
            </div>
          </div>
          <div class="radio-button"
            v-bind:class="{ active: renderMode == 'day' }">
            <label>
              <input type="radio" name="render-mode"
                value="day" v-model="renderMode">
              Day
            </label>
          </div>
          <div class="radio-button"
            v-bind:class="{ active: renderMode == 'night' }">
            <label>
              <input type="radio" name="render-mode"
                value="night" v-model="renderMode">
              Night
            </label>
          </div>
          <div class="radio-button"
            v-bind:class="{ active: renderMode == 'elevation' }">
            <label>
              <input type="radio" name="render-mode"
                value="elevation" v-model="renderMode">
              Elevation
            </label>
            <div v-show="renderMode == 'elevation'" class="sub-group">
              <range-slider
                label="Elevation Scale"
                property="elevationScale">
              </range-slider>
            </div>
          </div>
        </div>
      </div>
    `,
    watch: {
      'renderMode': {
        handler: () => { controller.updated() }
      }
    }
  }))
}
