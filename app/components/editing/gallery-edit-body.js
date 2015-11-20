import React from 'react'
import Tag from './tag.js'
import EditPost from './edit-post.js'
import EditMap from './edit-map.js'
import StoriesAutoComplete from './stories-autocomplete.js'
import BylineEdit from './byline-edit.js'

/**
 * Gallery Edit Body, inside of the GalleryEdit class
 * @description manages all of the input fields, and speaks to parent
 */

export default class GalleryEditBody extends React.Component {

	constructor(props) {
		super(props);
		this.state ={
			gallery: this.props.gallery
		}
		this.updateRelatedStories = this.updateRelatedStories.bind(this);
		this.updateArticles = this.updateArticles.bind(this);
		this.updatedTags = this.updatedTags.bind(this);
		this.updatedLocation = this.updatedLocation.bind(this);
	}

	render() {

		var highlightCheckbox = '';

		//Check if the rank is valid for toggling the highlighted state
		if(this.props.user.rank && this.props.user.rank >= 1) {

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

		return (
			
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
	}

	updateRelatedStories(updatedStories) {

		this.state.gallery.related_stories = updatedStories;

		this.props.updateGallery(this.state.gallery);

	}

	updateArticles(articles) {

		this.state.gallery.articles = articles;

		this.props.updateGallery(gallery);

	}

	updatedTags(tags) {

		this.state.gallery.tags = tags;

		this.props.updateGallery(gallery);

	}

	updatedLocation(location) {

		this.state.gallery.locations[0] = location;

		this.props.updateGallery(gallery);

	}

}

/**
 * Component for managing added/removed tags
 */

class GalleryEditTags extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tags: this.props.tags
		}

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		
		this.setState({
			tags: nextProps.tags
		})

	}

	render() {

		tags = this.state.tags.map((tag, i) => {
			return (

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={'#' + tag} 
					plus={false}
					key={i} />

			)

		});

		return (
			
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

	}

	handleClick(index) {

		var updatedTags = this.state.tags;

		//Remove from index
		updatedTags.splice(index, 1);

		//Update state
		this.setState({
			tags: updatedTags
		});

	}

}

/**
 * Component for managing added/removed stories
 */

class GalleryEditStories extends React.Component {

	constructor(props)  {
		
		super(props);
		this.state = { stories: this.props.stories }
		this.addStory = this.addStory.bind(this);

	}

	componentWillReceiveProps(nextProps) {
		
		this.setState({ stories: nextProps.stories });
	
	}

	//Add's story element
	addStory(newStory) {

		this.props.updateRelatedStories(this.state.stories.concat(newStory));

	}

	handleClick(index) {

		var updatedStories = this.state.stories;

		//Remove from index
		updatedStories.splice(index, 1);

		this.props.updateRelatedStories(updatedStories);

	}

	render() {

		var stories = this.state.stories.map((story, i) => {

			return (

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={story.title} 
					plus={false}
					key={i} />

			)

		});

		return (

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
	}
}

/**
 * Component for managing added/removed articles
 */

class GalleryEditArticles extends React.Component {

	constructor(props) {
		super(props);
		this.state = { articles: this.props.articles }
		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {

		this.setState({	articles: nextProps.articles });
	}

	handleClick(index) {

		var updateArticles = this.state.articles;

		//Remove from index
		updateArticles.splice(index, 1);

		//Update state
		this.setState({
			articles: updateArticles
		});

	}

	render() {

		articles = this.state.articles.map((article, i) => {

			return (

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={article.link} 
					plus={false}
					key={i} />

			)

		});
		
		return (
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

	}

}

/**
 * Component for managing gallery map representation
 */

class GalleryEditMap extends React.Component {

	//Configure google maps after component mounts
	componentDidMount() {

		//Set up autocomplete listener
		autocomplete = new google.maps.places.Autocomplete(document.getElementById('gallery-location-input'));
				
		google.maps.event.addListener(autocomplete, 'place_changed', () => {

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

	}

	render() {

		return (

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


}

/**
 * Component for managing gallery's posts
 */

class GalleryEditPosts extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			posts: this.props.posts,
			files: []
		}
	}

	componentWillReceiveProps(nextProps) {

		this.replaceState({	
			posts: nextProps.posts,
			files: nextProps.files ? nextProps.files : []
		});

	}

	componentDidMount() {
		$(this.refs.galleryEditPosts).frick();
	}

	componentDidUpdate() {
		$(this.refs.galleryEditPosts).frick();
	}

	render() {

		var k = 0;

		var posts = this.state.posts.map((post) => {

			return <EditPost key={k++} post={post} />

		});

		var files = [];

		for (var i = 0; i < this.state.files.length; i++){
			
			files.push(<EditPost key={k++} file={this.state.files[i]} source={this.state.files.sources[i]} />);

		}

		return (
			<div className="dialog-col col-xs-12 col-md-5">
				<div ref='galleryEditPosts' id="gallery-edit-images">{posts}{files}</div>
			</div>
		);

	}
}
