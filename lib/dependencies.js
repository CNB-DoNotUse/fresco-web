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
		css: [],
		js: [
			'./public/vendor/jquery/dist/jquery.min.js',
			'./public/vendor/snackbarjs/dist/snackbar.min.js'
		]
	},

	public: {
		_global: {
			css: [],
			js: []
		},

		index: {
			css: [
				'./public/vendor/slick-carousel/slick/slick.css',
				'./public/vendor/slick-carousel/slick/slick-theme.css',
				'./public/vendor/Waves/dist/waves.min.css',
				'./app/sass/index/index.scss'
			],
			js: [
				'./public/vendor/velocity/velocity.min.js',
				'./public/vendor/slick-carousel/slick/slick.min.js',
				'./public/vendor/Waves/dist/waves.min.js',
				'./public/vendor/moment/moment.js',
				'./public/js/components/index-slick.js',
				'./public/js/components/index-animation.js',
				'./public/js/handlers/index.js',
				'./public/js/handlers/nav.js'
			]
		},

		pro: {
			css: [
				'./public/vendor/Waves/dist/waves.min.css',
				'./app/sass/index/pro/pro.scss'
			],
			js: [
				'./public/vendor/velocity/velocity.min.js',
				'./public/vendor/Waves/dist/waves.min.js',
				'./public/js/components/index-animation.js',
				'./public/js/handlers/nav.js',
				'./public/js/handlers/pro.js'
			]
		},

		publicGallery: {
			css: [
				'./public/vendor/slick-carousel/slick/slick.css',
				'./public/vendor/slick-carousel/slick/slick-theme.css',
				'./app/sass/publicGallery/publicGallery.scss'
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
				'./app/sass/error/error.scss'
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
				'./app/sass/platform/screen.scss'
			],
			js: [
				'./public/vendor/bootstrap-material-design/dist/js/material.min.js',
				'./public/vendor/bootstrap-material-design/dist/js/ripples.min.js',
				'./public/vendor/jquery.transit/jquery.transit.js',
				'./public/vendor/jquery_lazyload/jquery.lazyload.js',
				'./public/vendor/typeahead.js/dist/typeahead.jquery.min.js',
				'./public/vendor/bootstrap/dist/js/bootstrap.min.js',
				'./public/vendor/alertify.js/dist/js/alertify.js',
				'./public/js/frick.js',
			]
		},

		admin: {
			css: [
				'./app/sass/platform/_admin.scss'
			],
			js: []
		},

		outletSettings: {
			css: [
				'./app/sass/platform/_outletSettings.scss'
			],
			js: []
		},

		userSettings: {
			css: [
				'./app/sass/platform/_userSettings.scss'
			],
			js: []
		}

	}
	
}