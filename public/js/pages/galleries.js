webpackJsonp([4],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(356);


/***/ },

/***/ 281:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Generic Dropdown Element
	 * @param  {function} onSelected A function called wtih the user's selection
	 */

	var Dropdown = function (_React$Component) {
		_inherits(Dropdown, _React$Component);

		function Dropdown(props) {
			_classCallCheck(this, Dropdown);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Dropdown).call(this, props));

			_this.state = {
				selected: _this.props.selected
			};

			_this.toggle = _this.toggle.bind(_this);
			_this.optionClicked = _this.optionClicked.bind(_this);
			return _this;
		}

		_createClass(Dropdown, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var _this2 = this;

				//Click event for outside clicking
				$(document).click(function (e) {
					//Check that the click is out of bounds
					if ($(e.target).parents('.nav-dropdown').size() == 0 && e.target !== _this2.refs.drop) {
						//Check if it's active first
						if (_this2.refs.drop.className.indexOf('active') > 0) {
							//Reset toggle
							_this2.toggle();
						}
					}
				});
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				//Clean up click event on unmount
				$(document).unbind('click');
			}
		}, {
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(nextProps) {
				if (nextProps.selected !== this.props.selected) {
					this.setState({
						selected: nextProps.selected
					});
				}
			}

			/**
	   * Called whenever the master button is clicked
	   */

		}, {
			key: 'toggle',
			value: function toggle() {
				var drop = this.refs.drop,
				    menuIcon = this.refs['button'].refs['menu-icon'];

				if (drop.className.indexOf('active') == -1) {
					menuIcon.className = 'mdi ';
					menuIcon.className += this.props.reverseCaretDirection ? 'mdi-menu-down' : 'mdi-menu-up';
					drop.className += ' active';
				} else {
					menuIcon.className = 'mdi ';
					menuIcon.className += this.props.reverseCaretDirection ? 'mdi-menu-up' : 'mdi-menu-down';
					drop.className = drop.className.replace(/\bactive\b/, '');
				}

				if (this.props.onToggled) this.props.onToggled();
			}

			/**
	   * Called whenever an option is selected from the dropdown
	   */

		}, {
			key: 'optionClicked',
			value: function optionClicked(e) {
				//Get the span tag from the list item
				var selected = e.currentTarget.getElementsByTagName('span')[0].innerHTML;

				//If the user chose the already selected option, don't do anything
				if (this.state.selected == selected) {
					this.hideDropdown();
					return;
				}

				this.setState({
					selected: selected
				});

				this.toggle();

				if (this.props.onSelected) {
					this.props.onSelected(selected);
				}
			}
		}, {
			key: 'render',
			value: function render() {
				var _this3 = this;

				var list = '',
				    dropdownButton = '';

				//If options are passed, use those
				if (this.props.options) {
					var options = this.props.options.map(function (option, i) {
						return _react2.default.createElement(
							'li',
							{
								className: option === _this3.state.selected ? 'active' : '',
								key: i,
								onClick: _this3.optionClicked },
							_react2.default.createElement(
								'span',
								null,
								option
							)
						);
					});

					list = _react2.default.createElement(
						'ul',
						{ className: 'list' },
						options
					);
				}

				dropdownButton = _react2.default.createElement(
					DropdownButton,
					{
						ref: 'button',
						toggle: this.toggle,
						selected: this.props.title || this.state.selected,
						reverseCaretDirection: this.props.reverseCaretDirection },
					this.props.dropdownActions
				);

				var className = this.props.inList ? 'nav-dropdown pull-right' : 'nav-dropdown';

				if (this.props.dropdownClass) className += ' ' + this.props.dropdownClass;

				return _react2.default.createElement(
					'div',
					{ className: className, ref: 'drop' },
					dropdownButton,
					_react2.default.createElement(
						'div',
						{ className: 'dropdown-body' },
						list,
						this.props.children
					)
				);
			}
		}]);

		return Dropdown;
	}(_react2.default.Component);

	exports.default = Dropdown;

	var DropdownButton = function (_React$Component2) {
		_inherits(DropdownButton, _React$Component2);

		function DropdownButton(props) {
			_classCallCheck(this, DropdownButton);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(DropdownButton).call(this, props));
		}

		_createClass(DropdownButton, [{
			key: 'render',
			value: function render() {

				return _react2.default.createElement(
					'div',
					{ className: 'toggle', onClick: this.props.toggle },
					_react2.default.createElement(
						'span',
						null,
						this.props.selected
					),
					_react2.default.createElement('span', { className: "mdi " + (this.props.reverseCaretDirection ? "mdi-menu-up" : "mdi-menu-down"), ref: 'menu-icon' }),
					this.props.children
				);
			}
		}]);

		return DropdownButton;
	}(_react2.default.Component);

	Dropdown.defaultProps = {
		reverseCaretDirection: false,
		inList: false,
		onToggled: function onToggled() {}
	};

/***/ },

/***/ 309:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _frescoImage = __webpack_require__(310);

	var _frescoImage2 = _interopRequireDefault(_frescoImage);

	var _global = __webpack_require__(175);

	var _global2 = _interopRequireDefault(_global);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Autocomplete component
	 */

	var FrescoAutocomplete = function (_React$Component) {
	    _inherits(FrescoAutocomplete, _React$Component);

	    function FrescoAutocomplete(props) {
	        _classCallCheck(this, FrescoAutocomplete);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FrescoAutocomplete).call(this, props));

	        _this.state = {
	            inputText: _this.props.inputText,
	            predictions: []
	        };

	        //Instantiate Google Maps services
	        _this.geocoder = new google.maps.Geocoder();
	        _this.autoCompleteService = new google.maps.places.AutocompleteService();
	        _this.placesService = new google.maps.places.PlacesService(document.createElement('span'));

	        _this.predictionSelected = _this.predictionSelected.bind(_this);
	        _this.inputChanged = _this.inputChanged.bind(_this);
	        _this.calculateCrossStreets = _this.calculateCrossStreets.bind(_this);
	        return _this;
	    }

	    _createClass(FrescoAutocomplete, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            var _this2 = this;

	            if (this.props.inputText) {
	                this.refs.inputField.value = this.props.inputText;
	            }

	            //Click event for outside clicking
	            $(document).click(function (e) {
	                if ($(e.target).parents('.autocomplete').size() == 0 && e.target !== _this2.refs.autocompleteWrap) {
	                    //Reset predictions for cleanup
	                    _this2.setState({
	                        predictions: [],
	                        active: false
	                    });
	                }
	            });
	        }
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	            //Clean up click event on unmount
	            $(document).unbind('click');
	        }
	    }, {
	        key: 'componentWillReceiveProps',
	        value: function componentWillReceiveProps(nextProps) {
	            //Check if the passed input text has changed
	            if (nextProps.inputText !== null) {
	                if (nextProps.inputText !== this.state.inputText) {
	                    this.refs.inputField.value = nextProps.inputText;

	                    //Reset predictions for cleanup
	                    this.setState({
	                        predictions: [],
	                        active: false
	                    });
	                }
	            }
	        }

	        /**
	         * Input event handler
	         */

	    }, {
	        key: 'inputChanged',
	        value: function inputChanged(e) {
	            var _this3 = this;

	            var field = this.refs.inputField,
	                query = field.value;

	            if (query == '' || query == null) {
	                return this.setState({
	                    predictions: [],
	                    active: false
	                });
	            }

	            this.setState({
	                active: true
	            });

	            var params = { input: query };

	            this.autoCompleteService.getPlacePredictions(params, function (predictions, status) {
	                if (status === google.maps.GeocoderStatus.OK && typeof predictions !== 'undefined') {
	                    _this3.setState({
	                        predictions: predictions
	                    });
	                } else {
	                    //Calculate cross streets if no suggestions from google maps
	                    return _this3.calculateCrossStreets(query);
	                }
	            });
	        }

	        /**
	         * Calculates cross street in area using geocoder, called if no results from place suggestions
	         */

	    }, {
	        key: 'calculateCrossStreets',
	        value: function calculateCrossStreets(query) {
	            var _this4 = this;

	            var params = { address: query };

	            if (this.props.bounds) {
	                params.bounds = this.props.bounds;
	            }

	            this.geocoder.geocode(params, function (predictions, status) {
	                if (status === google.maps.GeocoderStatus.OK && predictions[0]) {
	                    _this4.setState({
	                        predictions: predictions
	                    });
	                } else {
	                    _this4.setState({
	                        predictions: []
	                    });
	                }
	            });
	        }

	        /**
	         * OnClick for selecting a prediction from the list
	         */

	    }, {
	        key: 'predictionSelected',
	        value: function predictionSelected(prediction) {
	            var self = this;

	            if (typeof prediction.geometry === 'undefined') {
	                this.placesService.getDetails({
	                    reference: prediction.reference
	                }, function (details, status) {
	                    //Inherit description from initial object
	                    details.description = prediction.description;

	                    //Set prediciton to details result
	                    prediction = details;

	                    updateAssignment();
	                });
	            } else {
	                updateAssignment();
	            }

	            function updateAssignment() {
	                var location = {
	                    lat: prediction.geometry.location.lat(),
	                    lng: prediction.geometry.location.lng()
	                };

	                self.setState({
	                    predictions: [],
	                    active: false
	                });

	                self.props.updateAutocompleteData({
	                    prediction: prediction,
	                    location: location,
	                    address: prediction.description || prediction.formatted_address
	                });
	            }
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            var _this5 = this;

	            var predictionsDropdown = '',
	                autocompleteClass = '';

	            if (this.state.predictions.length !== 0) {
	                var predictions = this.state.predictions.map(function (prediction, i) {
	                    var text = '';

	                    if (typeof prediction.description !== 'undefined') {
	                        text = prediction.description;
	                    } else if (typeof prediction.formatted_address !== 'undefined') {
	                        text = prediction.formatted_address;
	                    }

	                    return _react2.default.createElement(
	                        'li',
	                        { onClick: _this5.predictionSelected.bind(_this5, prediction),
	                            key: i },
	                        _react2.default.createElement(
	                            'p',
	                            null,
	                            text
	                        )
	                    );
	                });

	                predictionsDropdown = _react2.default.createElement(
	                    'ul',
	                    { className: 'predictions' },
	                    predictions
	                );
	            }

	            autocompleteClass = 'autocomplete ' + this.props.class;

	            if (this.state.active && this.props.transition) {
	                autocompleteClass += ' active';
	            }

	            return _react2.default.createElement(
	                'div',
	                { className: autocompleteClass, ref: 'autocompleteWrap' },
	                _react2.default.createElement(
	                    'div',
	                    { 'class': 'form-control-wrapper' },
	                    _react2.default.createElement('input', {
	                        ref: 'inputField',
	                        type: 'text',
	                        className: this.props.inputClass,
	                        onChange: this.inputChanged,
	                        disabled: this.props.disabled,
	                        placeholder: 'Location' }),
	                    _react2.default.createElement('span', { className: 'material-input' })
	                ),
	                predictionsDropdown
	            );
	        }
	    }]);

	    return FrescoAutocomplete;
	}(_react2.default.Component);

	exports.default = FrescoAutocomplete;


	FrescoAutocomplete.defaultProps = {
	    updateAutocompleteData: function updateAutocompleteData() {},
	    transition: true,
	    class: '',
	    inputClass: ''
	};

/***/ },

/***/ 310:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _global = __webpack_require__(175);

	var _global2 = _interopRequireDefault(_global);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Stateless image that manages an image error handler
	 */

	var FrescoImage = function (_React$Component) {
		_inherits(FrescoImage, _React$Component);

		function FrescoImage(props) {
			_classCallCheck(this, FrescoImage);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(FrescoImage).call(this, props));
		}

		_createClass(FrescoImage, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var _this2 = this;

				var size = this.props.size,
				    img = this.refs.image;

				img.onerror = function () {
					var timeout = parseInt(img.getAttribute('data-t') || 1),
					    lastTimeout = parseInt(img.getAttribute('data-lt') || 1),
					    image = 'https://d2j1l98c0ybckw.cloudfront.net/images/' + size + '/missing.png';

					img.setAttribute('data-lt', timeout);
					img.setAttribute('data-t', timeout + lastTimeout);
					img.setAttribute('data-src', img.getAttribute('src'));
					img.setAttribute('src', 'https://d2j1l98c0ybckw.cloudfront.net/images/' + size + '/missing.png');

					setTimeout(function () {

						img.setAttribute('src', img.getAttribute('data-src'));
					}, timeout * 1000);

					if (_this2.props.updateImage) _this2.props.updateImage(image);
				};
			}
		}, {
			key: 'render',
			value: function render() {
				var imageClass = this.props.imageClass || 'img-cover';

				return _react2.default.createElement(
					'div',
					{ className: 'img' },
					_react2.default.createElement('img', {
						className: imageClass,
						ref: 'image',
						'data-src': _global2.default.formatImg(this.props.image, this.props.size),
						src: _global2.default.formatImg(this.props.image, this.props.size) })
				);
			}
		}]);

		return FrescoImage;
	}(_react2.default.Component);

	exports.default = FrescoImage;


	FrescoImage.defaultProps = {
		size: 'small',
		updateImage: function updateImage() {}
	};

/***/ },

/***/ 336:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _global = __webpack_require__(175);

	var _global2 = _interopRequireDefault(_global);

	var _dropdown = __webpack_require__(281);

	var _dropdown2 = _interopRequireDefault(_dropdown);

	var _radioGroup = __webpack_require__(337);

	var _radioGroup2 = _interopRequireDefault(_radioGroup);

	var _frescoAutocomplete = __webpack_require__(309);

	var _frescoAutocomplete2 = _interopRequireDefault(_frescoAutocomplete);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/** //

	Description : Top Bar for pages of the site
	The component takes optional toggles/pieces as props, and each prop is checked in the render.
	If the prop exists, then the repsective toggle/dropdown/edit/whatever is added to the navigation bar

	// **/

	var TopBar = function (_React$Component) {
		_inherits(TopBar, _React$Component);

		function TopBar(props) {
			_classCallCheck(this, TopBar);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TopBar).call(this, props));

			_this.goLink = _this.goLink.bind(_this);
			_this.toggleDrawer = _this.toggleDrawer.bind(_this);
			_this.timeToggleSelected = _this.timeToggleSelected.bind(_this);
			_this.verifiedToggleSelected = _this.verifiedToggleSelected.bind(_this);
			_this.chronToggleSelected = _this.chronToggleSelected.bind(_this);
			_this.autocompleteUpdated = _this.autocompleteUpdated.bind(_this);
			return _this;
		}

		/**
	  * Prop function called from `FrescoAutocomplete` for getting autocomplete date
	  */


		_createClass(TopBar, [{
			key: 'autocompleteUpdated',
			value: function autocompleteUpdated(autocompleteData) {
				//Update the position to the parent component
				this.props.updateMapPlace(autocompleteData.prediction);
			}

			/**
	   * Toggles the sidebar from hidden to showing
	   */

		}, {
			key: 'toggleDrawer',
			value: function toggleDrawer() {
				var sidebar = document.getElementById('_sidebar'),
				    toggler = document.getElementById('_toggler');

				if (sidebar.className.indexOf('toggled') > -1) {
					//Remove toggled class
					$(sidebar).removeClass('toggled');
					$(toggler).removeClass('toggled');
				} else {
					//Add toggled class
					sidebar.className += ' toggled';
					toggler.className += ' toggled';
				}
			}

			// Called when has link prop.

		}, {
			key: 'goLink',
			value: function goLink() {
				window.location = this.props.link;
			}

			//Called when the user selects a time format

		}, {
			key: 'timeToggleSelected',
			value: function timeToggleSelected(selected) {
				if (selected == 'Absolute time') {
					_global2.default.setTimeDisplayType('absolute');
				} else if (selected == 'Relative time') {
					_global2.default.setTimeDisplayType('relative');
				}
			}

			//Called when the user selects a time format

		}, {
			key: 'verifiedToggleSelected',
			value: function verifiedToggleSelected(selected) {
				this.props.onVerifiedToggled(selected == 'Verified');
			}

			//Called when the user selects a time format

		}, {
			key: 'chronToggleSelected',
			value: function chronToggleSelected(selected) {
				selected = selected.toLowerCase();

				if (selected == 'by capture time') {
					this.props.updateSort('captured');
				} else if (selected == 'by upload time') {
					this.props.updateSort('upload');
				}
			}
		}, {
			key: 'render',
			value: function render() {
				var _this2 = this;

				var edit = '',
				    topbarItems = [],
				    locationInput = '',
				    saveButton = '',
				    title = '';

				if (this.props.title) {
					title = _react2.default.createElement(
						'h1',
						{ className: 'md-type-title' },
						this.props.title
					);
				}

				if (this.props.saveButton) {
					saveButton = _react2.default.createElement(
						'a',
						{
							onClick: this.props.updateSettings,
							className: 'mdi mdi-content-save icon pull-right hidden-xs' },
						_react2.default.createElement('div', { className: 'ripple-wrapper' })
					);
				}

				if (this.props.locationInput) {
					var text = '';

					if (this.props.mapPlace) {
						text = this.props.mapPlace.description || this.props.mapPlace.formatted_address;
					}

					locationInput = _react2.default.createElement(_frescoAutocomplete2.default, {
						'class': 'nav',
						inputText: text,
						bounds: this.props.bounds,
						updateAutocompleteData: this.autocompleteUpdated });
				}

				if (this.props.editable) {
					var className = "mdi icon pull-right hidden-xs toggle-edit toggler";

					if (this.props.editIcon) className += " " + this.props.editIcon;else className += " mdi-pencil";

					topbarItems.push(_react2.default.createElement('a', { className: className,
						key: 'edit',
						onClick: this.props.edit }));
				}

				// If showing both the capture type and time type toggles, put the time
				// type toggle into the dropdown for capture time. Otherwise, display
				// it separately.
				if (this.props.chronToggle) {
					var timeToggle = null;

					if (this.props.timeToggle) {
						timeToggle = _react2.default.createElement(_radioGroup2.default, {
							options: ['Relative time', 'Absolute time'],
							selected: 'Relative time',
							onSelected: this.timeToggleSelected,
							name: 'timeToggle' });
					}
					topbarItems.push(_react2.default.createElement(
						_dropdown2.default,
						{
							options: ['By capture time', 'By upload time'],
							selected: 'By upload time',
							onSelected: this.chronToggleSelected,
							key: 'chronToggle',
							inList: true },
						timeToggle
					));
				}

				if (this.props.verifiedToggle && this.props.rank > _global2.default.RANKS.BASIC) {
					topbarItems.push(_react2.default.createElement(_dropdown2.default, {
						options: ['All content', 'Verified'],
						selected: this.props.defaultVerified == 'all' ? 'All content' : 'Verified',
						onSelected: this.verifiedToggleSelected,
						key: 'verifiedToggle',
						inList: true }));
				}

				if (this.props.tabs) {
					var tabContent = [];

					this.props.tabs.map(function (tab, i) {

						var buttonClass = "btn btn-flat vault " + tab.toLowerCase() + "-toggler" + (_this2.props.activeTab == tab ? ' toggled' : '');

						tabContent.push(_react2.default.createElement(
							'button',
							{
								className: buttonClass,
								onClick: _this2.props.setActiveTab.bind(null, tab),
								key: tab.toLowerCase() },
							tab,
							_react2.default.createElement('div', { className: 'ripple-wrapper' })
						));
					});

					var tabs = _react2.default.createElement(
						'div',
						{ className: 'tab-control' },
						tabContent
					);
				}

				return _react2.default.createElement(
					'nav',
					{ className: 'navbar navbar-fixed-top navbar-default' },
					_react2.default.createElement('div', { className: 'dim toggle-drop toggler', id: '_toggler', onClick: this.toggleDrawer }),
					_react2.default.createElement(
						'button',
						{ type: 'button', className: 'icon-button toggle-drawer toggler hidden-lg', onClick: this.toggleDrawer },
						_react2.default.createElement('span', { className: 'mdi mdi-menu icon' })
					),
					_react2.default.createElement('div', { className: 'spacer' }),
					title,
					locationInput,
					tabs,
					topbarItems,
					this.props.children,
					saveButton
				);
			}
		}]);

		return TopBar;
	}(_react2.default.Component);

	exports.default = TopBar;


	TopBar.defaultProps = {
		title: '',
		edit: function edit() {},
		hide: function hide() {
			console.log('Hide function not implemented in TopBar');
		},
		onVerifiedToggled: function onVerifiedToggled() {},
		onOutletFilterAdd: function onOutletFilterAdd() {},
		onOutletFilterRemove: function onOutletFilterRemove() {}
	};

/***/ },

/***/ 337:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Generic group of (styled) radio buttons
	 * @param {function} onSelected  A function called with the user's selection
	 * @param {Array}    options     The options that are available to select from
	 * @param {string}   name        The name to give the radio button controls
	 * @param {string}   selected    The pre-selected option (if any)
	 */

	var RadioGroup = function (_React$Component) {
	    _inherits(RadioGroup, _React$Component);

	    function RadioGroup(props) {
	        _classCallCheck(this, RadioGroup);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RadioGroup).call(this, props));

	        _this.state = {
	            selected: _this.props.selected
	        };

	        _this.optionClicked = _this.optionClicked.bind(_this);
	        return _this;
	    }

	    _createClass(RadioGroup, [{
	        key: "componentDidUpdate",
	        value: function componentDidUpdate(prevProps, prevState) {
	            if (prevProps.selected != this.props.selected) {
	                this.setState({
	                    selected: this.props.selected
	                });
	            }
	        }
	    }, {
	        key: "optionClicked",
	        value: function optionClicked(e) {
	            var selected = e.currentTarget.dataset.value;

	            // Ignore if option was already selected
	            if (this.state.selected == selected) {
	                return;
	            }

	            this.setState({
	                selected: selected
	            });

	            if (this.props.onSelected) {
	                this.props.onSelected(selected);
	            }
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var radioButtons = [];

	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = this.props.options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var option = _step.value;

	                    radioButtons.push(_react2.default.createElement(
	                        "li",
	                        { className: "radio", key: option, "data-value": option, onClick: this.optionClicked },
	                        _react2.default.createElement(
	                            "label",
	                            null,
	                            _react2.default.createElement("input", {
	                                type: "radio",
	                                name: this.props.name,
	                                value: option,
	                                "data-value": option,
	                                checked: option === this.state.selected,
	                                readOnly: true }),
	                            _react2.default.createElement(
	                                "div",
	                                { className: "radio-label" },
	                                option
	                            )
	                        )
	                    ));
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            return _react2.default.createElement(
	                "div",
	                { className: "list" },
	                _react2.default.createElement(
	                    "li",
	                    { className: "header" },
	                    "Display:"
	                ),
	                radioButtons
	            );
	        }
	    }]);

	    return RadioGroup;
	}(_react2.default.Component);

	exports.default = RadioGroup;


	RadioGroup.defaultProps = {
	    onSelected: function onSelected() {},
	    name: 'FACADE5'
	};

/***/ },

/***/ 356:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(34);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _app = __webpack_require__(173);

	var _app2 = _interopRequireDefault(_app);

	var _galleryList = __webpack_require__(357);

	var _galleryList2 = _interopRequireDefault(_galleryList);

	var _topbar = __webpack_require__(336);

	var _topbar2 = _interopRequireDefault(_topbar);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Galleries Parent Object (composed of GalleryList and Navbar) 
	 * Half = False, to render at large size instead of half size
	 */

	var Galleries = function (_React$Component) {
	  _inherits(Galleries, _React$Component);

	  function Galleries(props) {
	    _classCallCheck(this, Galleries);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Galleries).call(this, props));

	    _this.state = {
	      verifiedToggle: true
	    };
	    _this.onVerifiedToggled = _this.onVerifiedToggled.bind(_this);
	    return _this;
	  }

	  _createClass(Galleries, [{
	    key: 'onVerifiedToggled',
	    value: function onVerifiedToggled(toggle) {
	      this.setState({
	        verifiedToggle: toggle
	      });
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        _app2.default,
	        { user: this.props.user },
	        _react2.default.createElement(_topbar2.default, {
	          title: 'Galleries',
	          timeToggle: true,
	          rank: this.props.user.rank,
	          verifiedToggle: true,
	          updateSort: this.updateSort,
	          onVerifiedToggled: this.onVerifiedToggled }),
	        _react2.default.createElement(_galleryList2.default, {
	          withList: false,
	          highlighted: false,
	          onlyVerified: this.state.verifiedToggle })
	      );
	    }
	  }]);

	  return Galleries;
	}(_react2.default.Component);

	_reactDom2.default.render(_react2.default.createElement(Galleries, {
	  user: window.__initialProps__.user }), document.getElementById('app'));

/***/ },

/***/ 357:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _suggestionList = __webpack_require__(358);

	var _suggestionList2 = _interopRequireDefault(_suggestionList);

	var _galleryCell = __webpack_require__(359);

	var _galleryCell2 = _interopRequireDefault(_galleryCell);

	var _global = __webpack_require__(175);

	var _global2 = _interopRequireDefault(_global);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/** //

	Description : List for a gallery used across the site (/highlights, /content/galleries, etc.)

	// **/

	/**
	 * Gallery List Parent Object 
	 */

	var GalleryList = function (_React$Component) {
		_inherits(GalleryList, _React$Component);

		function GalleryList(props) {
			_classCallCheck(this, GalleryList);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GalleryList).call(this, props));

			_this.state = {
				galleries: [],
				offset: 0,
				loading: false,
				tags: []
			};

			_this.loadGalleries = _this.loadGalleries.bind(_this);
			_this.loadInitalGalleries = _this.loadInitalGalleries.bind(_this);
			_this.scroll = _this.scroll.bind(_this);
			return _this;
		}

		_createClass(GalleryList, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.loadInitalGalleries();
			}
		}, {
			key: 'componentDidUpdate',
			value: function componentDidUpdate(prevProps, prevState) {
				if (prevProps.onlyVerified !== this.props.onlyVerified) {
					this.setState({
						galleries: []
					});

					this.loadInitalGalleries();

					this.refs.grid.scrollTop = 0;
				}
			}
		}, {
			key: 'loadInitalGalleries',
			value: function loadInitalGalleries() {
				var _this2 = this;

				this.loadGalleries(0, function (galleries) {
					var offset = galleries ? galleries.length : 0;

					//Set galleries from successful response
					_this2.setState({
						galleries: galleries,
						offset: offset
					});
				});
			}

			//Returns array of galleries with offset and callback

		}, {
			key: 'loadGalleries',
			value: function loadGalleries(passedOffset, callback) {
				var endpoint,
				    params = {
					limit: 20,
					offset: passedOffset,
					sort: this.props.sort
				};

				if (this.props.highlighted) {
					endpoint = 'gallery/highlights';

					params.invalidate = 1;
				} else {
					endpoint = 'gallery/list';

					if (this.props.onlyVerified) params.verified = true;
				}

				$.ajax({
					url: '/api/' + endpoint,
					type: 'GET',
					data: params,
					dataType: 'json',
					success: function success(response, status, xhr) {

						//Do nothing, because of bad response
						if (!response.data || response.err) callback([]);else callback(response.data);
					},
					error: function error(xhr, status, _error) {
						$.snackbar({ content: _global2.default.resolveError(_error) });
					}

				});
			}

			//Scroll listener for main window

		}, {
			key: 'scroll',
			value: function scroll(e) {
				var _this3 = this;

				var grid = e.target;

				if (!this.state.loading && grid.scrollTop > grid.scrollHeight - grid.offsetHeight - 400) {

					this.setState({
						loading: true
					});

					this.loadGalleries(this.state.offset, function (galleries) {

						if (!galleries) return;

						var offset = _this3.state.galleries.length + galleries.length;

						//Set galleries from successful response
						_this3.setState({
							galleries: _this3.state.galleries.concat(galleries),
							offset: offset,
							loading: false
						});
					});
				}
			}
		}, {
			key: 'render',
			value: function render() {
				var half = !this.props.withList;

				//Save all the galleries
				var galleries = _react2.default.createElement(
					'div',
					{ className: 'row tiles' },
					this.state.galleries.map(function (gallery, i) {
						return _react2.default.createElement(_galleryCell2.default, { gallery: gallery, half: half, key: i });
					})
				);

				//Check if a list is needed
				if (!half) {
					return _react2.default.createElement(
						'div',
						{
							className: 'container-fluid grid',
							onScroll: this.scroll,
							ref: 'grid' },
						_react2.default.createElement(
							'div',
							{ className: 'col-md-8' },
							galleries
						),
						_react2.default.createElement(_suggestionList2.default, null)
					);
				}
				//No list needed
				else {

						return _react2.default.createElement(
							'div',
							{
								className: 'container-fluid grid',
								onScroll: this.scroll,
								ref: 'grid'
							},
							galleries
						);
					}
			}
		}]);

		return GalleryList;
	}(_react2.default.Component);

	exports.default = GalleryList;


	GalleryList.defaultProps = {
		onlyVerified: true
	};

/***/ },

/***/ 358:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _global = __webpack_require__(175);

	var _global2 = _interopRequireDefault(_global);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/** //

	Description : Suggestion Column

	// **/

	/**
	 * Suggestion List Parent Object
	 */

	var SuggestionList = function (_React$Component) {
		_inherits(SuggestionList, _React$Component);

		function SuggestionList(props) {
			_classCallCheck(this, SuggestionList);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SuggestionList).call(this, props));

			_this.state = {
				stories: []
			};
			return _this;
		}

		_createClass(SuggestionList, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var _this2 = this;

				$.ajax({
					url: '/api/story/recent',
					type: 'GET',
					data: {
						limit: 8
					},
					dataType: 'json',
					success: function success(response, status, xhr) {

						//Do nothing, because of bad response
						if (!response.data || response.err) return;

						//Set galleries from successful response
						_this2.setState({
							stories: response.data
						});
					},
					error: function error(xhr, status, _error) {
						$.snackbar({ content: resolveError(_error) });
					}
				});
			}
		}, {
			key: 'render',
			value: function render() {

				return _react2.default.createElement(
					'div',
					{ className: 'col-md-4' },
					_react2.default.createElement(
						'h3',
						{ className: 'md-type-button md-type-black-secondary' },
						'Recently Updated Stories'
					),
					_react2.default.createElement(
						'ul',
						{ className: 'md-type-subhead trending-stories' },
						this.state.stories.map(function (story, i) {
							return _react2.default.createElement(
								'li',
								{ key: i },
								_react2.default.createElement(
									'a',
									{ href: '/story/' + story._id },
									story.title
								)
							);
						})
					)
				);
			}
		}]);

		return SuggestionList;
	}(_react2.default.Component);

	exports.default = SuggestionList;

/***/ },

/***/ 359:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _frescoBackgroundImage = __webpack_require__(360);

	var _frescoBackgroundImage2 = _interopRequireDefault(_frescoBackgroundImage);

	var _global = __webpack_require__(175);

	var _global2 = _interopRequireDefault(_global);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Single Gallery Cell, child of GalleryList
	 */

	var GalleryCell = function (_React$Component) {
		_inherits(GalleryCell, _React$Component);

		function GalleryCell(props) {
			_classCallCheck(this, GalleryCell);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(GalleryCell).call(this, props));
		}

		_createClass(GalleryCell, [{
			key: 'render',
			value: function render() {

				var timestamp = this.props.gallery.time_created,
				    timeString = _global2.default.formatTime(this.props.gallery.time_created),
				    size = this.props.half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6',
				    location = 'No Location',
				    stories = this.props.gallery.related_stories.slice(0, 2),
				    galleryCellStories = stories.length > 0 ? _react2.default.createElement(GalleryCellStories, { stories: stories }) : '';

				for (var i = 0; i < this.props.gallery.posts.length; i++) {
					if (!this.props.gallery.posts[i].location) continue;

					if (this.props.gallery.posts[i].location.address) {
						location = this.props.gallery.posts[i].location.address;
					}
				}

				return _react2.default.createElement(
					'div',
					{ className: size + " tile story gallery" },
					_react2.default.createElement('div', { className: 'frame' }),
					_react2.default.createElement(
						'div',
						{ className: 'tile-body' },
						_react2.default.createElement(
							'div',
							{ className: 'hover' },
							_react2.default.createElement(
								'a',
								{ href: "/gallery/" + this.props.gallery._id },
								_react2.default.createElement(
									'p',
									{ className: 'md-type-body1' },
									this.props.gallery.caption
								)
							),
							galleryCellStories
						),
						_react2.default.createElement(GalleryCellImages, { posts: this.props.gallery.posts })
					),
					_react2.default.createElement(
						'div',
						{ className: 'tile-foot' },
						_react2.default.createElement(
							'div',
							{ className: 'hover' },
							_react2.default.createElement(
								'a',
								{ href: "/gallery/" + this.props.gallery._id, className: 'md-type-body2' },
								'See all'
							),
							_react2.default.createElement(GalleryCellStats, { stats: this.props.gallery.stats })
						),
						_react2.default.createElement(
							'div',
							null,
							_react2.default.createElement(
								'div',
								{ className: 'ellipses' },
								_react2.default.createElement(
									'span',
									{ className: 'md-type-body2' },
									location
								),
								_react2.default.createElement(
									'span',
									{
										className: 'md-type-caption timestring',
										'data-timestamp': this.props.gallery.time_created },
									timeString
								)
							)
						)
					)
				);
			}
		}]);

		return GalleryCell;
	}(_react2.default.Component);

	exports.default = GalleryCell;


	GalleryCell.defaultProps = {
		//Size of the cell
		half: false
	};

	/**
	 * Gallery Cell Stories List
	 */

	var GalleryCellStories = function (_React$Component2) {
		_inherits(GalleryCellStories, _React$Component2);

		function GalleryCellStories() {
			_classCallCheck(this, GalleryCellStories);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(GalleryCellStories).apply(this, arguments));
		}

		_createClass(GalleryCellStories, [{
			key: 'render',
			value: function render() {

				var stories = this.props.stories.map(function (story, i) {
					return _react2.default.createElement(
						'li',
						{ key: i },
						_react2.default.createElement(
							'a',
							{ href: "/story/" + story._id },
							story.title
						)
					);
				});

				return _react2.default.createElement(
					'ul',
					{ className: 'md-type-body2 story-list cell-stories' },
					stories
				);
			}
		}]);

		return GalleryCellStories;
	}(_react2.default.Component);

	/**
	 * Gallery Cell Images
	 */

	var GalleryCellImages = function (_React$Component3) {
		_inherits(GalleryCellImages, _React$Component3);

		function GalleryCellImages() {
			_classCallCheck(this, GalleryCellImages);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(GalleryCellImages).apply(this, arguments));
		}

		_createClass(GalleryCellImages, [{
			key: 'render',
			value: function render() {

				if (!this.props.posts || this.props.posts.length == 0) {

					return _react2.default.createElement('div', { className: 'flex-row' });
				} else if (this.props.posts.length == 1) {

					return _react2.default.createElement(
						'div',
						{ className: 'flex-row' },
						_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[0].image, size: 'medium' })
					);
				} else if (this.props.posts.length < 5) {

					return _react2.default.createElement(
						'div',
						{ className: 'flex-row' },
						_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[0].image, size: 'small' }),
						_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[1].image, size: 'small' })
					);
				} else if (this.props.posts.length >= 5 && this.props.posts.length < 8) {

					return _react2.default.createElement(
						'div',
						{ className: 'flex-row' },
						_react2.default.createElement(
							'div',
							{ className: 'flex-col' },
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[0].image, size: 'small' })
						),
						_react2.default.createElement(
							'div',
							{ className: 'flex-col' },
							_react2.default.createElement(
								'div',
								{ className: 'flex-row' },
								_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[1].image, size: 'small' }),
								_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[2].image, size: 'small' })
							),
							_react2.default.createElement(
								'div',
								{ className: 'flex-row' },
								_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[3].image, size: 'small' }),
								_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[4].image, size: 'small' })
							)
						)
					);
				} else if (this.props.posts.length >= 8) {

					return _react2.default.createElement(
						'div',
						{ className: 'flex-col' },
						_react2.default.createElement(
							'div',
							{ className: 'flex-row' },
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[0].image, size: 'small' }),
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[1].image, size: 'small' }),
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[4].image, size: 'small' }),
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[3].image, size: 'small' })
						),
						_react2.default.createElement(
							'div',
							{ className: 'flex-row' },
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[4].image, size: 'small' }),
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[5].image, size: 'small' }),
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[6].image, size: 'small' }),
							_react2.default.createElement(_frescoBackgroundImage2.default, { image: this.props.posts[7].image, size: 'small' })
						)
					);
				}
			}
		}]);

		return GalleryCellImages;
	}(_react2.default.Component);

	var GalleryCellStats = function (_React$Component4) {
		_inherits(GalleryCellStats, _React$Component4);

		function GalleryCellStats() {
			_classCallCheck(this, GalleryCellStats);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(GalleryCellStats).apply(this, arguments));
		}

		_createClass(GalleryCellStats, [{
			key: 'render',
			value: function render() {
				var stats = this.props.stats,
				    statString = '';

				if (stats.photos > 0) statString = stats.photos + ' Photo' + (stats.photos == 1 ? '' : 's');

				if (stats.videos > 0) {
					if (statString.length > 0) statString += ' • ';

					statString += stats.videos + ' Video' + (stats.videos == 1 ? '' : 's');
				}

				return _react2.default.createElement(
					'span',
					{ className: 'right-info' },
					statString
				);
			}
		}]);

		return GalleryCellStats;
	}(_react2.default.Component);

/***/ },

/***/ 360:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _frescoImage = __webpack_require__(310);

	var _frescoImage2 = _interopRequireDefault(_frescoImage);

	var _global = __webpack_require__(175);

	var _global2 = _interopRequireDefault(_global);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Stateless image that manages an image error handler
	 */

	var FrescoBackgroundImage = function (_React$Component) {
		_inherits(FrescoBackgroundImage, _React$Component);

		function FrescoBackgroundImage(props) {
			_classCallCheck(this, FrescoBackgroundImage);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FrescoBackgroundImage).call(this, props));

			_this.state = {
				image: _global2.default.formatImg(_this.props.image, _this.props.size)
			};

			_this.updateImage = _this.updateImage.bind(_this);
			return _this;
		}

		_createClass(FrescoBackgroundImage, [{
			key: 'updateImage',
			value: function updateImage(image) {
				if (!this.isMounted()) return;

				this.setState({
					image: image
				});
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					{
						className: 'frs-background-image',
						style: {
							backgroundImage: 'url(' + this.state.image + ')'
						} },
					_react2.default.createElement(_frescoImage2.default, {
						image: this.props.image,
						size: this.props.size,
						updateImage: this.updateImage })
				);
			}
		}]);

		return FrescoBackgroundImage;
	}(_react2.default.Component);

	exports.default = FrescoBackgroundImage;


	FrescoBackgroundImage.defaultProps = {
		size: 'small',
		image: ''
	};

/***/ }

});