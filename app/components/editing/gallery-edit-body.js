var React = require('react'),
	ReactDOM = require('react-dom'),
	Tag = require('./tag.js'),
	EditPost = require('./edit-post.js'),
	EditMap = require('./edit-map.js'),
	StoriesAutoComplete = require('./stories-autocomplete.js'),
	BylineEdit = require('./byline-edit.js');

/**
 * Gallery Edit Body, inside of the GalleryEdit class
 * @description manages all of the input fields, and speaks to parent
 */

var GalleryEditBody = React.createClass({

	displayName: 'GalleryEditBody',

	getInitialState: function(){
		return{
			gallery: this.props.gallery
		}
	},

	render: function(){

		var highlightCheckbox = '';

		//Check if the rank is valid for toggling the highlighted state
		if(this.props.user.rank && this.props.user.rank >= 1){

			highlightCheckbox = <div className="dialog-row">
									<div className="checkbox">
										<label>
											<input id="gallery-highlight-input" type="checkbox" />
											<span className="ripple"></span>
											<span className="check"></span> Highlighted
										</label>
									</div>
								</div>

		}

		return(
			
			<div className="dialog-body">

				<div className="dialog-col col-xs-12 col-md-7 form-group-default">

					<BylineEdit gallery={this.state.gallery} />
					
					<div className="dialog-row">
										
						<div className="form-control-wrapper">
							<textarea 
								id="gallery-edit-caption" 
								type="text" 
								className="form-control" 
								defaultValue={this.state.gallery.caption} />
							<div className="floating-label">Caption</div>
							<span className="material-input"></span>
						</div>

					</div>
					
					<GalleryEditTags ref='tags' tags={this.state.gallery.tags} />
					
					<GalleryEditStories ref='stories' 
						stories={this.state.gallery.related_stories} 
						updateRelatedStories={this.updateRelatedStories} />
					
					<GalleryEditArticles ref='articles' articles={this.state.gallery.articles} />
					
					{highlightCheckbox}

				</div>
				
				<GalleryEditPosts posts={this.state.gallery.posts} files={this.state.gallery.files} />
				
				<GalleryEditMap gallery={this.state.gallery} />

			</div>

		);
	},

	updateRelatedStories: function(updatedStories){

		this.state.gallery.related_stories = updatedStories;

		this.props.updateGallery(this.state.gallery);

	},

	updateArticles: function(articles){

		this.state.gallery.articles = articles;

		this.props.updateGallery(gallery);

	},

	updatedTags: function(tags){

		this.state.gallery.tags = tags;

		this.props.updateGallery(gallery);

	},

	updatedLocation: function(location){

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
	getInitialState: function() {
		return { tags: this.props.tags }
	},

	componentWillReceiveProps: function(nextProps){
		
		this.setState({
			tags: nextProps.tags
		})
	},

	render: function(){

		tags = this.state.tags.map(function (tag, i) {
			return(

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={'#' + tag} 
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
		
		return { stories: this.props.stories }

	},

	componentWillReceiveProps: function(nextProps){
		
		this.setState({ stories: nextProps.stories });
	
	},
	//Add's story element
	addStory: function(newStory){

		this.props.updateRelatedStories(this.state.stories.concat(newStory));

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
					<StoriesAutoComplete addStory={this.addStory} stories={this.state.stories} />
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

		this.props.updateRelatedStories(updatedStories);

	}
});

/**
 * Component for managing added/removed articles
 */

var GalleryEditArticles = React.createClass({


	displayName: 'GalleryEditArticles',

	getInitialState: function() {
		return { articles: this.props.articles }
	},

	componentWillReceiveProps: function(nextProps){

		this.setState({	articles: nextProps.articles });
	},

	render: function(){

		articles = this.state.articles.map(function (article, i) {

			return(

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={article.link} 
					plus={false}
					key={i} />

			)

		}, this);
		
		return(
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						id="gallery-articles-input" 
						type="text" 
						className="form-control floating-label" 
						placeholder="Articles" />
					<ul id="gallery-articles-list" className="chips">{articles}</ul>
				</div>
			</div>
		);

	},
	handleClick: function(index){

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
	componentDidMount: function(){

		//Set up autocomplete listener
		autocomplete = new google.maps.places.Autocomplete(document.getElementById('gallery-location-input'));
				
		google.maps.event.addListener(autocomplete, 'place_changed', function(){

			var place = autocomplete.getPlace();

			if(place.geometry){
				
				marker.setPosition(place.geometry.location);

				if(place.geometry.viewport){
					map.fitBounds(place.geometry.viewport);
				}
				else {
					map.panTo(place.geometry.location);
					map.setZoom(18);
				}
			}

		});

	},

	render: function(){

		return(

				<div className="dialog-col col-xs-12 col-md-5 pull-right">
					<div className="dialog-row map-group">
						<div className="form-group-default">
							<input 
								id="gallery-location-input" 
								type="text" className="form-control floating-label" 
								placeholder="Location"
								defaultValue={this.props.gallery.posts[0].location.address}
								disabled={!this.props.gallery.imported} />
						</div>
						<EditMap gallery={this.props.gallery} />
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
		return {
			posts: this.props.posts,
			files: []
		}
	},

	componentWillReceiveProps: function(nextProps){

		this.replaceState({	
			posts: nextProps.posts,
			files: nextProps.files ? nextProps.files : []
		});

	},

	componentDidMount: function(){
		$(this.refs.galleryEditPosts).frick();
	},

	componentDidUpdate: function(){
		$(this.refs.galleryEditPosts).frick();
	},

	render: function(){

		var k = 0;

		var posts = this.state.posts.map(function (post) {

			return <EditPost key={k++} post={post} />

		}, this);

		var files = [];

		for (var i = 0; i < this.state.files.length; i++){
			
			files.push(<EditPost key={k++} file={this.state.files[i]} source={this.state.files.sources[i]} />);

		}

		return(
			<div className="dialog-col col-xs-12 col-md-5">
				<div ref='galleryEditPosts' id="gallery-edit-images">{posts}{files}</div>
			</div>
		);

	}
});



module.exports = GalleryEditBody;
