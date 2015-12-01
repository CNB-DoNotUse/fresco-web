var fs = require('fs');

var exclude = ['app.js'];

var views = {};

var files = fs.readdirSync('./app/views');
files.map(function(file) {
  if(exclude.indexOf(file) != -1) return;
  views[file.replace('.js', '')] = './app/views/' + file;
});

module.exports = [
  {
    name : 'browser',
    entry: views,
    output: {
      path: 'public/javascripts/pages',
      filename: "[name].js"
    },
    module: {
      loaders: [
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'react']
          }
        }
      ]
    },
  }
];
