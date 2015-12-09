var fs = require('fs'),
	gulp = require('gulp'),
	gutil = require("gulp-util"),
	webpack = require("webpack-stream"),
	sass = require('gulp-sass');

var exclude = ['app.js'];

var views = {};

var files = fs.readdirSync('./app/views');
files.map(function(file) {
  if(exclude.indexOf(file) != -1 || !/.jsx?$/.test(file)) 
    return;
  views[file.replace('.js', '')] = './app/views/' + file;
});

gulp.task('css', function () {
	gulp.src('./app/sass/screen.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('js', function(cb) {
	return gulp.src('app/views/app.js')
		.pipe(webpack({
			watch: true,
			entry: views,
		    output: {
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
		}))
		.pipe(gulp.dest('./public/javascripts/pages'));
});

gulp.task('watch', function() {
	gulp.watch('./app/sass/**/*.scss', ['css']);
});

gulp.task('default', ['watch', 'css', 'js']);