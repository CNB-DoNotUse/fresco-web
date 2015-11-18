var React = require('react'),
	ReactDOM = require('react-dom'),
	Tag = require('./tag.js'),
	EditPost = require('./edit-post.js'),
	EditMap = require('./edit-map.js');

/**
 * Gallery Edit Body, inside of the GalleryEditClass
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

					<GalleryEditByline gallery={this.state.gallery} />
					
					<div className="dialog-row">
										
						<div className="form-control-wrapper">
							<textarea id="gallery-caption-input" type="text" className="form-control" defaultValue={this.state.gallery.caption} />
							<div className="floating-label">Caption</div>
							<span className="material-input"></span>
						</div>

					</div>
					
					<GalleryEditTags ref='tags' tags={this.state.gallery.tags} />
					<GalleryEditStories ref='stories' stories={this.state.gallery.related_stories} />
					<GalleryEditArticles ref='articles' articles={this.state.gallery.articles} />
					
					{highlightCheckbox}

				</div>
				
				<GalleryEditPosts posts={this.state.gallery.posts} files={this.state.gallery.files} />
				
				<GalleryEditMap gallery={this.state.gallery} />

			</div>

		);
	}

});

/**
 * Component for managing byline editing
 */

var GalleryEditByline = React.createClass({

	displayName: 'GalleryEditByline',

	/**
	 * Renders byline field
	 * @description Three types of instances for the byline
	 */
	render: function(){

		var post = this.props.gallery.posts[0];

		//If the post contains twitter info, show twitter byline editor
		if (post.meta && post.meta.twitter) {

			var isHandleByline = post.byline.indexOf('@') == 0;

			if (isHandleByline)
				byline = post.meta.twitter.handle;
			else 
				byline = post.meta.twitter.user_name;

			return (

				<div className="dialog-row">
					<div className="split byline-section" id="gallery-byline-twitter">
						<div className="split-cell drop">
							<button className="toggle-drop md-type-subhead">
								<span className="gallery-byline-text">{byline}</span>
								<span className="mdi mdi-menu-down icon pull-right"></span>
							</button>
							<div className="drop-menu panel panel-default byline-drop">
								<div className="toggle-drop toggler md-type-subhead">
									<span className="gallery-byline-text">{post.meta.twitter.handle}</span>
									<span className="mdi mdi-menu-up icon pull-right"></span>
								</div>
								<div className="drop-body">
									<ul className="md-type-subhead" id="gallery-byline-twitter-options">
										<li className={'gallery-byline-type ' + (isHandleByline ? 'active' : '')}>
											{post.meta.twitter.handle}
										</li>
										<li className={'gallery-byline-type ' + (!isHandleByline ? 'active' : '')}>
											{post.meta.twitter.user_name}
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="split-cell">
							<div className="form-control-wrapper">
								<input type="text" className="form-control" defaultValue={post.meta.other_origin.affiliation} id="gallery-twitter-affiliation-input" />
								<div className="floating-label">Affiliation</div>
								<span className="material-input"></span>
							</div>
						</div>
					</div>
				</div>
			);

		}
		//If the post doesn't have an owner, but has a curator i.e. manually imported
		else if(!post.owner && post.curator){

			var name = '',
				affiliation = '';

			if (post.meta.other_origin) {
				name = post.meta.other_origin.name;
				affiliation = post.meta.other_origin.affiliation;
			}
			
			return (
				<div className="dialog-row">
					<div className="split byline-section" id="gallery-byline-other-origin">
						<div className="split-cell" id="gallery-name-span">
							<div className="form-control-wrapper">
								<input type="text" className="form-control empty" defaultValue={name} id="gallery-name-input" />
								<div className="floating-label">Name</div>
								<span className="material-input"></span>
							</div>
						</div>
						<div className="split-cell">
							<div className="form-control-wrapper">
								<input type="text" className="form-control empty" defaultValue={affiliation} id="gallery-affiliation-input" />
								<div className="floating-label">Affiliation</div>
								<span className="material-input"></span>
							</div>
						</div>
					</div>
				</div>

			);

		}
		//If organically submitted content i.e. user submitted the gallery, can't change the byline
		else{
			return (
				<div className="dialog-row">
					<span className="byline-section" id="gallery-byline-span">
						<div className="form-control-wrapper">
							<input id="gallery-byline-input" defaultValue={post.byline} type="text" className="form-control" disabled={true} />
							<div className="floating-label">Byline</div>
							<span className="material-input"></span>
						</div>
					</span>
				</div>
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
								placeholder="Location" />
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

		this.setState({	
			posts: nextProps.posts,
			files: nextProps.files
		});

	},

	componentDidUpdate: function(){
		
		$(this.refs.galleryEditPosts).frick();

	},

	render: function(){

		var posts = this.state.posts.map(function (post, i) {

			return <EditPost key={i} post={post} />

		}, this);

		var files = [];

		for (var i = 0; i < this.state.files.length; i++){
			
			files.push(<EditPost key={i} file={this.state.files[i]} source={this.state.files.sources[i]} />);

		}

		return(
			<div className="dialog-col col-xs-12 col-md-5">
				<div ref='galleryEditPosts' className="edit-gallery-images">{posts}{files}</div>
			</div>
		);

	}
});



module.exports = GalleryEditBody;
