var fs 				= require('fs'),
	gulp 			= require('gulp'),
	webpack 		= require('webpack-stream'),
	merge 			= require('merge-stream'),
	runSequence = require('run-sequence');

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

gulp.task('Build Assets',  () => {

	var cssTasks = [], jsTasks = [];

	// Build page specific CSS and JS
	for (var s in sections) {

		//Define the sections we're in
		var section = sections[s];

		console.log('\nSection: ' + section + '\nDEP\n' , dependencies[section]._global.css);

		console.log('\nGlobal :', dependencies.global.css)

		// Build section _global css
		cssTasks.push(
			gulp.src(dependencies.global.css.concat(dependencies[section]._global.css))
				.pipe(concat(section + '.css'))
				.pipe(sass().on('error', sass.logError))
				// .pipe(minifyCss())
				.pipe(gulp.dest('./public/stylesheets'))
		);

		// Build section _global JS
		jsTasks.push(
			gulp.src(dependencies.global.js.concat(dependencies[section]._global.js))
				.pipe(concat(section + '.js'))
				// .pipe(uglify())
				.pipe(gulp.dest('./public/javascripts'))
		);

		//Define all the pages in this sections
		var pages = Object.keys(dependencies[section]);

		//Take out the global from the pages
		//so now we onyl build the page specific stuff
		pages.splice(pages.indexOf('_global'), 1);
		
		//Loop through all the pages in the sections, not part of the `_global`
		for(var p in pages) {
			
			var pageDependencies = dependencies[section][pages[p]];

			// console.log('PAGE:' , pages[p] + ' Dependencies: ' , pageDependencies);

			if(pageDependencies.css.length) {
				cssTasks.push(
					gulp.src(dependencies.global.css.concat(pageDependencies.css))
						.pipe(concat(pages[s] + '.css'))
						.pipe(sass().on('error', sass.logError))
						// .pipe(minifyCss())
						.pipe(gulp.dest('./public/stylesheets/pages'))
				);
			}

			if(pageDependencies.js.length) {
				jsTasks.push(
					gulp.src(dependencies.global.js.concat(pageDependencies.js))
						.pipe(concat(pages[p] + '.js'))
						// .pipe(uglify())
						.pipe(gulp.dest('./public/javascripts/pages'))
				);
			}			
		}
	}

	return merge(cssTasks, jsTasks);
});

gulp.task('Build Webpack', (cb) => {
	return gulp.src('app/views/app.js')
		.pipe(webpack({
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

/**
 * Sequence build, synchronous
 */

gulp.task('Master Build', function(callback) {
  runSequence('Build Assets', 'Build Webpack',
              callback);
});

gulp.task('watch', () => {
	gulp.watch('./app/sass/**/*.scss', ['css']);
});

gulp.task('default', ['Master Build']);