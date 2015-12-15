/**
 * Site dependency management
 *
 *	`global` dependencies, anything in here will be on every page of the site
 *
 * 	`_global` prefixd keys will be put into the global js/css files
 *
 *	`public` dependencies, anything in here will be on every public facing page
 * 	
 *  Any other key defines a separate part of the site i.e. `platform` is any page inside the platform
 */

module.exports = {

	global: {
		css: [
			'./public/vendor/snackbarjs/dist/snackbar.min.css',
		],
		js: [
			'./public/vendor/jquery/dist/jquery.min.js',
			'./public/vendor/bootstrap-material-design/dist/js/material.min.js'
		]
	},

	public: {
		_global: {
			css: [
				'./public/vendor/mdi/css/materialdesignicons.css',
				'./public/stylesheets/landing.css',
				'./public/stylesheets/tools.css'
			],
			js: []
		},

		index: {
			css: [
				'./public/vendor/slick-carousel/slick/slick.css'
			],
			js: [
				'./public/vendor/jquery_lazyload/jquery.lazyload.js',
				'./public/vendor/jquery.transit/jquery.transit.js',
				'./public/vendor/slick-carousel/slick/slick.min.js',
				'./public/javascripts/handlers/index.js',
				'./public/javascripts/fresco.js'
			]
		},

		promo: {
			css: [
				'./public/stylesheets/promo.css'
			],
			js: []
		},

		error: {
			css: [],
			js: []
		}

	},

	platform: {
		_global: {
			css: [
				'./public/vendor/bootstrap/dist/css/bootstrap.min.css',
				'./public/vendor/bootstrap-material-design/dist/css/material.css',
				'./public/vendor/bootstrap-material-design/dist/css/ripples.min.css',
				'./public/vendor/slick-carousel/slick/slick.css',
				'./public/vendor/slick-carousel/slick/slick-theme.css',
				'./public/vendor/alertify.js/dist/css/alertify.css',
				'./public/stylesheets/components/frick.css',
				'./public/vendor/mdi/css/materialdesignicons.css',
				'./app/sass/screen.scss'
			],
			js: [
				'./public/vendor/bootstrap-material-design/dist/js/ripples.min.js',
				'./public/vendor/jquery.transit/jquery.transit.js',
				'./public/vendor/jquery_lazyload/jquery.lazyload.js',
				'./public/vendor/typeahead.js/dist/typeahead.jquery.min.js',
				'./public/vendor/bootstrap/dist/js/bootstrap.min.js',
				'./public/javascripts/frick.js',
				'./public/javascripts/fresco.js'
			]
		},

		highlights:{
			css:[],
			js: []

		}

	}
	
}