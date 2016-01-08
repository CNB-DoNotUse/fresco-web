var fs 				= require('fs'),
	argv			= require('yargs').argv,
	gulp 			= require('gulp'),
	gulpif 			= require('gulp-if'),
	webpack 		= require('webpack'),
	webpackStream 	= require('webpack-stream'),
	merge 			= require('merge-stream'),
	runSequence 	= require('run-sequence');

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

/**
 * Assets task, based on `dependecies.js`
 */

gulp.task('Build Assets',  () => {

	var cssTasks = [], jsTasks = [];

	// Build page specific CSS and JS
	for (var s in sections) {

		//Define the sections we're in
		var section = sections[s];

		// console.log('\nSection: ' + section , dependencies[section]._global.css);

		// Build section _global css
		cssTasks.push(
			gulp.src(dependencies.global.css.concat(dependencies[section]._global.css))
				.pipe(concat(section + '.css'))
				.pipe(sass().on('error', sass.logError))
				.pipe(gulpif(argv.production, minifyCss()))
				.pipe(gulp.dest('./public/css'))
		);

		// Build section _global JS
		jsTasks.push(
			gulp.src(dependencies.global.js.concat(dependencies[section]._global.js))
				.pipe(concat(section + '.js'))
				.pipe(gulpif(argv.production, uglify()))
				.pipe(gulp.dest('./public/js'))
		);

		//Define all the pages in this sections
		var pages = Object.keys(dependencies[section]);

		//Take out the global from the pages
		//so now we only build the page specific stuff
		pages.splice(pages.indexOf('_global'), 1);

		//Loop through all the pages in the sections, not part of the `_global`
		for(var p in pages) {

			var pageDependencies = dependencies[section][pages[p]];

			// console.log('\nPage:' , pages[p] , pageDependencies);

			if(pageDependencies.css.length) {
				cssTasks.push(
					gulp.src(pageDependencies.css)
						.pipe(concat(pages[p] + '.css'))
						.pipe(sass().on('error', sass.logError))
						.pipe(gulpif(argv.production, minifyCss()))
						.pipe(gulp.dest('./public/css/pages'))
				);
			}

			if(pageDependencies.js.length) {
				jsTasks.push(
					gulp.src(pageDependencies.js)
						.pipe(concat(pages[p] + '.js'))
						.pipe(gulpif(argv.production, uglify()))
						.pipe(gulp.dest('./public/js/pages'))
				);
			}			
		}
	}

	return merge(cssTasks, jsTasks);
});

/**
 * Webpack task
 */

gulp.task('Build Webpack', (cb) => {
	return gulp.src('app/views/app.js')
		.pipe(webpackStream({
			entry: views,
			watch: true,
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
		    },
		    plugins: argv.production ? [
		    	new webpack.optimize.UglifyJsPlugin({minimize: true})
			] : [
			]
		}))
		.pipe(gulp.dest('./public/js/pages'))
});


/**
 * Watch on hanlders on sass files
 */

gulp.task('watch', () => {
	gulp.watch('./public/js/components/**/*.js', ['Build Assets']);
	gulp.watch('./public/js/handlers/**/*.js', ['Build Assets']);
	gulp.watch('./app/sass/**/**/*.scss', ['Build Assets']);
});

/**
 * Sequence build, synchronous
 */

gulp.task('Master Build', function(callback) {
  runSequence(['Build Assets', 'Build Webpack'],
              callback);
});

/**
 * Watch on Master Build
 */

gulp.task('default', ['watch', 'Master Build'])