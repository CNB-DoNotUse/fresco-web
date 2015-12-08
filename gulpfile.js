var fs = require('fs'),
	gulp = require('gulp'),
	browserify = require('browserify'),
	babelify = require('babelify'),
	source = require('vinyl-source-stream');

var paths = {
	js: 'app/views/*.js',
	scss: 'app/sass/**/*.scss'
}

var pages = [];
var exclude = ['app.js'];
var files = fs.readdirSync('./app/views');

files.map(function(file) {
  if(exclude.indexOf(file) != -1 || !/.jsx?$/.test(file)) 
    return;
  pages.push(file);
});

gulp.task('js', function() {
	pages.map(function(page) {
		browserify('./app/views/' + page)
		.transform('babelify', {presets: ['es2015', 'react']})
		.bundle()
		.pipe(source(page))
		.pipe(gulp.dest('public/javascripts/pages'));
	});
});

gulp.task('watch', function() {
	gulp.watch(paths.js, ['js']);
});

gulp.task('default', ['watch', 'js']);