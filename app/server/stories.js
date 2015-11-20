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
	    TopBar = __webpack_require__(9),
	    StoryList = __webpack_require__(28);
	App = __webpack_require__(11);

	/**
	 * Stories Parent Object, contains StoryList composed of StoryCells
	 */

	var Stories = React.createClass({

		displayName: 'Stories',

		render: function () {

			return React.createElement(
				App,
				{ user: this.props.user },
				React.createElement(TopBar, {
					title: 'Stories',
					timeToggle: true,
					tagToggle: true }),
				React.createElement(StoryList, {
					loadStories: this.loadStories,
					scrollable: true })
			);
		},

		//Returns array of posts with offset and callback, used in child PostList
		loadStories: function (passedOffset, callback) {

			var endpoint = '/v1/post/list',
			    params = {
				limit: 10,
				verified: true,
				invalidate: 1,
				offset: passedOffset
			};

			$.ajax({
				url: API_URL + '/v1/story/recent',
				type: 'GET',
				data: params,
				dataType: 'json',
				success: function (response, status, xhr) {

					console.log(response);

					//Do nothing, because of bad response
					if (!response.data || response.err) callback([]);else callback(response.data);
				},
				error: function (xhr, status, error) {
					$.snackbar({
						content: 'Couldn\'t fetch any stories!'
					});
				}

			});
		}

	});

	if (isNode) {

		module.exports = Stories;
	} else {

		ReactDOM.render(React.createElement(Stories, { user: window.__initialProps__.user }), document.getElementById('app'));
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
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    Dropdown = __webpack_require__(10);

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

			var topbarItems = [];

			if (this.props.editable) {
				topbarItems.push(React.createElement('a', { className: 'mdi mdi-pencil icon pull-right hidden-xs toggle-gedit toggler',
					key: 'edit',
					onClick: this.toggleEdit }));
			}
			if (this.props.chronToggle) {
				topbarItems.push(React.createElement(Dropdown, {
					options: ['By capture time', 'By upload time'],
					selected: 'By capture time',
					onSelected: this.chronToggleSelected,
					key: 'chronToggle',
					inList: true }));
			}
			if (this.props.timeToggle) {

				topbarItems.push(React.createElement(Dropdown, {
					options: ['Relative', 'Absolute'],
					selected: 'Absolute',
					onSelected: this.timeToggleSelected,
					key: 'timeToggle',
					inList: true }));
			}
			if (this.props.verifiedToggle) {

				topbarItems.push(React.createElement(Dropdown, {
					options: ['All content', 'Verified'],
					selected: 'Verified',
					onSelected: this.verifiedToggleSelected,
					key: 'verifiedToggle',
					inList: true }));
			}

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
				topbarItems
			);
		},

		//Called when the user selectes a time format
		timeToggleSelected: function (selected) {
			if (selected == 'Absolute') {
				setTimeDisplayType('absolute');
			} else if (selected == 'Relative') {
				setTimeDisplayType('relative');
			}
		},

		//Called when the user selectes a time format
		verifiedToggleSelected: function (selected) {},

		//Called when the user selectes a time format
		chronToggleSelected: function (selected) {},

		toggleEdit: function () {

			$(".toggle-gedit").toggleClass("toggled");
		}

	});

	module.exports = TopBar;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/**
	 * Generic Dropdown Element
	 * @param  {function} onSelected A function called wtih the user's selection
	 */

	var Dropdown = React.createClass({

		displayName: 'Dropdown',

		getDefaultProps: function () {
			return {
				options: ['Relative', 'Absolute'],
				inList: false
			};
		},

		getInitialState: function () {
			return {
				selected: this.props.selected
			};
		},

		//Called whenever the master button is clicked
		clicked: function (event) {

			var drop = $(this.refs.toggle_button).siblings(".drop-menu");

			drop.toggleClass("toggled");

			if (drop.hasClass("toggled")) {
				var offset = drop.offset().left;
				while (offset + drop.outerWidth() > $(window).width() - 7) {
					drop.css("left", parseInt(drop.css("left")) - 1 + "px");
					offset = drop.offset().left;
				}
			}

			$(".dim.toggle-drop").toggleClass("toggled");
		},

		//Called whenever an option is selected from the dropdown
		optionClicked: function (event) {

			var selected = event.currentTarget.innerHTML;

			//If the user chose the already selected option, don't do anything
			if (this.state.selected == selected) {
				this.hideDropdown();
				return;
			}

			this.setState({
				selected: selected
			});

			this.hideDropdown();

			if (this.props.onSelected) {
				this.props.onSelected(selected);
			}
		},

		//Hides the dropdown menu and removes the whole-screen dim
		hideDropdown: function () {

			this.refs.drop.classList.remove('toggled');

			var toRemoveToggle = document.getElementsByClassName('toggle-drop');

			for (var i = 0; i < toRemoveToggle.length; i++) {
				toRemoveToggle[i].classList.remove('toggled');
			}
		},

		render: function () {

			var options = this.props.options.map(function (option) {

				var className = '';

				if (option === this.state.selected) {
					//Highlight the current selection
					className += ' active';
				}

				return React.createElement(
					'li',
					{ className: className, key: option, onClick: this.optionClicked },
					option
				);
			}, this);

			var dropdownButton = React.createElement(
				'button',
				{ className: 'toggle-drop md-type-subhead', ref: 'toggle_button', onClick: this.clicked },
				React.createElement(
					'span',
					null,
					this.state.selected
				),
				React.createElement('span', { className: 'mdi mdi-menu-down icon' })
			);

			var dropdownList = React.createElement(
				'div',
				{ className: 'drop-menu panel panel-default', ref: 'drop', onClick: this.hideDropdown },
				React.createElement(
					'div',
					{ className: 'toggle-drop toggler md-type-subhead' },
					React.createElement(
						'span',
						null,
						this.state.selected
					),
					React.createElement('span', { className: 'mdi mdi-menu-up icon pull-right' })
				),
				React.createElement(
					'div',
					{ className: 'drop-body' },
					React.createElement(
						'ul',
						{ className: 'md-type-subhead' },
						options
					)
				)
			);

			if (this.props.inList) {
				return React.createElement(
					'li',
					{ className: 'drop pull-right hidden-xs' },
					dropdownButton,
					dropdownList
				);
			} else {
				return React.createElement(
					'div',
					{ className: 'split-cell drop' },
					dropdownButton,
					dropdownList
				);
			}
		}
	});

	module.exports = Dropdown;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var isNode = __webpack_require__(1),
	    React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    Sidebar = __webpack_require__(12);

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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    config = __webpack_require__(13);

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
		displayName: 'SideBarListItems',

		render: function () {

			if (!this.props.user) return;

			if (this.props.user.outlet || this.props.user.rank >= config.RANKS.CONTENT_MANAGER) {
				var dispatch = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/dispatch' },
					React.createElement('span', { className: 'mdi mdi-map icon' }),
					'Dispatch'
				);
			}

			if (this.props.user.outlet != null) {

				var outlet = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/outlet' },
					React.createElement('span', { className: 'mdi mdi-account-multiple icon' }),
					this.props.user.outlet.title
				);
			}
			if (this.props.user.rank >= 2) {

				var admin = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/admin' },
					React.createElement('span', { className: 'mdi mdi-dots-horizontal icon' }),
					'Admin'
				);

				var purchases = React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/purchases' },
					React.createElement('span', { className: 'mdi mdi-currency-usd icon' }),
					'Purchases'
				);
			}
			return React.createElement(
				'ul',
				{ className: 'md-type-body1' },
				React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/highlights' },
					React.createElement('span', { className: 'mdi mdi-star icon' }),
					'Highlights'
				),
				React.createElement(
					'li',
					{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/content' },
					React.createElement('span', { className: 'mdi mdi-play-box-outline icon' }),
					'All content'
				),
				React.createElement(
					'ul',
					null,
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/content/photos' },
						React.createElement('span', { className: 'mdi mdi-file-image-box icon' }),
						'Photos'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/content/videos' },
						React.createElement('span', { className: 'mdi mdi-movie icon' }),
						'Videos'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/content/admin' },
						React.createElement('span', { className: 'mdi mdi-image-filter icon' }),
						'Galleries'
					),
					React.createElement(
						'li',
						{ className: 'sidebar-tab', onClick: this.itemClicked, 'data-link': '/content/stories' },
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
/* 13 */
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
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3), StoryCell = __webpack_require__(29);

	/** //

	Description : List for a set of stories used across the site (/videos, /photos, /gallery/id, /assignment/id , etc.)

	// **/

	/**
	 * Story List Parent Object 
	 */

	var StoryList = React.createClass({

		displayName: 'StoryList',

		getInitialState: function () {
			return {
				stories: []
			};
		},

		componentDidMount: function () {

			self = this;

			//Access parent var load method
			this.props.loadStories(0, function (stories) {

				var offset = stories ? stories.length : 0;

				//Set stories from successful response
				self.setState({
					stories: stories
				});
			}, this);
		},

		//Scroll listener for main window
		scroll: function () {

			var grid = this.refs.grid;

			//Check that nothing is loading and that we're at the end of the scroll,
			//and that we have a parent bind to load  more stories
			if (!this.state.loading && grid.scrollTop === grid.scrollHeight - grid.offsetHeight && this.props.loadStories) {

				self = this;

				//Set that we're loading
				this.setState({ loading: true });

				//Run load on parent call
				this.props.loadStories(this.state.offset, function (stories) {

					if (!stories) return;

					var offset = self.state.stories.length + stories.length;

					//Set galleries from successful response, and unset loading
					self.setState({
						stories: self.state.stories.concat(stories),
						offset: offset,
						loading: false
					});
				}, this);
			}
		},

		render: function () {

			//Check if list was initialzied with stories
			stories = this.state.stories;

			var purchases = this.props.purchases,
			    rank = this.props.rank;

			//Map all the stories into cells
			var stories = stories.map(function (story, i) {

				var purchased = purchases ? purchases.indexOf(story._id) != -1 : null;

				return React.createElement(StoryCell, {
					story: story,
					key: i });
			}, this);

			return React.createElement(
				'div',
				{ className: 'container-fluid fat grid', ref: 'grid', onScroll: this.props.scrollable ? this.scroll : null },
				React.createElement(
					'div',
					{ className: 'row tiles', id: 'stories' },
					stories
				)
			);
		}

	});

	module.exports = StoryList;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3);

	/**
	 * Single Story Cell, child of StoryList
	 */

	var StoryCell = React.createClass({

		displayName: 'StoryCell',

		render: function () {

			// var size = half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6';

			var timestamp = this.props.story.time_created;
			var timeString = formatTime(this.props.story.time_created);

			return React.createElement(
				'div',
				{ className: 'col-xs-6 col-md-3 tile story' },
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
							this.props.story.caption
						),
						React.createElement(
							'ul',
							{ className: 'md-type-body2' },
							React.createElement(
								'li',
								null,
								this.props.story.gallery_count + ' gallery' + (this.props.story.gallery_count == 1 ? 's' : '')
							)
						)
					),
					React.createElement(StoryCellImages, { thumbnails: this.props.story.thumbnails })
				),
				React.createElement(
					'div',
					{ className: 'tile-foot' },
					React.createElement(
						'div',
						{ className: 'hover' },
						React.createElement(
							'a',
							{ href: '/story/' + this.props.story._id, className: 'md-type-body2' },
							'See all'
						)
					),
					React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							null,
							React.createElement(
								'span',
								{ className: 'md-type-body2' },
								this.props.story.title
							),
							React.createElement(
								'span',
								{ className: 'md-type-caption timestring', 'data-timestamp': timestamp },
								timeString
							)
						)
					)
				)
			);
		}
	});

	/**
	 * Post Cell Images
	 */

	var StoryCellImages = React.createClass({

		displayName: "StoryCellImages",

		render: function () {

			if (!this.props.thumbnails || this.props.thumbnails.length == 0) {
				return React.createElement('div', { className: 'flex-row' });
			} else if (this.props.thumbnails.length == 1) {
				return React.createElement(
					'div',
					{ className: 'flex-row' },
					React.createElement(StoryCellImage, { post: this.props.thumbnails[0], size: 'small' })
				);
			} else if (this.props.thumbnails.length < 5) {

				return React.createElement(
					'div',
					{ className: 'flex-row' },
					React.createElement(StoryCellImage, { post: this.props.thumbnails[0], size: 'small' }),
					React.createElement(StoryCellImage, { post: this.props.thumbnails[1], size: 'small' })
				);
			} else if (this.props.thumbnails.length >= 5 && this.props.thumbnails.length < 8) {
				return React.createElement(
					'div',
					{ className: 'flex-row' },
					React.createElement(
						'div',
						{ className: 'flex-col' },
						React.createElement(StoryCellImage, { post: this.props.thumbnails[0], size: 'small' })
					),
					React.createElement(
						'div',
						{ className: 'flex-col' },
						React.createElement(
							'div',
							{ className: 'flex-row' },
							React.createElement(StoryCellImage, { post: this.props.thumbnails[0], size: 'small' }),
							React.createElement(StoryCellImage, { post: this.props.thumbnails[1], size: 'small' })
						),
						React.createElement(
							'div',
							{ className: 'flex-row' },
							React.createElement(StoryCellImage, { post: this.props.thumbnails[3], size: 'small' }),
							React.createElement(StoryCellImage, { post: this.props.thumbnails[3], size: 'small' })
						)
					)
				);
			} else if (this.props.thumbnails.length >= 8) {

				return React.createElement(
					'div',
					{ className: 'flex-col' },
					React.createElement(
						'div',
						{ className: 'flex-row' },
						React.createElement(StoryCellImage, { post: this.props.thumbnails[0], size: 'small' }),
						React.createElement(StoryCellImage, { post: this.props.thumbnails[1], size: 'small' }),
						React.createElement(StoryCellImage, { post: this.props.thumbnails[2], size: 'small' }),
						React.createElement(StoryCellImage, { post: this.props.thumbnails[3], size: 'small' })
					),
					React.createElement(
						'div',
						{ className: 'flex-row' },
						React.createElement(StoryCellImage, { post: this.props.thumbnails[0], size: 'small' }),
						React.createElement(StoryCellImage, { post: this.props.thumbnails[2], size: 'small' }),
						React.createElement(StoryCellImage, { post: this.props.thumbnails[3], size: 'small' }),
						React.createElement(StoryCellImage, { post: this.props.thumbnails[4], size: 'small' })
					)
				);
			}
		}

	});

	/**
	 * Single Post Cell Image Item
	 */

	var StoryCellImage = React.createClass({

		displayName: 'StoryCellImage',

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

	module.exports = StoryCell;

/***/ }
/******/ ]);