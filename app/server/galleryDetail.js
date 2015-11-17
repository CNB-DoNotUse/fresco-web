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
	    TopBar = __webpack_require__(7),
	    PostList = __webpack_require__(11),
	    GallerySidebar = __webpack_require__(13),
	    GalleryEdit = __webpack_require__(14),
	    App = __webpack_require__(8);

	/**
	 * Gallery Detail Parent Object, made of a side column and PostList
	 */

	var GalleryDetail = React.createClass({

		displayName: 'GalleryDetail',

		getDefaultProps: function () {
			return {
				gallery: {}
			};
		},

		render: function () {

			return React.createElement(
				App,
				{ user: this.props.user },
				React.createElement(TopBar, {
					title: this.props.title,
					editable: true,
					verifiedToggle: false,
					timeToggle: true,
					chronToggle: true }),
				React.createElement(GallerySidebar, { gallery: this.props.gallery }),
				React.createElement(
					'div',
					{ className: 'col-sm-8 tall' },
					React.createElement(PostList, {
						rank: this.props.user.rank,
						purchases: this.props.purchases,
						posts: this.props.gallery.posts,
						scrollable: false,
						editable: false,
						size: 'small' })
				),
				React.createElement(GalleryEdit, {
					gallery: this.props.gallery,
					user: this.props.user })
			);
		}

	});

	if (isNode) {

		module.exports = GalleryDetail;
	} else {

		ReactDOM.render(React.createElement(GalleryDetail, {
			user: window.__initialProps__.user,
			purchases: window.__initialProps__.purchases,
			gallery: window.__initialProps__.gallery,
			title: window.__initialProps__.title }), document.getElementById('app'));
	}

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
/* 4 */,
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
/* 6 */,
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
					{ className: 'sidebar-tab', onClick: this.itemClicked('/dispatch'), id: 'sidebar-dispatch' },
					React.createElement('span', { className: 'mdi mdi-map icon' }),
					'Dispatch'
				);
			}

			if (this.props.user.outlet != null) {
				var outlet = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked('/outlet'), id: 'sidebar-outlet' },
					React.createElement('span', { className: 'mdi mdi-account-multiple icon' }),
					this.props.user.outlet.title
				);
			}
			if (this.props.user.rank >= 2) {
				var admin = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked('/admin'), id: 'sidebar-admin' },
					React.createElement('span', { className: 'mdi mdi-dots-horizontal icon' }),
					'Admin'
				);
				var purchases = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked('/purchases'), id: 'sidebar-purchases' },
					React.createElement('span', { className: 'mdi mdi-currency-usd icon' }),
					'Purchases'
				);
			}
			return React.createElement(
				'ul',
				{ className: 'md-type-body1' },
				React.createElement(
					'li',
					{ className: 'sidebar-tabb', onClick: this.itemClicked('/highlights'), id: 'sidebar-highlights' },
					React.createElement('span', { className: 'mdi mdi-star icon' }),
					'Highlights'
				),
				React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked('/content'), id: 'sidebar-content' },
					React.createElement('span', { className: 'mdi mdi-play-box-outline icon' }),
					'All content'
				),
				React.createElement(
					'ul',
					null,
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked('/content/photos'), id: 'sidebar-photos' },
						React.createElement('span', { className: 'mdi mdi-file-image-box icon' }),
						'Photos'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked('/content/videos'), id: 'sidebar-videos' },
						React.createElement('span', { className: 'mdi mdi-movie icon' }),
						'Videos'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked('/content/galleries'), id: 'sidebar-galleries' },
						React.createElement('span', { className: 'mdi mdi-image-filter icon' }),
						'Galleries'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked('/content/stories'), id: 'sidebar-stories' },
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
		itemClicked: function () {

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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3), SuggestionList = __webpack_require__(5);
	PostCell = __webpack_require__(12);

	/** //

	Description : List for a set of posts used across the site (/videos, /photos, /gallery/id, /assignment/id , etc.)

	// **/

	/**
	 * Post List Parent Object 
	 */

	var PostList = React.createClass({

		displayName: 'Post List',

		getInitialState: function () {
			return {
				offset: 0,
				posts: [],
				loading: false
			};
		},

		getDefaultProps: function () {
			return {
				size: 'small',
				editable: true
			};
		},

		componentDidMount: function () {

			//Check if list is initialzied with posts
			if (this.props.posts) return;

			var self = this;

			//Access parent var load method
			this.props.loadPosts(0, function (posts) {

				var offset = posts ? posts.length : 0;

				//Set posts from successful response
				self.setState({
					posts: posts,
					offset: offset
				});
			});
		},

		//Scroll listener for main window
		scroll: function () {

			var grid = this.refs.grid;

			//Check that nothing is loading and that we're at the end of the scroll,
			//and that we have a parent bind to load  more posts
			if (!this.state.loading && grid.scrollTop === grid.scrollHeight - grid.offsetHeight && this.props.loadPosts) {

				//Global store `this`
				var self = this;

				//Set that we're loading
				self.setState({ loading: true });

				//Run load on parent call
				this.props.loadPosts(this.state.offset, function (posts) {

					if (!posts) return;

					var offset = self.state.posts.length + posts.length;

					//Set galleries from successful response, and unset loading
					self.setState({
						posts: self.state.posts.concat(posts),
						offset: offset,
						loading: false
					});
				});
			}
		},
		render: function () {

			//Check if list was initialzied with posts
			if (this.props.posts != null) posts = this.props.posts;
			//Otherwise use the state posts
			else posts = this.state.posts;

			var purchases = this.props.purchases,
			    rank = this.props.rank;

			//Map all the posts into cells
			var posts = posts.map(function (post, i) {

				var purchased = purchases ? purchases.indexOf(post._id) != -1 : null;

				return React.createElement(PostCell, {
					size: 'large',
					post: post,
					rank: rank,
					purchaed: purchased,
					key: i,
					editable: this.props.editable });
			}, this);

			return React.createElement(
				'div',
				{ className: 'container-fluid fat grid', ref: 'grid', onScroll: this.props.scrollable ? this.scroll : null },
				React.createElement(
					'div',
					{ className: 'row tiles', id: 'posts' },
					posts
				)
			);
		}

	});

	module.exports = PostList;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3);

	/**
	 * Single Post Cell, child of PostList
	 */

	var PostCell = React.createClass({

		displayName: 'Post Cell',

		getDefaultProps: function () {
			return {
				sizes: {
					large: 'col-xs-12 col-sm-6 col-lg-4',
					small: 'col-xs-6 col-sm-4 col-md-3 col-lg-2'
				}
			};
		},

		render: function () {

			var timestamp = this.props.post.time_created;
			var timeString = getTimeAgo(Date.now(), this.props.post.time_created);
			var address = this.props.post.location.address || 'No Location';
			var size = this.props.sizes.large;

			//Class name for post tile icons
			var statusClass = 'mdi icon pull-right ';
			statusClass += this.props.post.video == null ? 'mdi-file-image-box ' : 'mdi-movie ';
			statusClass += this.props.post.purchased ? 'available ' : 'md-type-black-disabled ';

			if (this.props.size == 'small') size = this.props.sizes.small;

			return React.createElement(
				'div',
				{ className: size + ' tile' },
				React.createElement(
					'div',
					{ className: 'tile-body' },
					React.createElement('div', { className: 'frame' }),
					React.createElement(
						'div',
						{ className: 'hover' },
						React.createElement(
							'p',
							{ className: 'md-type-body1' },
							this.props.post.caption
						),
						React.createElement(
							'span',
							{ className: 'md-type-caption' },
							this.props.post.byline
						),
						React.createElement(PostCellStories, { stories: this.props.post.stories })
					),
					React.createElement(
						'div',
						{ className: 'img' },
						React.createElement('img', { className: 'img-cover', src: formatImg(this.props.post.image, 'small') })
					)
				),
				React.createElement(
					'div',
					{ className: 'tile-foot' },
					React.createElement(PostCellActions, {
						post: this.props.post,
						purchased: this.props.purchased,
						rank: this.props.rank,
						editable: this.props.editable }),
					React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'tile-info' },
							React.createElement(
								'span',
								{ className: 'md-type-body2' },
								address
							),
							React.createElement(
								'span',
								{ className: 'md-type-caption timestring', 'data-timestamp': this.props.post.time_created },
								timeString
							)
						),
						React.createElement('span', { className: statusClass })
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

	var PostCellStories = React.createClass({

		displayName: 'Post Cell Stories',

		render: function () {

			var stores = '';

			if (this.props.stories) {

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
			}

			return React.createElement(
				'ul',
				{ className: 'md-type-body2' },
				stories
			);
		}

	});

	/**
	 * Post Cell Actions 
	 * Description : Set of icons on the the post cell's hover
	 */

	var PostCellActions = React.createClass({

		displayName: 'Post Cell Actions',

		render: function () {

			var actions = [],
			    key = 0;
			//Check if the purchased property is set on the post
			if (this.props.post.purchased !== null) {

				//Check if we're CM or Admin
				if (typeof this.props.rank !== 'undefined' && this.props.rank >= 1) {

					if (this.props.post.purhcased === false) {

						if (this.props.editable) actions.push(React.createElement('span', { className: 'mdi mdi-pencil icon pull-right toggle-gedit toggler', onClick: this.edit, key: key++ }));

						actions.push(React.createElement('span', { className: 'mdi mdi-download icon pull-right', onClick: this.download, key: key++ }));
						actions.push(React.createElement('span', { className: 'mdi mdi-cash icon pull-right', 'data-id': this.props.post._id, onClick: this.purchase, key: key++ }));
					} else {

						if (this.props.editable) actions.push(React.createElement('span', { className: 'mdi mdi-pencil icon pull-right toggle-gedit toggler', onClick: this.edit, key: key++ }));

						actions.push(React.createElement('span', { className: 'mdi mdi-download icon pull-right', onClick: this.download, key: key++ }));
					}
				}
				//Check if the post has been purchased
				else if (this.props.post.purhcased === true) actions.push(React.createElement('span', { className: 'mdi mdi-download icon pull-right', onClick: this.download, key: key++ }));

					//Check if the post is not purhcased, and it is for sale
					else if (this.props.post.purchased == false && forsale) {

							actions.push(React.createElement('span', { 'class': 'mdi mdi-library-plus icon pull-right', key: key++ }));
							actions.push(purhcase = React.createElement('span', { 'class': 'mdi mdi-cash icon pull-right', 'data-id': '\' + post._id + \'', key: key++ }));
						}
			}

			return React.createElement(
				'div',
				{ className: 'hover' },
				React.createElement(
					'a',
					{ className: 'md-type-body2 post-link', href: '/post/' + this.props.post._id },
					'See more'
				),
				actions
			);
		},
		edit: function () {

			// $.ajax({
			// 	url: '/scripts/post/gallery',
			// 	type: 'GET',
			// 	data: {id: post._id},
			// 	success: function(result, status, xhr){
			// 		if (result.err)
			// 			return this.error(null, null, result.err);

			// 		GALLERY_EDIT = result.data;
			// 		galleryEditUpdate();
			// 		$(".toggle-gedit").toggleClass("toggled");
			// 	},
			// 	error: function(xhr, status, error){
			// 		$.snackbar({content:resolveError(error)});
			// 	}
			// })

		},
		//Purhcase icon
		purhcase: function () {

			var thisElem = $(this),
			    post = $(this).attr('data-id');

			if (!post) return $.snackbar({ content: 'Invalid post' });

			alertify.confirm("Are you sure you want to purchase? This will charge your account. Content from members of your outlet may be purchased free of charge.", function (e) {

				if (e) {

					var assignment = null;

					if (typeof PAGE_Assignment !== 'undefined') {
						assignment = PAGE_Assignment.assignment;
					}
					$.ajax({
						url: '/scripts/outlet/checkout',
						dataType: 'json',
						method: 'post',
						contentType: "application/json",
						data: JSON.stringify({
							posts: [post],
							assignment: assignment ? assignment._id : null
						}),
						success: function (result, status, xhr) {

							if (result.err) return this.error(null, null, result.err);

							$.snackbar({ content: 'Purchase successful! Visit your <a style="color:white;" href="/outlet">outlet page</a> to view your purchased content', timeout: 0 });

							var card = thisElem.parents('tile');
							thisElem.siblings('.mdi-library-plus').remove();
							thisElem.parent().parent().find('.mdi-file-image-box').addClass('available');
							thisElem.parent().parent().find('.mdi-movie').addClass('available');
							card.removeClass('toggled');
							thisElem.remove();
						},
						error: function (xhr, status, error) {
							if (error == 'ERR_INCOMPLETE') $.snackbar({ content: 'There was an error while completing your purchase!' });else $.snackbar({ content: resolveError(error) });
						}
					});
				} else {
					// user clicked "cancel"
				}
			});
		},
		//Download function for icon
		download: function () {

			console.log(this.props.post);

			var href = this.props.post.video ? this.props.post.video.replace('videos/', 'videos/mp4/').replace('.m3u8', '.mp4') : this.props.post.image;

			var link = document.createElement("a");

			link.download = Date.now() + '.' + href.split('.').pop();
			link.href = href;
			link.click();
		}

	});

	module.exports = PostCell;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(3);

	/** //

	Description : Column on the left of the posts grid on the gallery detail page

	// **/

	/**
	 * Gallery sidebar parent object
	 */

	var GallerySidebar = React.createClass({

		displayName: 'GallerySidebar',

		render: function () {

			return React.createElement(
				'div',
				{ className: 'col-sm-4 profile hidden-xs' },
				React.createElement(
					'div',
					{ className: 'container-fluid fat' },
					React.createElement(
						'div',
						{ className: 'col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2' },
						React.createElement(
							'div',
							{ className: 'meta' },
							React.createElement(
								'div',
								{ className: 'meta-description', id: 'gallery-description' },
								this.props.gallery.caption
							),
							React.createElement(GalleryStats, { gallery: this.props.gallery })
						)
					)
				)
			);
		}

	});

	/**
	 * Gallery stats inside the sidebar
	 */

	var GalleryStats = React.createClass({

		displayName: 'GalleryStats',

		render: function () {

			if (!this.props.gallery.stats) return;

			var photos = '';
			videos = '';

			if (this.props.gallery.stats.photos) {
				photos = React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'mdi mdi-file-image-box icon' }),
					this.props.gallery.stats.photos,
					'photos'
				);
			}
			if (this.props.gallery.stats.videos) {
				videos = React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'mdi mdi-movie icon' }),
					this.props.gallery.stats.videos + ' video'
				);
			}

			return React.createElement(
				'div',
				{ className: 'meta-list' },
				React.createElement(
					'ul',
					{ className: 'md-type-subhead' },
					photos,
					videos
				)
			);
		}
	});

	module.exports = GallerySidebar;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    GalleryEditBody = __webpack_require__(15),
	    GalleryEditFoot = __webpack_require__(19);

	/**
	 * Gallery Edit Parent Object
	 */

	var GalleryEdit = React.createClass({

		displayName: 'Gallery Edit',

		getInitialState: function () {

			return {
				gallery: this.props.gallery
			};
		},

		render: function () {

			style = {
				position: 'absolute',
				top: '-100px'
			};

			return React.createElement(
				'div',
				null,
				React.createElement('div', { className: 'dim toggle-gedit' }),
				React.createElement(
					'div',
					{ className: 'edit panel panel-default toggle-gedit gedit' },
					React.createElement(
						'div',
						{ className: 'col-xs-12 col-lg-12 edit-new dialog' },
						React.createElement(GalleryEditHead, null),
						React.createElement(GalleryEditFoot, {
							updateGallery: this.updateGallery,
							gallery: this.state.gallery }),
						React.createElement(GalleryEditBody, {
							gallery: this.state.gallery,
							user: this.props.user,
							updateGallery: this.updateGallery })
					)
				)
			);
		},
		updateGallery: function (gallery) {
			//Update new gallery
			this.setState({ gallery: gallery });
		}

	});

	var GalleryEditHead = React.createClass({

		displayName: 'GalleryEditHead',

		render: function () {
			return React.createElement(
				'div',
				{ className: 'dialog-head' },
				React.createElement(
					'span',
					{ className: 'md-type-title' },
					'Edit Gallery'
				),
				React.createElement('span', { className: 'mdi mdi-close pull-right icon toggle-gedit toggler', onClick: this.hide })
			);
		},
		hide: function () {
			$(".toggle-gedit").toggleClass("toggled");
		}

	});

	module.exports = GalleryEdit;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    Tag = __webpack_require__(16),
	    EditPost = __webpack_require__(17),
	    EditMap = __webpack_require__(18);

	/**
	 * Gallery Edit Body, inside of the GalleryEditClass
	 */

	var GalleryEditBody = React.createClass({

		displayName: 'GalleryEditBody',

		getInitialState: function () {
			return {
				gallery: this.props.gallery
			};
		},

		render: function () {

			var highlightCheckbox = '';

			console.log(this.state);

			//Check if the rank is valid for toggling the highlighted state
			if (this.props.user.rank && this.props.user.rank >= 1) {

				highlightCheckbox = React.createElement(
					'div',
					{ className: 'dialog-row' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { id: 'gallery-highlight-input', type: 'checkbox' }),
							React.createElement('span', { className: 'ripple' }),
							React.createElement('span', { className: 'check' }),
							' Highlighted'
						)
					)
				);
			}

			return React.createElement(
				'div',
				{ className: 'dialog-body' },
				React.createElement(
					'div',
					{ className: 'dialog-col col-xs-12 col-md-7 form-group-default' },
					React.createElement(GalleryEditByline, { gallery: this.state.gallery }),
					React.createElement(
						'div',
						{ className: 'dialog-row' },
						React.createElement(
							'div',
							{ className: 'form-control-wrapper' },
							React.createElement('textarea', { id: 'gallery-caption-input', type: 'text', className: 'form-control', defaultValue: this.state.gallery.caption }),
							React.createElement(
								'div',
								{ className: 'floating-label' },
								'Caption'
							),
							React.createElement('span', { className: 'material-input' })
						)
					),
					React.createElement(GalleryEditTags, { ref: 'tags', tags: this.state.gallery.tags }),
					React.createElement(GalleryEditStories, { ref: 'stories', stories: this.state.gallery.related_stories }),
					React.createElement(GalleryEditArticles, { ref: 'articles', articles: this.state.gallery.articles }),
					highlightCheckbox
				),
				React.createElement(GalleryEditPosts, { posts: this.state.gallery.posts, files: this.state.gallery.files }),
				React.createElement(GalleryEditMap, { gallery: this.state.gallery })
			);
		}

	});

	/**
	 * Component for managing byline editing
	 */

	var GalleryEditByline = React.createClass({

		displayName: 'GalleryEditByline',

		render: function () {

			var post = this.props.gallery.posts[0];

			//If the post contains twitter info, show twitter byline editor
			if (post.meta && post.meta.twitter) {

				var isHandleByline = post.byline.indexOf('@') == 0;

				if (isHandleByline) byline = post.meta.twitter.handle;else byline = post.meta.twitter.user_name;

				return React.createElement(
					'div',
					{ className: 'dialog-row' },
					React.createElement(
						'div',
						{ className: 'split byline-section', id: 'gallery-byline-twitter' },
						React.createElement(
							'div',
							{ className: 'split-cell drop' },
							React.createElement(
								'button',
								{ className: 'toggle-drop md-type-subhead' },
								React.createElement(
									'span',
									{ className: 'gallery-byline-text' },
									byline
								),
								React.createElement('span', { className: 'mdi mdi-menu-down icon pull-right' })
							),
							React.createElement(
								'div',
								{ className: 'drop-menu panel panel-default byline-drop' },
								React.createElement(
									'div',
									{ className: 'toggle-drop toggler md-type-subhead' },
									React.createElement(
										'span',
										{ className: 'gallery-byline-text' },
										post.meta.twitter.handle
									),
									React.createElement('span', { className: 'mdi mdi-menu-up icon pull-right' })
								),
								React.createElement(
									'div',
									{ className: 'drop-body' },
									React.createElement(
										'ul',
										{ className: 'md-type-subhead', id: 'gallery-byline-twitter-options' },
										React.createElement(
											'li',
											{ className: 'gallery-byline-type ' + (isHandleByline ? 'active' : '') },
											post.meta.twitter.handle
										),
										React.createElement(
											'li',
											{ className: 'gallery-byline-type ' + (!isHandleByline ? 'active' : '') },
											post.meta.twitter.user_name
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'split-cell' },
							React.createElement(
								'div',
								{ className: 'form-control-wrapper' },
								React.createElement('input', { type: 'text', className: 'form-control', defaultValue: post.meta.other_origin.affiliation, id: 'gallery-twitter-affiliation-input' }),
								React.createElement(
									'div',
									{ className: 'floating-label' },
									'Affiliation'
								),
								React.createElement('span', { className: 'material-input' })
							)
						)
					)
				);
			}
			//If the post doesn't have an owner, but has a curator i.e. manually imported
			else if (!post.owner && post.curator) {

					var name = '',
					    affiliation = '';

					if (post.meta.other_origin) {
						name = post.meta.other_origin.name;
						affiliation = post.meta.other_origin.affiliation;
					}

					return React.createElement(
						'div',
						{ className: 'dialog-row' },
						React.createElement(
							'div',
							{ className: 'split byline-section', id: 'gallery-byline-other-origin' },
							React.createElement(
								'div',
								{ className: 'split-cell', id: 'gallery-name-span' },
								React.createElement(
									'div',
									{ className: 'form-control-wrapper' },
									React.createElement('input', { type: 'text', className: 'form-control empty', defaultValue: name, id: 'gallery-name-input' }),
									React.createElement(
										'div',
										{ className: 'floating-label' },
										'Name'
									),
									React.createElement('span', { className: 'material-input' })
								)
							),
							React.createElement(
								'div',
								{ className: 'split-cell' },
								React.createElement(
									'div',
									{ className: 'form-control-wrapper' },
									React.createElement('input', { type: 'text', className: 'form-control empty', defaultValue: affiliation, id: 'gallery-affiliation-input' }),
									React.createElement(
										'div',
										{ className: 'floating-label' },
										'Affiliation'
									),
									React.createElement('span', { className: 'material-input' })
								)
							)
						)
					);
				} else {
					return React.createElement(
						'div',
						{ className: 'dialog-row' },
						React.createElement(
							'span',
							{ className: 'byline-section', id: 'gallery-byline-span' },
							React.createElement(
								'div',
								{ className: 'form-control-wrapper' },
								React.createElement('input', { id: 'gallery-byline-input', defaultValue: post.byline, type: 'text', className: 'form-control', disabled: true }),
								React.createElement(
									'div',
									{ className: 'floating-label' },
									'Byline'
								),
								React.createElement('span', { className: 'material-input' })
							)
						)
					);
				}
		}

	});

	/**
	 * Component for managing added/removed tags
	 */

	var GalleryEditTags = React.createClass({

		displayName: 'GalleryEditTags',

		//Set state as passed properties
		getInitialState: function () {
			return { tags: this.props.tags };
		},

		componentWillReceiveProps: function (nextProps) {

			this.setState({
				tags: nextProps.tags
			});
		},

		render: function () {

			tags = this.state.tags.map(function (tag, i) {
				return React.createElement(Tag, {
					onClick: this.handleClick.bind(this, i),
					text: '#' + tag,
					plus: false,
					key: i });
			}, this);

			return React.createElement(
				'div',
				{ className: 'dialog-row split chips' },
				React.createElement(
					'div',
					{ className: 'split-cell' },
					React.createElement('input', {
						id: 'gallery-tags-input',
						type: 'text',
						className: 'form-control floating-label',
						placeholder: 'Tags',
						onChange: this.change }),
					React.createElement(
						'ul',
						{ ref: 'gallery-tags-list', className: 'chips' },
						tags
					)
				),
				React.createElement(
					'div',
					{ className: 'split-cell' },
					React.createElement(
						'span',
						{ className: 'md-type-body2' },
						'Suggested tags'
					),
					React.createElement('ul', { id: 'gallery-suggested-tags-list', className: 'chips' })
				)
			);
		},

		handleClick: function (index) {

			var updatedTags = this.state.tags;

			//Remove from index
			updatedTags.splice(index, 1);

			//Update state
			this.setState({
				tags: updatedTags
			});
		}

	});

	/**
	 * Component for managing added/removed stories
	 */

	var GalleryEditStories = React.createClass({

		displayName: 'GalleryEditStories',

		getInitialState: function () {

			return { stories: this.props.stories };
		},

		componentWillReceiveProps: function (nextProps) {

			this.setState({ stories: nextProps.stories });
		},

		render: function () {

			stories = this.state.stories.map(function (story, i) {

				return React.createElement(Tag, {
					onClick: this.handleClick.bind(this, i),
					text: story.title,
					plus: false,
					key: i });
			}, this);

			return React.createElement(
				'div',
				{ className: 'dialog-row split chips' },
				React.createElement(
					'div',
					{ className: 'split-cell' },
					React.createElement('input', {
						id: 'gallery-stories-input',
						type: 'text',
						className: 'form-control floating-label',
						placeholder: 'Stories',
						onChange: this.change }),
					React.createElement(
						'ul',
						{ id: 'gallery-stories-list', className: 'chips' },
						stories
					)
				),
				React.createElement(
					'div',
					{ className: 'split-cell' },
					React.createElement(
						'span',
						{ className: 'md-type-body2' },
						'Suggested stories'
					),
					React.createElement('ul', { id: 'gallery-suggested-stories-list', className: 'chips' })
				)
			);
		},

		handleClick: function (index) {

			var updatedStories = this.state.stories;

			//Remove from index
			updatedStories.splice(index, 1);

			//Update state
			this.setState({
				stories: updatedStories
			});
		}
	});

	/**
	 * Component for managing added/removed articles
	 */

	var GalleryEditArticles = React.createClass({

		displayName: 'GalleryEditArticles',

		getInitialState: function () {
			return { articles: this.props.articles };
		},

		componentWillReceiveProps: function (nextProps) {

			this.setState({ articles: nextProps.articles });
		},

		render: function () {

			articles = this.state.articles.map(function (article, i) {

				return React.createElement(Tag, {
					onClick: this.handleClick.bind(this, i),
					text: article.link,
					plus: false,
					key: i });
			}, this);

			return React.createElement(
				'div',
				{ className: 'dialog-row split chips' },
				React.createElement(
					'div',
					{ className: 'split-cell' },
					React.createElement('input', {
						id: 'gallery-articles-input',
						type: 'text',
						className: 'form-control floating-label',
						placeholder: 'Articles' }),
					React.createElement(
						'ul',
						{ id: 'gallery-articles-list', className: 'chips' },
						articles
					)
				)
			);
		},
		handleClick: function (index) {

			var updateArticles = this.state.articles;

			//Remove from index
			updateArticles.splice(index, 1);

			//Update state
			this.setState({
				articles: updateArticles
			});
		}

	});

	/**
	 * Component for managing gallery map representation
	 */

	var GalleryEditMap = React.createClass({

		displayName: 'GalleryEditMap',

		//Configure google maps after component mounts
		componentDidMount: function () {

			//Set up autocomplete listener
			autocomplete = new google.maps.places.Autocomplete(document.getElementById('gallery-location-input'));

			google.maps.event.addListener(autocomplete, 'place_changed', function () {

				var place = autocomplete.getPlace();

				if (place.geometry) {

					marker.setPosition(place.geometry.location);

					if (place.geometry.viewport) {
						map.fitBounds(place.geometry.viewport);
					} else {
						map.panTo(place.geometry.location);
						map.setZoom(18);
					}
				}
			});
		},

		render: function () {

			return React.createElement(
				'div',
				{ className: 'dialog-col col-xs-12 col-md-5 pull-right' },
				React.createElement(
					'div',
					{ className: 'dialog-row map-group' },
					React.createElement(
						'div',
						{ className: 'form-group-default' },
						React.createElement('input', {
							id: 'gallery-location-input',
							type: 'text', className: 'form-control floating-label',
							placeholder: 'Location' })
					),
					React.createElement(EditMap, { gallery: this.props.gallery })
				)
			);
		}

	});

	/**
	 * Component for managing gallery's posts
	 */

	var GalleryEditPosts = React.createClass({

		displayName: 'GalleryEditPosts',

		getInitialState: function () {
			return {
				posts: this.props.posts,
				files: []
			};
		},

		componentWillReceiveProps: function (nextProps) {

			this.setState({
				posts: nextProps.posts,
				files: nextProps.files
			});
		},

		componentDidUpdate: function () {

			$(this.refs.galleryEditPosts).frick();
		},

		render: function () {

			var posts = this.state.posts.map(function (post, i) {

				return React.createElement(EditPost, { key: i, post: post });
			}, this);

			var files = [];

			for (var i = 0; i < this.state.files.length; i++) {

				files.push(React.createElement(EditPost, { key: i, file: this.state.files[i], source: this.state.files.sources[i] }));
			}

			return React.createElement(
				'div',
				{ className: 'dialog-col col-xs-12 col-md-5' },
				React.createElement(
					'div',
					{ ref: 'galleryEditPosts', className: 'edit-gallery-images' },
					posts,
					files
				)
			);
		}
	});

	module.exports = GalleryEditBody;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/**
	 * Single Tag Element
	 * @param {string} text Text of the tag
	 * @param {bool} plus if component should show `+` or `-` on hover
	 */

	var Tag = React.createClass({

		displayName: 'Tag',

		getDefaultProps: function () {

			return {
				text: '',
				plus: false
			};
		},

		render: function () {

			var editClass = 'mdi-minus';

			if (this.props.plus) editClass = 'mdi-plus';

			return React.createElement(
				'li',
				{ className: 'chip', onClick: this.props.onClick },
				React.createElement(
					'div',
					{ className: 'chip' },
					React.createElement(
						'div',
						{ className: 'icon' },
						React.createElement('span', { className: 'mdi ' + editClass + ' icon md-type-subhead' })
					),
					React.createElement(
						'span',
						{ className: 'chip md-type-body1 tag' },
						this.props.text
					)
				)
			);
		}

	});

	module.exports = Tag;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/**
	 * Single Edit-Post Element
	 * @description Post element that is wrapped inside container slick usually
	 */

	var EditPost = React.createClass({

		displayName: 'EditPost',

		getDefaultProps: function () {

			return {
				post: {}
			};
		},
		//Add source after rendering for local files
		componentDidMount: function () {

			if (!this.props.file) return;
		},

		render: function () {

			//Check if we're reading from a file, and we have the file's source
			if (this.props.file && this.props.source) {

				if (this.props.file.type.indexOf('video') !== -1) {
					//video

					return React.createElement(
						'video',
						{ width: '100%', height: '100%', 'data-id': this.props.post._id, controls: true },
						React.createElement('source', {
							id: this.props.file.lastModified,
							src: this.props.source,
							type: 'video/mp4', ref: 'video' }),
						'Your browser does not support the video tag.'
					);
				} else {
					//image

					return React.createElement('img', {
						className: 'img-responsive',
						id: this.props.file.lastModified,
						src: this.props.source,
						ref: 'image' });
				}
			} else if (this.props.post.video) {

				return React.createElement(
					'video',
					{ width: '100%', height: '100%', 'data-id': this.props.post._id, controls: true },
					React.createElement('source', {
						src: this.props.post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4'),
						type: 'video/mp4' }),
					'Your browser does not support the video tag.'
				);
			} else {

				return React.createElement('img', {
					className: 'img-responsive',
					src: formatImg(this.props.post.image, 'medium'),
					'data-id': this.props.post._id });
			}
		}

	});

	module.exports = EditPost;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/**
	 * Single Edit-Map Element
	 * @description Map element that is found in Gallery Edit, Admin Panel, etc.
	 */

	var EditMap = React.createClass({

		displayName: 'EditMap',

		componentDidMount: function () {

			var styles = [{ "featureType": "all", "elementType": "all", "stylers": [{ "gamma": 1.54 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "gamma": 1.54 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#e0e0e0" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#bdbdbd" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "poi.park", "elementType": "all", "stylers": [{ "gamma": 1.26 }] }, { "featureType": "poi.park", "elementType": "labels.text", "stylers": [{ "saturation": -54 }] }];

			var mapOptions = {
				center: { lat: 40.7, lng: -74 },
				zoom: 12,
				mapTypeControl: false,
				styles: styles
			};

			//Instantiate google maps object
			map = new google.maps.Map(document.getElementById('gallery-map-canvas'), mapOptions);

			//Marker image
			var markerImage = {
				url: "/images/assignment-active@2x.png",
				size: new google.maps.Size(114, 114),
				scaledSize: new google.maps.Size(60, 60),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(30, 30)
			};

			//Instantiate polygon
			polygon = new google.maps.Polygon({
				paths: [],
				strokeColor: "#FFB500",
				strokeOpacity: 0.8,
				strokeWeight: 0,
				fillColor: "#FFC600",
				fillOpacity: 0.35,
				map: map
			});

			//Set default marker to NYC
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(40.7, -74),
				map: map,
				icon: markerImage
			});

			//Location is present
			if (this.props.gallery.location) {

				polygon.setMap(map);

				polygon.setPath(this.props.gallery.location.coordinates[0].map(function (a) {
					return {
						lat: a[1],
						lng: a[0]
					};
				}));

				marker.setPosition(this.getCentroid(polygon));

				map.fitBounds(this.getBounds(polygon));
			}
			//No location is present
			else {
					polygon.setMap(null);
				}
		},
		render: function () {

			return React.createElement('div', { id: 'gallery-map-canvas', className: 'map-container' });
		},
		//Returns centroid for passed polygon
		getCentroid: function (polygon) {

			var path = polygon.getPath(),
			    lat = 0,
			    lon = 0;

			for (var i = 0; i < path.getLength() - 1; ++i) {
				lat += path.getAt(i).lat();
				lon += path.getAt(i).lng();
			}

			lat /= path.getLength() - 1;
			lon /= path.getLength() - 1;

			return new google.maps.LatLng(lat, lon);
		},
		getBounds: function (polygon) {

			var bounds = new google.maps.LatLngBounds();
			var paths = polygon.getPaths();
			var path;

			for (var i = 0; i < paths.getLength(); i++) {
				path = paths.getAt(i);
				for (var ii = 0; ii < path.getLength(); ii++) {
					bounds.extend(path.getAt(ii));
				}
			}
			return bounds;
		}

	});

	module.exports = EditMap;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	var GalleryEditFoot = React.createClass({

		displayName: 'GalleryEditFoot',

		getInitialState: function () {
			return {
				gallery: this.props.gallery
			};
		},

		render: function () {

			var addMore = '';

			if (this.state.gallery.imported) addMore = React.createElement(
				'button',
				{ id: 'gallery-add-more-button', type: 'button', onClick: this.addMore, className: 'btn btn-flat' },
				'Add More'
			);

			return React.createElement(
				'div',
				{ className: 'dialog-foot' },
				React.createElement('input', {
					id: 'gallery-upload-files',
					type: 'file',
					accept: 'image/*,video/*,video/mp4',
					multiple: true,
					style: style,
					ref: 'fileUpload',
					onChange: this.fileUploaderChanged }),
				React.createElement(
					'button',
					{ id: 'gallery-revert-button', type: 'button', onClick: this.revert, className: 'btn btn-flat' },
					'Revert changes'
				),
				React.createElement(
					'button',
					{ id: 'gallery-clear-button', type: 'button', onClick: this.clear, className: 'btn btn-flat' },
					'Clear all'
				),
				addMore,
				React.createElement(
					'button',
					{ id: 'gallery-cancel-button', type: 'button', onClick: this.cancel, className: 'btn btn-flat pull-right toggle-gedit toggler' },
					'Cancel'
				),
				React.createElement(
					'button',
					{ id: 'gallery-delete-button', type: 'button', onClick: this.delete, className: 'btn btn-flat pull-right' },
					'Delete'
				),
				React.createElement(
					'button',
					{ id: 'gallery-save-button', type: 'button', onClick: this.save, className: 'btn btn-flat pull-right' },
					'Save'
				)
			);
		},
		revert: function () {},
		clear: function () {

			gallery = this.state.gallery;

			gallery.caption = '';
			gallery.tags = [];
			gallery.related_stories = [];
			gallery.articles = [];
			gallery.location = {};

			this.props.updateGallery(gallery);
		},
		addMore: function () {

			document.getElementById('gallery-upload-files').click();
		},
		fileUploaderChanged: function () {

			var gallery = this.state.gallery,
			    files = this.refs.fileUpload.files,
			    self = this;

			//Set gallery files from input file
			gallery.files = files, gallery.files.sources = [];

			for (var i = 0; i < files.length; i++) {

				var file = files[i];

				var reader = new FileReader();

				reader.onload = (function (index) {

					return function (e) {

						gallery.files.sources.push(e.target.result);

						//When we're at the end of the loop, send the state update to the parent
						if (index == files.length - 1) self.props.updateGallery(gallery);
					};
				})(i);

				reader.readAsDataURL(file);
			}
		},
		cancel: function () {

			$(".toggle-gedit").toggleClass("toggled");
		},
		delete: function () {},
		//Save function
		save: function () {

			var caption = $('#gallery-caption-input').val();
			var byline = $('.gallery-byline-text').eq(0).text();
			var other_origin = null;
			var tags = $('#gallery-tags-list .tag').text().split('#').filter(function (t) {
				return t.length > 0;
			});
			var posts = $('.edit-gallery-images').frick('frickPosts');
			var visibility = null;

			if ($('#gallery-other-origin').css('display') !== 'none') {
				byline = $('#gallery-name-input').val().trim() + ' / ' + $('#gallery-affiliation-input').val().trim();
				other_origin = {
					name: $('#gallery-name-input').val().trim(),
					affiliation: $('#gallery-affiliation-input').val().trim()
				};
			}

			var added = posts.filter(function (id) {
				return id.indexOf('NEW') !== -1;
			});
			added = added.map(function (index) {
				index = index.split('=')[1];
				return GALLERY_EDIT.files[index];
			});

			posts = posts.filter(function (id) {
				return id.indexOf('NEW') == -1;
			});

			if (posts.length == 0) return $.snackbar({ content: "Galleries must have at least 1 post" });

			if ($('#gallery-highlight-input').length !== 0 && galleryEditVisibilityChanged == 1) visibility = $('#gallery-highlight-input').prop('checked') ? 2 : 1;

			updateGallery(caption, byline, tags, posts, visibility, other_origin, function (err, GALLERY_EDIT) {

				if (err) return $.snackbar({ content: resolveError(err) });

				if (added.length > 0) {

					var data = new FormData();

					for (var index in added) {
						data.append(index, added[index]);
					}

					data.append('gallery', GALLERY_EDIT._id);

					$.ajax({
						url: '/scripts/gallery/addpost',
						type: 'POST',
						data: data,
						processData: false,
						contentType: false,
						cache: false,
						dataType: 'json',
						success: function (result, status, xhr) {
							window.location.reload();
						},
						error: function (xhr, status, error) {
							$.snackbar({ content: resolveError(err) });
						}
					});
				} else window.location.reload();
			});
		}

	});

	module.exports = GalleryEditFoot;

/***/ }
/******/ ]);