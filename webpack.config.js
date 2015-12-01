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
  outlet: './app/views/outlet.js',
  postDetail: './app/views/postDetail.js',
  purchases: './app/views/purchases.js',
  storyDetail: './app/views/storyDetail.js',
  assignmentDetail: './app/views/assignmentDetail.js',
  dispatch: './app/views/dispatch.js'
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
