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
		}
		index: {
			css: [],
			js: []
		}
	},

	platform: {
		_global: {
			css: [],
			js: []
		}
		admin: {
			css: [],
			js: []
		}
	}
	
}