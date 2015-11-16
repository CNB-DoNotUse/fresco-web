var React = require('react'),
	ReactDOM = require('react-dom'),
	Tag = require('./tag.js'),
	EditPost = require('./edit-post.js');

/**
 * Gallery Edit Body, inside of the GalleryEditClass
 */

var GalleryEditBody = React.createClass({

	displayName: 'GalleryEditBody',

	componentDidMount: function(){


	},

	render: function(){

		var highlightCheckbox = '';

		if(this.props.user.rank && this.props.user.rank >= 1){

			highlightCheckbox = <div className="dialog-row">
									<div className="checkbox">
										<label>
											<input id="gallery-highlight-input" type="checkbox" /> Highlighted
										</label>
									</div>
								</div>

		}

		return(
			
			<div className="dialog-body">
				<div className="dialog-col col-xs-12 col-md-7 form-group-default">
					<GalleryEditByline gallery={this.props.gallery} />
					<div className="dialog-row">
						<textarea 
							id="gallery-caption-input" 
							type="text" 
							className="form-control floating-label" 
							placeholder="Caption">
						</textarea>
					</div>
					<GalleryEditTags ref='tags' tags={this.props.gallery.tags} />
					<GalleryEditStories ref='stories' stories={this.props.gallery.related_stories} />
					<GalleryEditArticles ref='articles' articles={this.props.gallery.articles} />
					{highlightCheckbox}
				</div>
				<GalleryEditPosts posts={this.props.gallery.posts} />
				<GalleryEditMap />
			</div>

		);
	}
});

/**
 * Component for managing byline editing
 */

var GalleryEditByline = React.createClass({

	displayName: 'GalleryEditByline',

	render: function(){

		return(

			<div className="dialog-row">
				
				<span id="gallery-byline-input-span">
					<input 
						id="gallery-byline-input" 
						type="text" 
						className="form-control floating-label" 
						placeholder="Byline" 
						disabled />
				</span>
			
				<div className="drop" id="gallery-byline-selection">
					<button className="toggle-drop md-type-subhead gallery-byline-button">
						<span className="gallery-byline-text"></span>
						<span className="mdi mdi-menu-down icon"></span>
					</button>
					<div className="drop-menu panel panel-default byline-drop">
						<div className="toggle-drop toggler md-type-subhead"><span className="gallery-byline-text"></span><span className="mdi mdi-menu-up icon pull-right"></span></div>
						<div className="drop-body">
							<ul className="md-type-subhead" id="gallery-byline-options">
							</ul>
						</div>
					</div>
				</div>
				<div className="split" id="gallery-other-origin">
					<div className="split-cell">
						<input 
							type="text" 
							className="form-control floating-label" 
							id="gallery-name-input" 
							placeholder="Name" />
					</div>
					<div className="split-cell">
						<input 
							type="text" 
							className="form-control floating-label" 
							id="gallery-affiliation-input" 
							placeholder="Affiliation" />
					</div>
				</div>

			</div>

		);
	}
});


/**
 * Component for managing added/removed tags
 */

var GalleryEditTags = React.createClass({

	displayName: 'GalleryEditTags',

	getInitialState: function() {
		return {
			tags: this.props.tags
		}
	},

	render: function(){

		tags = this.state.tags.map(function (story, i) {

			return(

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={tag.title} 
					plus={false}
					key={i} />

			)

		}, this);

		return(
			
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						id="gallery-tags-input" 
						type="text" 
						className="form-control floating-label" 
						placeholder="Tags"
						onChange={this.change} />
					<ul ref="gallery-tags-list" className="chips">{tags}</ul>
				</div>
				<div className="split-cell">
					<span className="md-type-body2">Suggested tags</span>
					<ul id="gallery-suggested-tags-list" className="chips"></ul>
				</div>
			</div>

		);

	},
	handleClick: function(index){

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


	getInitialState: function() {
		return {
			stories: this.props.stories
		}
	},

	render: function(){

		stories = this.state.stories.map(function (story, i) {

			return(

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={story.title} 
					plus={false}
					key={i} />

			)

		}, this);

		return(

			<div className="dialog-row split chips">
				
				<div className="split-cell">
					<input 
						id="gallery-stories-input" 
						type="text" 
						className="form-control floating-label" 
						placeholder="Stories"
						onChange={this.change} />
					<ul id="gallery-stories-list" className="chips">
						{stories}
					</ul>
				</div>
				
				<div className="split-cell">
					<span className="md-type-body2">Suggested stories</span>
					<ul id="gallery-suggested-stories-list" className="chips"></ul>
				</div>

			</div>

		);
	},

	handleClick: function(index){

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

	render: function(){
		
		return(
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						id="gallery-articles-input" 
						type="text" className="form-control floating-label" 
						placeholder="Articles" />
					<ul id="gallery-articles-list" className="chips"></ul>
				</div>
			</div>
		);

	}

});

/**
 * Component for managing gallery map representation
 */


var GalleryEditMap = React.createClass({

	displayName: 'GalleryEditMap',

	//Configure google maps after component mounts
	componentDidMount: function(){

		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];

		var mapOptions = {
			center: {lat: 40.7, lng: -74},
			zoom: 12,
			mapTypeControl: false,
			styles: styles
		};

		galleryEditMap = new google.maps.Map(document.getElementById('gallery-map-canvas'), mapOptions);

		var image = {
			url: "/images/assignment-active@2x.png",
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};

		galleryEditPolygon = new google.maps.Polygon({
					paths: [],
					strokeColor: "#FFB500",
					strokeOpacity: 0.8,
					strokeWeight: 0,
					fillColor: "#FFC600",
					fillOpacity: 0.35,
					map: galleryEditMap
				});

		galleryEditMarker = new google.maps.Marker({
			position: new google.maps.LatLng(40.7, -74),
			map: null,
			icon: image
		});

		galleryEditAutocomplete = new google.maps.places.Autocomplete(document.getElementById('gallery-location-input'));
		
		$('#gallery-location-input').attr('placeholder', '');
		
		google.maps.event.addListener(galleryEditAutocomplete, 'place_changed', function(){
			
			var place = galleryEditAutocomplete.getPlace();

			if(place.geometry){
				if(place.geometry.viewport){
					galleryEditMap.fitBounds(place.geometry.viewport);
				}
				else {
					galleryEditMap.panTo(place.geometry.location);
					galleryEditMap.setZoom(18);
				}
			}

		});

	},

	render: function(){

		return(
			<div className="dialog-col col-xs-12 col-md-5">
				<div className="dialog-row map-group">
					<div className="form-group-default">
						<input 
							id="gallery-location-input" 
							type="text" className="form-control floating-label" 
							placeholder="Location" />
					</div>
					<div id="gallery-map-canvas" className="map-container"></div>
				</div>
			</div> 
		);

	}


});

/**
 * Component for managing gallery's posts
 */

var GalleryEditPosts = React.createClass({

	displayName: 'GalleryEditPosts',

	getInitialState: function(){
		return{
			posts: []
		}
	},

	componentDidMount: function(){

		this.setState({
			posts : this.props.posts
		});

		console.log(this.refs.galleryEditPosts);

		$(this.refs.galleryEditPosts).frick();

	},

	render: function(){

		var posts = this.state.posts.map(function (post, i) {

			return <EditPost post={post} />

		}, this);

		return(
			<div className="dialog-col col-xs-12 col-md-5">
				<div ref='galleryEditPosts' className="edit-gallery-images">{posts}</div>
			</div> 
		);

	}
});



module.exports = GalleryEditBody;
