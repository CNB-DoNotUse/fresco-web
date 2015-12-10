var fs 				= require('fs'),
	gulp 			= require('gulp'),
	webpack 		= require('webpack-stream'),
	merge 			= require('merge-stream');

var sass 			= require('gulp-sass'),
	concat 			= require('gulp-concat'),
	minifyCss		= require('gulp-minify-css'),
	uglify			= require('gulp-uglify'),
	source			= require('vinyl-source-stream'),
	colors 			= require('colors');


var dependencies 	= require('./lib/dependencies'),
	exclude 		= ['app.js', 'extra.js'];

var sections			= Object.keys(dependencies),
	pages 				= {};

	sections.splice(sections.indexOf('global'), 1);

var views 			= {},
	viewFiles 		= fs.readdirSync('./app/views');

viewFiles.map((file) => {
  if(exclude.indexOf(file) != -1 || !/.jsx?$/.test(file)) return;
  views[file.replace('.js', '')] = ['./app/views/' + file];
});

gulp.task('Build',  () => {

	var cssTasks = [], jsTasks = [];

	// Build page specific CSS and JS
	for (var s in sections) {
		//Define the sections we're in
		var section = sections[s];

		//Define all the pages in this sections
		var pages = Object.keys(dependencies[section]);

		// Build section _global css
		cssTasks.push(
			gulp.src(dependencies.global.css.concat(dependencies[section]._global.css))
				.pipe(concat(section + '.css'))
				.pipe(sass().on('error', sass.logError))
				.pipe(minifyCss())
				.pipe(gulp.dest('./public/stylesheets'))
		);

		// Build section _global JS
		jsTasks.push(
			gulp.src(dependencies.global.js.concat(dependencies[section]._global.js))
				.pipe(concat(section + '.js'))
				.pipe(uglify())
				.pipe(gulp.dest('./public/javascripts'))
		);

		//Take out the global from the pages
		//so now we onyl build the page specific stuff
		pages.splice(pages.indexOf('_global'), 1);
		
		//Loop through all the pages in the sections, not part of the `_global`
		for(var p in pages) {
			
			var pageDependencies = dependencies[section][pages[p]];

			cssTasks.push(
				gulp.src(dependencies.global.css.concat(pageDependencies.css))
					.pipe(concat(pages[s] + '.css'))
					.pipe(sass().on('error', sass.logError))
					.pipe(minifyCss())
					.pipe(gulp.dest('./public/stylesheets/page'))
			);

			jsTasks.push(
				gulp.src(dependencies.global.js.concat(pageDependencies.js))
					.pipe(concat(pages[s] + '.js'))
					.pipe(uglify())
					.pipe(gulp.dest('./public/javascripts/page'))
			);
		}
	}

	return merge(cssTasks, jsTasks);
});

gulp.task('js', (cb) => {
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

gulp.task('watch', () => {
	gulp.watch('./app/sass/**/*.scss', ['css']);
});

gulp.task('default', ['Build']);