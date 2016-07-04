import Vue from 'vue'

export default function registerDebugPanel(
  performanceStats
) {
  Vue.component('debug-panel', Vue.extend({
    data: function () {
      return performanceStats
    },
    computed: {
      formattedFps: function () {
        return numeral(this.fps).format('0.00')
      }
    },
    template: `
      <div class="debug-panel">
        <div class="top-row">
          <label>FPS</label>
          <span>{{formattedFps}}</span>
        </div>
      </div>
    `
  }))
}
