module.exports = {
  entry: {
    highlights: './app/pages/highlights.js',
    galleries: './app/pages/galleries.js'
  },
  output: {
    path: 'public/javascripts/pages',
    filename: "[name].js"
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: ["babel-loader"],
      query:{
        presets:['react']
      }
    }],
  }
};
