var fs = require('fs');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

var exclude = ['app.js'];

var views = {};

var files = fs.readdirSync('./app/views');
files.map(function(file) {
  if(exclude.indexOf(file) != -1 || !/.jsx?$/.test(file)) 
    return;
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
    }
  }
];
