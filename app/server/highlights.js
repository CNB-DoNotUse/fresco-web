module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var isNode = __webpack_require__(1),
	    React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    App = __webpack_require__(8),
	    GalleryList = __webpack_require__(4),
	    TopBar = __webpack_require__(7);

	/**
	 * Highlights Parent Object (composed of GalleryList and Navbar) 
	 * Half = False, to render at large size instead of half size
	 */

	var Highlights = React.createClass({

		displayName: 'Highlights',

		render: function () {
			return React.createElement(
				App,
				{ user: this.props.user },
				React.createElement(TopBar, { title: 'Highlights' }),
				React.createElement(GalleryList, {
					withList: true,
					highlighted: true })
			);
		}

	});

	if (isNode) module.exports = Highlights;else ReactDOM.render(React.createElement(Highlights, { user: window.__initialProps__.user }), document.getElementById('app'));

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("detect-node");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("react");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("react-dom");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3), SuggestionList = __webpack_require__(5), GalleryCell = __webpack_require__(6);

	/** //

	Description : List for a gallery used across the site (/highlights, /content/galleries, etc.)

	// **/

	/**
	 * Gallery List Parent Object 
	 */

	var GalleryList = React.createClass({

		displayName: 'GalleryList',

		getInitialState: function () {
			return {
				galleries: [],
				offset: 0,
				loading: false,
				tags: []
			};
		},
		componentDidMount: function () {

			var self = this;

			this.loadGalleries(0, function (galleries) {

				var offset = galleries ? galleries.length : 0;

				//Set galleries from successful response
				self.setState({
					galleries: galleries,
					offset: offset
				});
			});
		},
		//Returns array of galleries with offset and callback
		loadGalleries: function (passedOffset, callback) {

			var endpoint,
			    params = {
				limit: 14,
				offset: passedOffset
			};

			if (this.props.highlighted) {

				endpoint = '/v1/gallery/highlights';

				params.invalidate = 1;
			} else {

				endpoint = '/v1/gallery/list';
				params.verified = true;
				params.tags = this.state.tags.join(',');
			}

			$.ajax({
				url: API_URL + endpoint,
				type: 'GET',
				data: params,
				dataType: 'json',
				success: function (response, status, xhr) {

					//Do nothing, because of bad response
					if (!response.data || response.err) callback([]);else callback(response.data);
				},
				error: function (xhr, status, error) {
					$.snackbar({ content: resolveError(error) });
				}

			});
		},
		//Scroll listener for main window
		scroll: function () {

			var grid = this.refs.grid;

			if (!this.state.loading && grid.scrollTop === grid.scrollHeight - grid.offsetHeight) {

				var self = this;

				self.setState({ loading: true });

				this.loadGalleries(this.state.offset, function (galleries) {

					if (!galleries) return;

					var offset = self.state.galleries.length + galleries.length;

					//Set galleries from successful response
					self.setState({
						galleries: self.state.galleries.concat(galleries),
						offset: offset,
						loading: false
					});
				});
			}
		},
		render: function () {

			var half = !this.props.withList;

			//Save all the galleries
			var galleries = React.createElement(
				'div',
				{ className: 'row tiles' },
				this.state.galleries.map(function (gallery, i) {
					return React.createElement(GalleryCell, { gallery: gallery, half: half, key: i });
				})
			);

			//Check if a list is needed
			if (this.props.withList) {

				return React.createElement(
					'div',
					{ className: 'container-fluid grid', onScroll: this.scroll, ref: 'grid' },
					React.createElement(
						'div',
						{ className: 'col-md-8' },
						galleries
					),
					React.createElement(SuggestionList, null)
				);
			}
			//No list needed
			else {

					return React.createElement(
						'div',
						{ className: 'container-fluid grid', onScroll: this.scroll, ref: 'grid' },
						galleries
					);
				}
		}
	});

	module.exports = GalleryList;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(3);

	/** //

	Description : Suggestion Column

	// **/

	/**
	 * Suggestion List Parent Object
	 */

	var SuggestionList = React.createClass({

		displayName: 'SuggestionList',

		getInitialState: function () {
			return {
				stories: []
			};
		},

		componentDidMount: function () {

			self = this;

			$.ajax({
				url: API_URL + "/v1/story/recent",
				type: 'GET',
				data: {
					limit: 3
				},
				dataType: 'json',
				success: function (response, status, xhr) {

					//Do nothing, because of bad response
					if (!response.data || response.err) return;

					//Set galleries from successful response
					self.setState({
						stories: response.data
					});
				},
				error: function (xhr, status, error) {
					$.snackbar({ content: resolveError(error) });
				}
			});
		},

		render: function () {

			return React.createElement(
				'div',
				{ className: 'col-md-4' },
				React.createElement(
					'h3',
					{ className: 'md-type-button md-type-black-secondary' },
					'Trending Stories'
				),
				React.createElement(
					'ul',
					{ className: 'md-type-subhead trending-stories' },
					this.state.stories.map(function (story, i) {
						return React.createElement(
							'li',
							{ key: i },
							React.createElement(
								'a',
								{ href: '/story/' + story._id },
								story.title
							)
						);
					})
				)
			);
		}
	});

	module.exports = SuggestionList;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3);

	/**
	 * Single Gallery Cell, child of GalleryList
	 */

	var GalleryCell = React.createClass({

		displayName: 'GalleryCell',

		getDefaultProps: function () {
			return {
				//Size of the cell
				half: false
			};
		},

		render: function () {

			var timestamp = this.props.gallery.time_created;
			var timeString = getTimeAgo(Date.now(), this.props.gallery.time_created);
			var size = this.props.half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6';
			var location = 'No Location';

			for (var i = 0; i < this.props.gallery.posts.length; i++) {
				if (this.props.gallery.posts[i].location.address) {
					location = this.props.gallery.posts[i].location.address;
					break;
				}
			}

			return React.createElement(
				'div',
				{ className: size + " tile story" },
				React.createElement('div', { className: 'frame' }),
				React.createElement(
					'div',
					{ className: 'tile-body' },
					React.createElement(
						'div',
						{ className: 'hover' },
						React.createElement(
							'p',
							{ className: 'md-type-body1' },
							this.props.gallery.caption
						),
						React.createElement(GalleryCellStories, { stories: this.props.gallery.related_stories })
					),
					React.createElement(GalleryCellImages, { posts: this.props.gallery.posts })
				),
				React.createElement(
					'div',
					{ className: 'tile-foot' },
					React.createElement(
						'div',
						{ className: 'hover' },
						React.createElement(
							'a',
							{ href: "/gallery/" + this.props.gallery._id, className: 'md-type-body2' },
							'See all'
						)
					),
					React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'ellipses' },
							React.createElement(
								'span',
								{ className: 'md-type-body2' },
								location
							),
							React.createElement(
								'span',
								{ className: 'md-type-caption timestring', 'data-timestamp': this.props.gallery.time_created },
								timeString
							)
						)
					)
				)
			);
		}
	});

	// <span className="mdi mdi-library-plus icon pull-right"></span>
	// <span className="mdi mdi-download icon toggle-edit toggler pull-right" onClick={this.downloadGallery} ></span>

	/**
	 * Gallery Cell Stories List
	 */

	var GalleryCellStories = React.createClass({

		displayName: "GalleryCellStories",

		render: function () {

			var stories = this.props.stories.map(function (story, i) {
				return React.createElement(
					'li',
					{ key: i },
					React.createElement(
						'a',
						{ href: "/story/" + story._id },
						story.title
					)
				);
			});

			return React.createElement(
				'ul',
				{ className: 'md-type-body2 story-list' },
				stories
			);
		}

	});

	/**
	 * Gallery Cell Images
	 */

	var GalleryCellImages = React.createClass({

		displayName: "GalleryCellImages",

		render: function () {

			if (!this.props.posts || this.props.posts.length == 0) {

				return React.createElement('div', { className: 'flex-row' });
			} else if (this.props.posts.length == 1) {

				return React.createElement(
					'div',
					{ className: 'flex-row' },
					React.createElement(GalleryCellImage, { post: this.props.posts[0], size: 'small' })
				);
			} else if (this.props.posts.length < 5) {

				return React.createElement(
					'div',
					{ className: 'flex-row' },
					React.createElement(GalleryCellImage, { post: this.props.posts[0], size: 'small' }),
					React.createElement(GalleryCellImage, { post: this.props.posts[1], size: 'small' })
				);
			} else if (this.props.posts.length >= 5 && this.props.posts.length < 8) {

				return React.createElement(
					'div',
					{ className: 'flex-row' },
					React.createElement(
						'div',
						{ className: 'flex-col' },
						React.createElement(GalleryCellImage, { post: this.props.posts[0], size: 'small' })
					),
					React.createElement(
						'div',
						{ className: 'flex-col' },
						React.createElement(
							'div',
							{ className: 'flex-row' },
							React.createElement(GalleryCellImage, { post: this.props.posts[1], size: 'small' }),
							React.createElement(GalleryCellImage, { post: this.props.posts[2], size: 'small' })
						),
						React.createElement(
							'div',
							{ className: 'flex-row' },
							React.createElement(GalleryCellImage, { post: this.props.posts[3], size: 'small' }),
							React.createElement(GalleryCellImage, { post: this.props.posts[4], size: 'small' })
						)
					)
				);
			} else if (this.props.posts.length >= 8) {

				return React.createElement(
					'div',
					{ className: 'flex-col' },
					React.createElement(
						'div',
						{ className: 'flex-row' },
						React.createElement(GalleryCellImage, { post: this.props.posts[0], size: 'small' }),
						React.createElement(GalleryCellImage, { post: this.props.posts[1], size: 'small' }),
						React.createElement(GalleryCellImage, { post: this.props.posts[4], size: 'small' }),
						React.createElement(GalleryCellImage, { post: this.props.posts[3], size: 'small' })
					),
					React.createElement(
						'div',
						{ className: 'flex-row' },
						React.createElement(GalleryCellImage, { post: this.props.posts[4], size: 'small' }),
						React.createElement(GalleryCellImage, { post: this.props.posts[5], size: 'small' }),
						React.createElement(GalleryCellImage, { post: this.props.posts[6], size: 'small' }),
						React.createElement(GalleryCellImage, { post: this.props.posts[7], size: 'small' })
					)
				);
			}
		}

	});

	/**
	 * Single Gallery Cell Image Item
	 */

	var GalleryCellImage = React.createClass({

		displayName: 'GalleryCellImage',

		render: function () {
			return React.createElement(
				'div',
				{ className: 'img' },
				React.createElement('img', { className: 'img-cover',
					'data-src': formatImg(this.props.post.image, this.props.size),
					src: formatImg(this.props.post.image, this.props.size) })
			);
		}
	});

	module.exports = GalleryCell;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(3);

	/** //

	Description : Top for pages of the site

	// **/

	var TopBar = React.createClass({

		displayName: 'TopBar',

		getDefaultProps: function () {
			return {
				title: ''
			};
		},

		render: function () {

			var edit = '';

			return React.createElement(
				'nav',
				{ className: 'navbar navbar-fixed-top navbar-default' },
				React.createElement('div', { className: 'dim transparent toggle-drop toggler' }),
				React.createElement(
					'button',
					{ type: 'button', className: 'icon-button toggle-drawer toggler hidden-lg' },
					React.createElement('span', { className: 'mdi mdi-menu icon' })
				),
				React.createElement('div', { className: 'spacer' }),
				React.createElement(
					'h1',
					{ className: 'md-type-title' },
					this.props.title
				),
				this.props.editable ? React.createElement('a', { className: 'mdi mdi-pencil icon pull-right hidden-xs toggle-gedit toggler', onClick: this.toggleEdit }) : '',
				this.props.chronToggle ? React.createElement(ChronToggle, null) : '',
				this.props.timeToggle ? React.createElement(TimeToggle, null) : '',
				this.props.verifiedToggle ? React.createElement(VerifiedToggle, null) : ''
			);
		},
		toggleEdit: function () {

			$(".toggle-gedit").toggleClass("toggled");
		}

	});

	var TimeToggle = React.createClass({

		displayName: 'TimeToggle',

		render: function () {

			return React.createElement(
				'li',
				{ className: 'drop pull-right hidden-xs' },
				React.createElement(
					'button',
					{ className: 'toggle-drop md-type-subhead time-display-filter-button', ref: 'time_toggle_button' },
					React.createElement(
						'span',
						{ className: 'time-display-filter-text', ref: 'currentTimeFilter' },
						'Relative'
					),
					React.createElement('span', { className: 'mdi mdi-menu-down icon' })
				),
				React.createElement(
					'div',
					{ className: 'drop-menu panel panel-default' },
					React.createElement(
						'div',
						{ className: 'toggle-drop toggler md-type-subhead' },
						React.createElement(
							'span',
							{ className: 'time-display-filter-text', ref: 'currentTimeFilter' },
							'Relative'
						),
						React.createElement('span', { className: 'mdi mdi-menu-up icon pull-right' })
					),
					React.createElement(
						'div',
						{ className: 'drop-body' },
						React.createElement(
							'ul',
							{ className: 'md-type-subhead' },
							React.createElement(
								'li',
								{ className: 'time-display-filter-type active', 'data-filter-type': 'relative', onClick: this.clicked },
								'Relative'
							),
							React.createElement(
								'li',
								{ className: 'time-display-filter-type', 'data-filter-type': 'absolute', onClick: this.clicked },
								'Absolute'
							)
						)
					)
				)
			);
		},
		clicked: function () {

			var currentTimeFilter = this.refs.currentTimeFilter;

			console.log(currentTimeFilter);

			var displayMode = '';

			if (currentTimeFilter.innerHTML == 'Relative') {
				displayMode = 'absolute';
				currentTimeFilter.innerHTML = 'Absolute';
			} else {
				displayMode = 'relative';
				currentTimeFilter.innerHTML = 'Relative';
			}

			setTimeDisplayType(displayMode);

			this.refs.time_toggle_button.click();

			$('.time-display-filter-type').removeClass('active');

			$(currentTimeFilter).addClass('active');
		}

	});

	var VerifiedToggle = React.createClass({

		displayName: 'VerifiedToggle',

		render: function () {

			return(

				//Check if content manger or creater (config.RANKS.CONTENT_MANAGER)
				React.createElement(
					'li',
					{ className: 'drop pull-right hidden-xs' },
					React.createElement(
						'button',
						{ className: 'toggle-drop md-type-subhead filter-button' },
						React.createElement(
							'span',
							{ className: 'filter-text' },
							'Verified content'
						),
						React.createElement('span', { className: 'mdi mdi-menu-down icon' })
					),
					React.createElement(
						'div',
						{ className: 'drop-menu panel panel-default' },
						React.createElement(
							'div',
							{ className: 'toggle-drop toggler md-type-subhead' },
							React.createElement(
								'span',
								{ className: 'filter-text' },
								'Verified content'
							),
							React.createElement('span', { className: 'mdi mdi-menu-up icon pull-right' })
						),
						React.createElement(
							'div',
							{ className: 'drop-body' },
							React.createElement(
								'ul',
								{ className: 'md-type-subhead' },
								React.createElement(
									'li',
									{ className: 'filter-type' },
									'All content'
								),
								React.createElement(
									'li',
									{ className: 'filter-type active' },
									'Verified content'
								)
							)
						)
					)
				)
			);
		},
		clicked: function () {}

	});

	var ChronToggle = React.createClass({

		displayName: 'ChronToggle',

		render: function () {

			return(

				//Check if content manger or creater (config.RANKS.CONTENT_MANAGER)
				React.createElement(
					'li',
					{ className: 'drop pull-right hidden-xs' },
					React.createElement(
						'button',
						{ className: 'toggle-drop md-type-subhead filter-button' },
						React.createElement(
							'span',
							{ className: 'filter-text' },
							'By capture time'
						),
						React.createElement('span', { className: 'mdi mdi-menu-down icon' })
					),
					React.createElement(
						'div',
						{ className: 'drop-menu panel panel-default' },
						React.createElement(
							'div',
							{ className: 'toggle-drop toggler md-type-subhead' },
							React.createElement(
								'span',
								{ className: 'filter-text' },
								'By capture time'
							),
							React.createElement('span', { className: 'mdi mdi-menu-up icon pull-right' })
						),
						React.createElement(
							'div',
							{ className: 'drop-body' },
							React.createElement(
								'ul',
								{ className: 'md-type-subhead' },
								React.createElement(
									'li',
									{ className: 'filter-type' },
									'By capture time'
								),
								React.createElement(
									'li',
									{ className: 'filter-type active' },
									'By upload time'
								)
							)
						)
					)
				)
			);
		},
		clicked: function () {}

	});

	module.exports = TopBar;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var isNode = __webpack_require__(1),
	    React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    Sidebar = __webpack_require__(9);

	/**
	 * Gallery Detail Parent Object
	 */

	var App = React.createClass({

		displayName: 'App',

		render: function () {

			return React.createElement(
				'div',
				null,
				React.createElement('div', { className: 'dim toggle-drawer toggler' }),
				React.createElement(
					'div',
					{ className: 'container-fluid' },
					React.createElement(Sidebar, { user: this.props.user }),
					React.createElement(
						'div',
						{ className: 'col-md-12 col-lg-10' },
						this.props.children
					)
				)
			);
		}

	});

	module.exports = App;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    config = __webpack_require__(10);

	/**
	 * Side bar object
	 */

	var Sidebar = React.createClass({

		displayName: 'Sidebar',

		render: function () {

			var avatar = this.props.user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png';

			return React.createElement(
				'div',
				{ className: 'col-lg-2 sidebar toggle-drawer' },
				React.createElement(
					'div',
					null,
					React.createElement(
						'a',
						{ href: '/highlights' },
						React.createElement('img', { src: 'https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-news.png' })
					),
					React.createElement(
						'div',
						{ className: 'form-group-default' },
						React.createElement('input', { className: 'form-control', id: 'sidebar-search', placeholder: 'Search', type: 'text' })
					),
					React.createElement(SideBarListItems, { user: this.props.user })
				),
				React.createElement(
					'div',
					null,
					React.createElement('img', { className: 'img-circle', id: 'side-bar-avatar', src: avatar }),
					React.createElement(
						'a',
						{ className: 'md-type-title user-name-view', href: '/user' },
						this.props.user.firstname + ' ' + this.props.user.lastname
					),
					React.createElement(
						'ul',
						null,
						React.createElement(
							'li',
							null,
							React.createElement(
								'a',
								{ href: '/user/settings' },
								'Settings'
							)
						),
						React.createElement(
							'li',
							null,
							React.createElement(
								'a',
								{ href: '/scripts/user/logout' },
								'Log out'
							)
						)
					)
				)
			);
		}

	});

	var SideBarListItems = React.createClass({

		render: function () {

			if (!this.props.user) return;

			if (this.props.user.outlet || this.props.user.rank >= config.RANKS.CONTENT_MANAGER) {
				var dispatch = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': 'dispatch', id: 'sidebar-dispatch' },
					React.createElement('span', { className: 'mdi mdi-map icon' }),
					'Dispatch'
				);
			}

			if (this.props.user.outlet != null) {
				var outlet = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-outlet' },
					React.createElement('span', { className: 'mdi mdi-account-multiple icon' }),
					this.props.user.outlet.title
				);
			}
			if (this.props.user.rank >= 2) {
				var admin = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-admin' },
					React.createElement('span', { className: 'mdi mdi-dots-horizontal icon' }),
					'Admin'
				);
				var purchases = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-purchases' },
					React.createElement('span', { className: 'mdi mdi-currency-usd icon' }),
					'Purchases'
				);
			}
			return React.createElement(
				'ul',
				{ className: 'md-type-body1' },
				React.createElement(
					'li',
					{ className: 'sidebar-tabb', onClick: this.itemClicked, id: 'sidebar-highlights' },
					React.createElement('span', { className: 'mdi mdi-star icon' }),
					'Highlights'
				),
				React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-content' },
					React.createElement('span', { className: 'mdi mdi-play-box-outline icon' }),
					'All content'
				),
				React.createElement(
					'ul',
					null,
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-photos' },
						React.createElement('span', { className: 'mdi mdi-file-image-box icon' }),
						'Photos'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-videos' },
						React.createElement('span', { className: 'mdi mdi-movie icon' }),
						'Videos'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-galleries' },
						React.createElement('span', { className: 'mdi mdi-image-filter icon' }),
						'Galleries'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, id: 'sidebar-stories' },
						React.createElement('span', { className: 'mdi mdi-newspaper icon' }),
						'Stories'
					)
				),
				dispatch,
				outlet,
				admin,
				purchases
			);
		},
		itemClicked: function (event) {

			console.log(event);

			// var link = event.currentTarget.data.link;

			// if(link && typeof window !== 'undefined')
			// 	window.location.assign(link);
		}

	});

	module.exports = Sidebar;

/***/ },
/* 10 */
/***/ function(module, exports) {

	var config = {
	  STATIC_CDN: 'https://d1dw1p6sgigznj.cloudfront.net/',
	  SESSION_SECRET: 'Flerbelerbler heller falala laller',
	  SESSION_REDIS: {
	    ENDPOINT: 'fresco-sessions.cls0l1.ng.0001.use1.cache.amazonaws.com',
	    PORT: 6379
	  },

	  // API_URL: 'https://api.fresconews.com',
	  // WEB_ROOT : 'https://fresconews.com',
	  // STRIPE_SECRET: 'sk_live_QKR23bLkkyHQPF75o6EE36Rp',
	  // STRIPE_PUBLISHABLE: 'pk_live_saSjliYnCbjFwYfriTzhTQiO',
	  // PARSE_APP_ID: 'XYBXNv2HLxukd5JGbE6bK4vXy1JlwUVjeTKQEzZU',
	  // PARSE_API_KEY: 'tpZzCZJCTCk5IJNmNsEMSgxT3nqT4TCjOsZltI0C',
	  // PRICE_VIDEO: 7500,
	  // PRICE_IMAGE: 3000,

	  API_URL: 'http://staging.fresconews.com',
	  WEB_ROOT: 'http://alpha.fresconews.com',
	  STRIPE_SECRET: 'sk_test_3gia4iCZFnNXl0tQyGwEggVM ',
	  STRIPE_PUBLISHABLE: 'pk_test_o4pMXyj95Vqe5NgV3hb7qmdo',
	  PARSE_APP_ID: 'ttJBFHzdOoPrnwp8IjrZ8cD9d1kog01jiSDAK8Fc',
	  PARSE_API_KEY: '7zNIxJKt1sNjO1VFj4bYh0sVi3pAfURSZcldf2IN',
	  PRICE_VIDEO: 7500,
	  PRICE_IMAGE: 3000,

	  TWITTER: {
	    CONSUMER_KEY: '94rpzX0nPHcRVncdP5tBRHUIp',
	    CONSUMER_SECRET: 'ke11m42OxmHI1YGu9it9nKPuGNtDMsVUizCd1ZQtTi5g7IOeF6',
	    ACCESS_TOKEN_KEY: '2871169317-Mbv4U5wtRnWt9iCxkhehEEaRNaKqHGowyGBXeMx',
	    ACCESS_TOKEN_SECRET: 'DB0OMAsgIeb4PdDafzk5ALedC3MsRPngU9v1FfjkXXLd0'
	  },

	  //VISIBILITY CONSTANTS
	  VISIBILITY: {
	    PENDING: 0,
	    VERIFIED: 1,
	    HIGHLIGHT: 2
	  },

	  SESSION_REFRESH_MS: 5,

	  ERR_PAGE_MESSAGES: {
	    403: "Unauthorized",
	    404: "We've lost it!",
	    500: "Internal server error"
	  },

	  //Parse
	  PARSE_API: 'https://api.parse.com/',

	  //Ranks
	  RANKS: {
	    INACTIVE: -1,
	    BASIC: 0,
	    CONTENT_MANAGER: 1,
	    ADMIN: 2
	  },

	  DASH_HOME: '/highlights',

	  formatImg: function (img, size) {
	    if (!size || size == 'original') return img;
	    if (img.indexOf('d2j1l98c0ybckw.cloudfront.net') == -1) return img;

	    return img.replace('images/', 'images/' + size + '/');
	  },

	  resolveError: function (err, _default) {
	    switch (err) {
	      case 'ERR_OUTLET_UNVERIFIED':
	        return 'This outlet is in demo mode. Purchases and downloads are currently disabled.';
	      case 'ERR_USER_UNVERIFIED':
	        return 'You must verify your email in order to perform this action.';
	      case 'ERR_INCOMPLETE':
	        return 'There was an error while completing your purchase.';
	      case 'ERR_MISSING_PAYMENT_INFO':
	        return 'Payment info not found.';
	      default:
	        return _default || err.toString().capitalize();
	    }
	  },

	  getTimeAgo: function (timestamp) {
	    var intervals = {
	      year: 31556926,
	      month: 2629744,
	      week: 604800,
	      day: 86400,
	      hour: 3600,
	      minute: 60
	    };

	    var diff = Date.now() - timestamp;
	    diff = Math.floor(diff / 1000);

	    //now we just find the difference
	    if (diff <= 0) return 'Just now';
	    if (diff < 60) return diff == 1 ? diff + ' second ago' : diff + ' seconds ago';
	    if (diff >= 60 && diff < intervals.hour) {
	      diff = Math.floor(diff / intervals.minute);
	      return diff == 1 ? diff + ' minute ago' : diff + ' minutes ago';
	    }
	    if (diff >= intervals.hour && diff < intervals.day) {
	      diff = Math.floor(diff / intervals.hour);
	      return diff == 1 ? diff + ' hour ago' : diff + ' hours ago';
	    }
	    if (diff >= intervals.day && diff < intervals.week) {
	      diff = Math.floor(diff / intervals.day);
	      return diff == 1 ? diff + ' day ago' : diff + ' days ago';
	    }
	    if (diff >= intervals.week && diff < intervals.month) {
	      diff = Math.floor(diff / intervals.week);
	      return diff == 1 ? diff + ' week ago' : diff + ' weeks ago';
	    }
	    if (diff >= intervals.month && diff < intervals.year) {
	      diff = Math.floor(diff / intervals.month);
	      return diff == 1 ? diff + ' month ago' : diff + ' months ago';
	    }
	    if (diff >= intervals.year) {
	      diff = Math.floor(diff / intervals.year);
	      return diff == 1 ? diff + ' year ago' : diff + ' years ago';
	    }
	  }
	};

	module.exports = config;

/***/ }
/******/ ]);