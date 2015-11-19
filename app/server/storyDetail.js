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
	    PostList = __webpack_require__(4),
	    StorySidebar = __webpack_require__(31),
	    StoryEdit = __webpack_require__(32),
	    App = __webpack_require__(11);

	/**
	 * Story Detail Parent Object, made of a side column and PostList
	 */

	var StoryDetail = React.createClass({

		displayName: 'StoryDetail',

		getDefaultProps: function () {
			return {
				story: {}
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
				React.createElement(StorySidebar, { Story: this.props.Story }),
				React.createElement(
					'div',
					{ className: 'col-sm-8 tall' },
					React.createElement(PostList, {
						rank: this.props.user.rank,
						purchases: this.props.purchases,
						posts: this.props.Story.posts,
						scrollable: false,
						editable: false,
						size: 'small' })
				),
				React.createElement(StoryEdit, {
					Story: this.props.Story,
					user: this.props.user })
			);
		}

	});

	if (isNode) {

		module.exports = StoryDetail;
	} else {

		ReactDOM.render(React.createElement(StoryDetail, {
			user: window.__initialProps__.user,
			purchases: window.__initialProps__.purchases,
			Story: window.__initialProps__.Story,
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	ReactDOM = __webpack_require__(3), SuggestionList = __webpack_require__(5);
	PostCell = __webpack_require__(6);

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

				self = this;

				//Set that we're loading
				this.setState({ loading: true });

				//Run load on parent call
				this.props.loadPosts(this.state.offset, function (posts) {

					if (!posts) return;

					console.log(self.state);

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
					size: this.props.size,
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
	ReactDOM = __webpack_require__(3), PurchaseAction = __webpack_require__(7), DownloadAction = __webpack_require__(8);

	/**
	 * Single Post Cell, child of PostList
	 */

	var PostCell = React.createClass({

		displayName: 'PostCell',

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
			var timeString = formatTime(this.props.post.time_created);
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

						actions.push(React.createElement(PurchaseAction, { post: this.post }));

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
							actions.push(React.createElement('span', { 'class': 'mdi mdi-cash icon pull-right', 'data-id': '\' + post._id + \'', key: key++ }));
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

		}

	});

	module.exports = PostCell;

/***/ },
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
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(3);

	/** //

	Description : Column on the left of the posts grid on the story detail page

	// **/

	/**
	 * Story sidebar parent object
	 */

	var StorySidebar = React.createClass({

		displayName: 'StorySidebar',

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
								{ className: 'meta-description', id: 'story-description' },
								this.props.story.caption
							),
							React.createElement(StoryStats, { story: this.props.story })
						)
					)
				)
			);
		}

	});

	/**
	 * Story stats inside the sidebar
	 */

	var StoryStats = React.createClass({

		displayName: 'StoryStats',

		render: function () {

			if (!this.props.story.stats) return;

			var photos = '';
			videos = '';

			if (this.props.story.stats.photos) {
				photos = React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'mdi mdi-file-image-box icon' }),
					this.props.story.stats.photos,
					'photos'
				);
			}
			if (this.props.story.stats.videos) {
				videos = React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'mdi mdi-movie icon' }),
					this.props.story.stats.videos + ' video'
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

	module.exports = StorySidebar;

/***/ },
/* 32 */
/***/ function(module, exports) {

	

/***/ }
/******/ ]);