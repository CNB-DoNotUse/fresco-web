/**
 * Site dependency management
 *
 * `global` dependencies, anything in here will be on every page of the site
 *
 * 	`public` dependencies, anything in here will be on every public facing page
 * 	
 * 	Any other key defines a separate part of the site i.e. `platform` is any page inside the platform
 */

module.exports = {

	global: {
		css: [],
		js: []
	},

	public: {
		_global: {
			css: [],
			js: []
		},

		index: {
			css: [
				'./public/vendor/bootstrap-material-design/dist/css/material.min.css',
				'./public/vendor/mdi/css/materialdesignicons.min.css',
				'./public/vendor/slick-carousel/slick/slick.css',
				'./public/vendor/snackbarjs/dist/snackbar.min.css',
				'./public/stylesheets/landing.css',
				'./public/stylesheets/tools.css'
			],
			js: []
		}
	},

	platform: {
		_global: {
			css: ['./app/sass/screen.scss'],
			js: []
		},

		admin: {
			css: [],
			js: []
		}
	}
	
}