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
	    PostInfo = __webpack_require__(26),
	    PostRelated = __webpack_require__(27),
	    PostDetailImage = __webpack_require__(28),
	    GalleryEdit = __webpack_require__(17),
	    App = __webpack_require__(11);

	/**
	 * Gallery Detail Parent Object, made of a side column and PostList
	 */

	var PostDetail = React.createClass({

	  displayName: 'PostDetail',

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
	        editable: true
	      }),
	      React.createElement(
	        'div',
	        { className: 'content' },
	        React.createElement(
	          'div',
	          { className: 'row' },
	          React.createElement(
	            'div',
	            { className: 'main' },
	            React.createElement(PostDetailImage, {
	              post: this.props.post,
	              user: this.props.user,
	              purchases: this.props.purchases }),
	            React.createElement(PostInfo, {
	              post: this.props.post,
	              gallery: this.props.gallery,
	              verifier: this.props.verifier })
	          )
	        ),
	        React.createElement(PostRelated, { gallery: this.props.gallery })
	      ),
	      React.createElement(GalleryEdit, {
	        gallery: this.props.gallery,
	        user: this.props.user
	      })
	    );
	  }

	});

	if (isNode) {

	  module.exports = PostDetail;
	} else {

	  //Make sure to remove this
	  ReactDOM.render(React.createElement(PostDetail, {
	    user: window.__initialProps__.user,
	    purchases: window.__initialProps__.purchases,
	    gallery: window.__initialProps__.gallery,
	    post: window.__initialProps__.post,
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
/* 5 */,
/* 6 */,
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/**
	 * Global purchase actions
	 */

	var PurchaseAction = React.createClass({

		displayName: 'PurchaseAction',

		render: function () {

			return React.createElement('span', { className: 'mdi mdi-cash icon pull-right', onClick: this.purchase });
		},
		//Called whenever the purhcase icon is selected
		purchase: function (event) {

			//Check if the prop exists first
			if (!this.props.post) return;

			var post = this.props.post._id,
			    assignment = this.props.assignment ? this.props.assignment._id : null;

			//Confirm the purchase
			alertify.confirm("Are you sure you want to purchase? This will charge your account. Content from members of your outlet may be purchased free of charge.", function (e) {

				if (e) {

					//Send request for purchase
					$.ajax({
						url: '/scripts/outlet/checkout',
						dataType: 'json',
						method: 'post',
						contentType: "application/json",
						data: JSON.stringify({
							posts: post,
							assignment: assignment
						}),
						success: function (result, status, xhr) {

							console.log(result);

							if (result.err) return this.error(null, null, result.err);

							$.snackbar({
								content: 'Purchase successful! Visit your <a style="color:white;" href="/outlet">outlet page</a> to view your purchased content',
								timeout: 0
							});

							// var card = thisElem.parents('tile');
							// thisElem.siblings('.mdi-library-plus').remove();
							// thisElem.parent().parent().find('.mdi-file-image-box').addClass('available');
							// thisElem.parent().parent().find('.mdi-movie').addClass('available');
							// card.removeClass('toggled');
							// thisElem.remove();
						},
						error: function (xhr, status, error) {
							$.snackbar({
								content: resolveError(error, 'There was an error while completing your purchase!')
							});
						}
					});
				} else {
					// user clicked "cancel"
				}
			});
		}

	});

	module.exports = PurchaseAction;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/**
	 * Global download action
	 */

	var DownloadAction = React.createClass({

		displayName: 'DownloadAction',

		render: function () {

			return React.createElement('span', { className: 'mdi mdi-download icon pull-right', onClick: this.download });
		},
		//Called whenever the purhcase icon is selected
		download: function (event) {

			console.log('test');

			if (!this.props.post) {

				$.snackbar({
					content: 'There was an error downloading this post',
					timeout: 0
				});

				return;
			}

			var href = this.props.post.video ? this.props.post.video.replace('videos/', 'videos/mp4/').replace('.m3u8', '.mp4') : this.props.post.image;

			var link = document.createElement("a");

			link.download = Date.now() + '.' + href.split('.').pop();
			link.href = href;
			link.click();
		}

	});

	module.exports = DownloadAction;

/***/ },
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    GalleryEditBody = __webpack_require__(18),
	    GalleryEditFoot = __webpack_require__(25);

	/** //

	Description : Component for adding gallery editing to the current view

	// **/

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

	    if (!this.props.user) return;

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
	            saveGallery: this.saveGallery,
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
	    this.setState({
	      gallery: gallery
	    });
	  },

	  saveGallery: function () {

	    var gallery = this.state.gallery,
	        files = gallery.files ? gallery.files : [],
	        caption = document.getElementById('gallery-edit-caption').value,
	        tags = gallery.tags;

	    console.log(files);

	    //Generate post ids for update
	    var posts = $('#edit-gallery-images').frick('frickPosts');

	    console.log(posts);

	    return;

	    if (gallery.posts.length + files.length == 0) return $.snackbar({ content: "Galleries must have at least 1 post" });

	    //Generate stories for update
	    var stories = gallery.related_stories.map(function (story) {

	      if (story.new) {
	        return 'NEW=' + JSON.stringify(story);
	      } else return story._id;
	    });

	    //Generate articles for update
	    var articles = gallery.articles.map(function (articles) {

	      if (articles.new) {
	        return 'NEW=' + JSON.stringify(articles);
	      } else return articles._id;
	    });

	    //Configure params for the updated gallery
	    var params = {
	      id: gallery._id,
	      caption: caption,
	      posts: posts,
	      tags: tags,
	      visibility: 1,
	      stories: stories,
	      articles: articles
	    };

	    //Configure the byline's other origin
	    //From twitter
	    if (gallery.posts[0].meta && gallery.posts[0].meta.twitter) {

	      params.other_origin_affiliation = document.getElementById('gallery-edit-affiliation').value;
	    }
	    //Imported
	    else if (!gallery.posts[0].owner && gallery.posts[0].curator) {

	        params.other_origin_name = document.getElementById('gallery-edit-name').value;
	        params.other_origin_affiliation = document.getElementById('gallery-edit-affiliation').value;
	      }

	    if (gallery.imported) {
	      params.lat = marker.getPosition().lat();
	      params.lon = marker.getPosition().lng();
	      if (gallery.location.address) {
	        params.address = document.getElementById('gallery-location-input').value;
	      }
	    }

	    console.log(params);

	    $.ajax("/scripts/gallery/update", {
	      method: 'post',
	      contentType: "application/json",
	      data: JSON.stringify(params),
	      success: function (result) {

	        console.log(result);

	        $.snackbar({
	          content: "Gallery successfully saved!"
	        });
	      },
	      error: function (xhr, status, error) {

	        $.snackbar({
	          content: "We ran into an error saving your gallery"
	        });
	      }

	    });
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3),
	    Tag = __webpack_require__(19),
	    EditPost = __webpack_require__(20),
	    EditMap = __webpack_require__(21),
	    StoriesAutoComplete = __webpack_require__(22),
	    BylineEdit = __webpack_require__(23);

	/**
	 * Gallery Edit Body, inside of the GalleryEdit class
	 * @description manages all of the input fields, and speaks to parent
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
					React.createElement(BylineEdit, { gallery: this.state.gallery }),
					React.createElement(
						'div',
						{ className: 'dialog-row' },
						React.createElement(
							'div',
							{ className: 'form-control-wrapper' },
							React.createElement('textarea', {
								id: 'gallery-edit-caption',
								type: 'text',
								className: 'form-control',
								defaultValue: this.state.gallery.caption }),
							React.createElement(
								'div',
								{ className: 'floating-label' },
								'Caption'
							),
							React.createElement('span', { className: 'material-input' })
						)
					),
					React.createElement(GalleryEditTags, { ref: 'tags', tags: this.state.gallery.tags }),
					React.createElement(GalleryEditStories, { ref: 'stories',
						stories: this.state.gallery.related_stories,
						updateRelatedStories: this.updateRelatedStories }),
					React.createElement(GalleryEditArticles, { ref: 'articles', articles: this.state.gallery.articles }),
					highlightCheckbox
				),
				React.createElement(GalleryEditPosts, { posts: this.state.gallery.posts, files: this.state.gallery.files }),
				React.createElement(GalleryEditMap, { gallery: this.state.gallery })
			);
		},

		updateRelatedStories: function (updatedStories) {

			this.state.gallery.related_stories = updatedStories;

			this.props.updateGallery(this.state.gallery);
		},

		updateArticles: function (articles) {

			this.state.gallery.articles = articles;

			this.props.updateGallery(gallery);
		},

		updatedTags: function (tags) {

			this.state.gallery.tags = tags;

			this.props.updateGallery(gallery);
		},

		updatedLocation: function (location) {

			this.state.gallery.locations[0] = location;

			this.props.updateGallery(gallery);
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
		//Add's story element
		addStory: function (newStory) {

			this.props.updateRelatedStories(this.state.stories.concat(newStory));
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
					React.createElement(StoriesAutoComplete, { addStory: this.addStory, stories: this.state.stories }),
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

			this.props.updateRelatedStories(updatedStories);
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
							placeholder: 'Location',
							defaultValue: this.props.gallery.posts[0].location.address,
							disabled: !this.props.gallery.imported })
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

			this.replaceState({
				posts: nextProps.posts,
				files: nextProps.files ? nextProps.files : []
			});
		},

		componentDidMount: function () {
			$(this.refs.galleryEditPosts).frick();
		},

		componentDidUpdate: function () {
			$(this.refs.galleryEditPosts).frick();
		},

		render: function () {

			var k = 0;

			var posts = this.state.posts.map(function (post) {

				return React.createElement(EditPost, { key: k++, post: post });
			}, this);

			var files = [];

			for (var i = 0; i < this.state.files.length; i++) {

				files.push(React.createElement(EditPost, { key: k++, file: this.state.files[i], source: this.state.files.sources[i] }));
			}

			return React.createElement(
				'div',
				{ className: 'dialog-col col-xs-12 col-md-5' },
				React.createElement(
					'div',
					{ ref: 'galleryEditPosts', id: 'gallery-edit-images' },
					posts,
					files
				)
			);
		}
	});

	module.exports = GalleryEditBody;

/***/ },
/* 19 */
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
/* 20 */
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

				console.log(this.props);

				return React.createElement('img', {
					className: 'img-responsive',
					src: formatImg(this.props.post.image, 'medium'),
					'data-id': this.props.post._id });
			}
		}

	});

	module.exports = EditPost;

/***/ },
/* 21 */
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3);

	/**
	 * Auto-complete component for stories input
	 */

	var StoriesAutoComplete = React.createClass({

		displayName: 'StoriesAutoComplete',

		componentDidMount: function () {

			var self = this;

			//Gallery Stories Autocomplete
			$(this.refs.story_input).typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: {
					menu: 'tt-menu shadow-z-2'
				}
			}, {
				name: 'stories',
				display: 'title',
				source: function (query, syncResults, asyncResults) {
					$.ajax({
						url: '/scripts/story/autocomplete',
						data: {
							q: query
						},
						success: function (result, status, xhr) {
							asyncResults(result.data || []);
						},
						error: function (xhr, statur, error) {
							asyncResults([]);
						}
					});
				},
				templates: {
					empty: ['<div id="story-empty-message" class="tt-suggestion">', 'Create new story', '</div>'].join('\n')
				}
			}).on('typeahead:select', function (ev, selectedStory) {

				//Check if the story is not in our existing set of stories by object id
				var filter = self.props.stories.filter(function (story) {
					return story._id == selectedStory._id;
				});

				if (filter.length == 0) self.props.addStory(selectedStory);else $.snackbar({ content: 'This gallery is already in that story!' });

				$(this).typeahead('val', '');
			}).on('keydown', function (ev) {

				emptyMessage = document.getElementById('story-empty-message');

				//Check if we're hitting enter and there is a new story option present
				if (ev.keyCode == 13 && typeof emptyMessage !== 'undefined') {

					//Check if we have a url
					if ($(this).val().indexOf('http://') != -1) {
						$.snackbar({ content: 'No URLs please!' });
						return;
					}

					var newStory = {
						title: $(this).val(),
						new: true
					};

					//Check if the story is not in our existing set of stories by title
					var filter = self.props.stories.filter(function (story) {
						return story.title == newStory.title;
					});

					if (filter.length > 0) {
						$.snackbar({ content: 'This gallery is already in that story!' });
						return;
					}

					self.props.addStory(newStory);

					$(this).typeahead('val', '');
				}
			});
		},

		render: function () {

			return React.createElement('input', {
				id: 'gallery-stories-input',
				type: 'text',
				className: 'form-control floating-label',
				placeholder: 'Stories',
				onChange: this.change,
				ref: 'story_input' });
		}

	});

	module.exports = StoriesAutoComplete;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3), Dropdown = __webpack_require__(10);

	/**
	 * Component for managing byline editing
	 * @param {object} gallery Gallery object to base byline representation off of
	 */

	var GalleryEditByline = React.createClass({

		displayName: 'GalleryEditByline',

		/**
	  * Renders byline field
	  * @description Three types of instances for the byline
	  */
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
						React.createElement(Dropdown, {
							options: [post.meta.twitter.handle, post.meta.twitter.user_name],
							selected: byline,
							onSelected: this.bylineSelected }),
						React.createElement(
							'div',
							{ className: 'split-cell' },
							React.createElement(
								'div',
								{ className: 'form-control-wrapper' },
								React.createElement('input', {
									type: 'text',
									className: 'form-control',
									defaultValue: post.meta.other_origin.affiliation,
									id: 'gallery-edit-affiliation' }),
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
									React.createElement('input', { type: 'text', className: 'form-control empty', defaultValue: name, id: 'gallery-edit-name' }),
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
									React.createElement('input', { type: 'text', className: 'form-control empty', defaultValue: affiliation, id: 'gallery-edit-affiliation' }),
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
				//If organically submitted content i.e. user submitted the gallery, can't change the byline
				else {
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

	module.exports = GalleryEditByline;

/***/ },
/* 24 */,
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/**
	 * Gallery Edit Foot component
	 * @description Contains all the interaction buttons
	 */

	var GalleryEditFoot = React.createClass({

		displayName: 'GalleryEditFoot',

		getInitialState: function () {
			return {
				gallery: this.props.gallery
			};
		},

		render: function () {

			var addMore = '';

			//Check if the gallery has been imported, to show the 'Add More' button or not
			if (this.state.gallery.imported) addMore = React.createElement(
				'button',
				{ id: 'gallery-add-more-button', type: 'button', onClick: this.addMore, className: 'btn btn-flat' },
				'Add More'
			);

			inputStyle = {
				display: 'none'
			};

			return React.createElement(
				'div',
				{ className: 'dialog-foot' },
				React.createElement('input', {
					id: 'gallery-upload-files',
					type: 'file',
					accept: 'image/*,video/*,video/mp4',
					multiple: true,
					ref: 'fileUpload',
					style: inputStyle,
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
					{ id: 'gallery-save-button', type: 'button', onClick: this.props.saveGallery, className: 'btn btn-flat pull-right' },
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
			gallery.files = [];

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
		delete: function () {

			var gallery = this.state.gallery;

			alertify.confirm("Are you sure you want to delete this gallery?", function (confirmed) {

				if (!confirmed) return;

				//Consturct params with gallery id
				var params = {
					id: gallery._id
				};

				//Send delete request
				$.ajax({
					url: "/scripts/gallery/remove",
					method: 'post',
					contentType: "application/json",
					data: params,
					dataType: 'json',
					success: function (result) {

						if (result.err) {
							return this.error(null, null, result.err);
						};

						location.href = document.referrer || '/highlights';
					},
					error: function (xhr, status, error) {
						$.snackbar({
							content: 'Couldn\'t successfully delete this gallery!'
						});
					}
				});
			}, this);
		}

	});

	module.exports = GalleryEditFoot;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(3);

	/** //

	Description : Column on the right of the detail post showing all the post's info

	// **/

	/**
	 * PostInfo parent object
	 */

	var PostInfo = React.createClass({

		displayName: 'PostInfo',

		render: function () {

			//Init needed vars to make list
			var post = this.props.post,
			    gallery = this.props.gallery,
			    userIcon = '',
			    twitter = '',
			    curator = '',
			    timeString = formatTime(this.props.post.time_created),
			    verifiedBy = this.props.verifier ? 'Verified by ' + this.props.verifier.firstname + ' ' + this.props.verifier.lastname : 'Not yet verified';

			//Check to show user icon
			if (this.props.post.owner) {
				userIcon = React.createElement(
					'div',
					null,
					React.createElement('img', {
						className: 'img-circle img-responsive',
						src: post.owner && post.owner.avatar ? post.owner.avatar : 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png' })
				);
			}

			//Check to show twitter item
			if (post.meta.twitter && post.meta.twitter.url) {
				var twitter = React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'mdi mdi-twitter icon' }),
					React.createElement(
						'a',
						{ href: '<%=post.meta.twitter.url%>', target: '_blank' },
						'See original'
					)
				);
			}

			//Check to show curator item
			if (gallery.curator) {
				var curator = React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'mdi mdi-account icon' }),
					this.props.gallery.curator.firstname + ' ' + this.props.gallery.curator.lastname
				);
			}

			return React.createElement(
				'div',
				{ className: 'col-xs-12 col-md-4 meta' },
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-xs-12 col-sm-7 col-md-12' },
						React.createElement(
							'div',
							{ className: 'meta-user' },
							userIcon,
							React.createElement(
								'div',
								null,
								React.createElement(
									'span',
									{ className: 'md-type-title' },
									post.meta.twitter ? post.meta.twitter.user_name : post.owner ? post.owner.firstname + ' ' + post.owner.lastname : ''
								),
								React.createElement(
									'span',
									{ className: 'md-type-body1' },
									this.props.post.affiliation
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'meta-description' },
							this.props.gallery.caption
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12 col-sm-5 col-md-12 meta-list' },
						React.createElement(
							'ul',
							{ className: 'md-type-subhead' },
							React.createElement(
								'li',
								null,
								React.createElement('span', { className: 'mdi mdi-clock icon' }),
								timeString
							),
							React.createElement(
								'li',
								null,
								React.createElement('span', { className: 'mdi mdi-map-marker icon' }),
								post.location.address || 'No Location'
							),
							twitter,
							React.createElement(
								'li',
								null,
								React.createElement('span', { className: 'mdi mdi-alert-circle icon' }),
								verifiedBy
							),
							curator
						)
					)
				)
			);
		}

	});

	module.exports = PostInfo;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2),
	    ReactDOM = __webpack_require__(3);

	/** //

	Description : Related posts at the bottom of the PostDetail view

	// **/

	/**
	 * PostRelated parent object
	 * @description Contains set of all other posts in the parent gallery
	 */

	var PostRelated = React.createClass({

		displayName: 'PostRelated',

		render: function () {

			if (this.props.gallery.posts && this.props.gallery.posts.length > 1) {

				var posts = this.props.gallery.posts.map(function (post, i) {

					return React.createElement('img', {
						className: 'img-link',
						src: formatImg(post.image, 'small'),
						key: i });
				});

				return React.createElement(
					'div',
					{ className: 'row related hidden-xs' },
					React.createElement(
						'div',
						{ className: 'tab-control' },
						React.createElement(
							'button',
							{ className: 'btn btn-flat toggled' },
							'More from this gallery'
						)
					),
					React.createElement(
						'div',
						{ className: 'tabs' },
						React.createElement(
							'div',
							{ className: 'tab toggled' },
							posts
						)
					)
				);
			} else return null;
		}

	});

	module.exports = PostRelated;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3), PurchaseAction = __webpack_require__(7), DownloadAction = __webpack_require__(8);

	/** //

	Description : Image of the PostDetail page, contains byline and actions

	// **/

	/**
	 * PostDetailImage parent object
	 */

	var PostDetailImage = React.createClass({

		displayName: 'PostDetailImage',

		render: function () {

			console.log(this.props);

			var actions = [],
			    postMedia = '';
			i = 0;

			//Check rank of user, if less than a CM
			if (this.props.user.rank < 1) {
				//config.RANKS_CONTENT_MANAGER

				//Check to make sure the user has an outlet
				if (this.props.user.outlet) {

					//Check if the post has been purchased
					if (this.props.purchases && this.props.purchases.indexOf(this.props.post._id) >= 0) {
						actions.push(React.createElement(DownloadAction, { post: this.props.post, key: i++ }));
					}
					//Check if the post is licensed
					else if (this.props.post.license == 1) {
							actions.push(React.createElement(PurchaseAction, { post: this.props.post, key: i++ }));
						}
				}
			}
			//We are of a rank higher than a content manager
			else {

					actions.push(React.createElement(DownloadAction, { post: this.props.post, key: i++ }));

					if (this.props.purchases && this.props.purchases.indexOf(this.props.post._id) == -1) {

						actions.push(React.createElement(PurchaseAction, { post: this.props.post, key: i++ }));
					}
				}

			if (this.props.post.video) {
				postMedia = React.createElement(
					'video',
					{ width: '100%', height: '100%', controls: true },
					React.createElement('source', { src: formatVideo(this.props.post.video), type: 'video/mp4' }),
					'Your browser does not support the video tag.'
				);
			} else {

				postMedia = React.createElement('img', { className: 'img-responsive', src: formatImg(this.props.post.image, 'large') });
			}

			return React.createElement(
				'div',
				{ className: 'col-xs-12 col-md-8' },
				React.createElement(
					'div',
					{ className: 'card panel' },
					React.createElement(
						'div',
						{ className: 'card-foot small' },
						actions,
						React.createElement(
							'span',
							{ className: 'md-type-body1' },
							this.props.post.byline
						)
					),
					React.createElement(
						'div',
						{ className: 'card-body' },
						postMedia
					)
				)
			);
		}

	});

	module.exports = PostDetailImage;

/***/ }
/******/ ]);