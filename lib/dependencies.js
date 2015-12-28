/**
 * Site dependency management
 *
 *	`global` dependencies, anything in here will be on every page of the site
 *
 * 	`_global` prefixd keys will be put into the global js/css files
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
			'./public/vendor/snackbarjs/dist/snackbar.min.js',
			'./public/vendor/bootstrap-material-design/dist/js/material.min.js'
		]
	},

	public: {
		_global: {
			css: [
				'./public/vendor/mdi/css/materialdesignicons.css',
			],
			js: []
		},

		index: {
			css: [
				'./public/vendor/bootstrap-material-design/dist/css/material.css',
				'./public/css/landing.css',
				'./public/css/tools.css',
				'./public/vendor/slick-carousel/slick/slick.css'
			],
			js: [
				'./public/vendor/jquery_lazyload/jquery.lazyload.js',
				'./public/vendor/jquery.transit/jquery.transit.js',
				'./public/vendor/slick-carousel/slick/slick.min.js',
				'./public/js/handlers/index.js',
				'./public/js/fresco.js'
			]
		},

		publicGallery: {
			css: [
				'./public/vendor/slick-carousel/slick/slick.css',
				'./public/vendor/slick-carousel/slick/slick-theme.css',
				'./app/sass/publicGallery.scss'
			],
			js: []
		},

		promo: {
			css: [
				'./public/vendor/bootstrap-material-design/dist/css/material.css',
				'./public/css/landing.css',
				'./public/css/tools.css',
				'./public/css/promo.css'
			],
			js: []
		},

		error: {
			css: [
				'./app/sass/error.scss'
			],
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
				'./public/css/components/frick.css',
				'./public/vendor/mdi/css/materialdesignicons.css',
				'./app/sass/platform/screen.scss'
			],
			js: [
				'./public/vendor/bootstrap-material-design/dist/js/ripples.min.js',
				'./public/vendor/jquery.transit/jquery.transit.js',
				'./public/vendor/jquery_lazyload/jquery.lazyload.js',
				'./public/vendor/typeahead.js/dist/typeahead.jquery.min.js',
				'./public/vendor/bootstrap/dist/js/bootstrap.min.js',
				'./public/vendor/alertify.js/dist/js/alertify.js',
				'./public/js/frick.js',
			]
		},

		highlights: {
			css:[
				'./app/sass/pages/highlights.scss'
			],
			js: []

		},

		outletSettings: {
			css: [
				'./app/sass/platform/_outletSettings.scss'
			],
			js: []
		}

	}
	
}