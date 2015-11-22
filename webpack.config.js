var views = {
  admin: './app/views/admin.js',
  highlights: './app/views/highlights.js',
  galleries: './app/views/galleries.js',
  photos: './app/views/photos.js',
  videos: './app/views/videos.js',
  content: './app/views/content.js',
  stories: './app/views/stories.js',
  storyDetail: './app/views/storyDetail.js',
  galleryDetail: './app/views/galleryDetail.js',
  postDetail: './app/views/postDetail.js',
  storyDetail: './app/views/storyDetail.js'
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
