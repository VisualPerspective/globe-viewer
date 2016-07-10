module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'app.js': /^app/
      }
    },
    stylesheets: {joinTo: 'app.css'}
  },

  plugins: {
    babel: {
      presets: ['es2015'],
      plugins: ['transform-object-assign']
    }
  },

  server: {
    hostname: '0.0.0.0'
  }
};
