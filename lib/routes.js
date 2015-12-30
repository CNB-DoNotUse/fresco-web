/**
 * Site route management
 *
 * `global` routes, anything in here will be on every page of the site
 *
 *  `public` routes, anything in here will be on every public facing page
 *  
 *  Any other key defines a separate part of the site i.e. `platform` is any page inside the platform
 */

module.exports = {

	public: [
		'index',
		'external'
	],

	modals: [
		'account',
		'contact',
		'forgot',
		'hsa',
		'legal',
		'press',
		'reset',
		'team'
	],

	platform: [
		'highlights',
		'archive',
		'dispatch',
		'assignment',
		'outlet',
		'story',
		'user',
		'gallery',
		'post',
		'purchases',
		'search',
		'admin'
	]

}