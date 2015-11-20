var views = {
  highlights: './app/views/highlights.js',
  galleries: './app/views/galleries.js',
  photos: './app/views/photos.js',
  videos: './app/views/videos.js',
  content: './app/views/content.js',
  stories: './app/views/stories.js',
  storyDetail: './app/views/storyDetail.js',
  galleryDetail: './app/views/galleryDetail.js',
  postDetail: './app/views/postDetail.js'
}

module.exports = [
  {
    name : 'browser',
    entry: views,
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
          presets:['react', 'es2015']
        }
      }],
    },
  },
  {
    name: "server-side rendering",
    entry: views,
    target: "node",
    output: {
      path: 'app/server',
      filename: "[name].js",
      libraryTarget: "commonjs2"
    },
    externals: /^[a-z\-0-9]+$/,
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: ["babel-loader"],
          query:{
            presets:['react']
          }
        }
      ],
    }
  }
];
