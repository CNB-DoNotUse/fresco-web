/**
 * Site route management
 *
 *  `public` routes, anything in here will be on every public facing page
 *
 *  Any other key defines a separate part of the site i.e. `platform` is any page inside the platform
 *
 */

module.exports = {

	public: [
		'index',
		'gallery'
	],

	modals: [
		'account',
		'contact',
		'press',
		'forgot',
		'team',
		'faq'
	],

	scripts: [
		'gallery',
		'outlet',
		'user',
		'contact'
	],

	platform: [
		'highlights',
		'archive',
		'dispatch',
		'assignment',
		'outlet',
		'story',
		'user',
		'post',
		'purchases',
		'search',
		'admin'
	]

}
