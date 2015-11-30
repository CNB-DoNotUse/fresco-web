import React from 'react'
import Slider from 'react-slick'
import Tag from './editing/tag'
import EditMap from './editing/edit-map'
import EditStories from './editing/gallery-edit-stories'
import AdminGalleryEditFoot from './admin-gallery-edit-foot'

/**

	Admin Submission Edit component. 
	Delete, Skip, Verify imported

**/

export default class AdminGalleryEdit extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			activeGallery: {},
			editButtonsEnabled: false,
			newTags: [],
			stories: [],
			mapLocation: []
		}
		this.editButtonEnabled = this.editButtonEnabled.bind(this);
		this.handleChangeCaption = this.handleChangeCaption.bind(this);

		this.galleryTagsInputKeyDown = this.galleryTagsInputKeyDown.bind(this);
		this.removeGalleryTag = this.removeGalleryTag.bind(this);

		this.addStory = this.addStory.bind(this);

		this.revert = this.revert.bind(this);
		this.skip = this.skip.bind(this);
		this.verify = this.verify.bind(this);
		this.remove = this.remove.bind(this);
	}

	componentDidMount() {
		this.editButtonEnabled(false);
	}

	componentDidUpdate(prevProps, prevState) {

		if( this.props.activeGalleryType == 'assignment') { return }

		if( this.props.activeGalleryType == 'import' ) {

			var location = new google.maps.places.Autocomplete(this.refs['gallery-location']);
			google.maps.event.addListener( location, 'place_changed', () => {

				if(!location.getPlace().geometry) return;
				var coord = location.getPlace().geometry.location;
				this.setState({
					mapLocation: {
						lat: coord.lat(),
						lng: coord.lng()
					}
				});

			});

		}

		if( this.props.gallery._id != prevProps.gallery._id ) {

			// Reset form
			this.setState({
				activeGallery: this.props.gallery,
				newTags: [],
				stories: [],
				mapLocation: null
			});

			if( this.props.hasActiveGallery ) {

				// Set caption and byline values using prop data.
				if( this.props.activeGalleryType == 'submission' ) {
					this.refs['gallery-byline'].value = this.props.gallery.posts[0].byline;

				}
				this.refs['gallery-caption'].value = this.props.gallery.posts[0].caption;

				// If has location, set location input
				if( this.props.gallery.posts[0].location ) {
					this.refs['gallery-location'].value = this.props.gallery.posts[0].location.address;
				}
			}

			// Remove materialize empty input class
			$(this.refs['gallery-byline']).removeClass('empty');
			$(this.refs['gallery-caption']).removeClass('empty');
			$(this.refs['gallery-stories-input']).removeClass('empty');
			$(this.refs['gallery-location']).removeClass('empty');

			// Empty tags input
			this.refs['tags-input'].value = '';

		}
	}

	handleChangeCaption(e) {
		this.setState({
			editedCaption: e.target.value
		});

		this.refs['gallery-caption'].value = e.target.value;

	}

	galleryTagsInputKeyDown(e) {
		if(e.keyCode == 13) {
			var text = e.target.value.replace(/[^a-z0-9.]+/i, '');

			if(text.length >= 3) {
				let activeGallery = this.state.activeGallery;
				let tags = this.state.newTags;

				if(tags.indexOf(text) != -1) return;
				if(!Array.isArray(activeGallery.tags)) { activeGallery.tags = []; }
				if(activeGallery.tags.indexOf(text) != -1) return;

				tags.push(text);

				this.setState({
					newTags: tags
				});

				e.target.value = '';
			}
		}
	}

	removeGalleryTag(tag) {

		let tags = this.state.activeGallery.tags;

		if(tags.indexOf(tag) != -1) {

			let activeGallery = this.state.activeGallery;

			activeGallery.tags.splice(tags.indexOf(tag), 1);

			this.setState({
				activeGallery: activeGallery
			});

		}

		let newTags = this.state.newTags;
		if(newTags.indexOf(tag) != -1) {

			newTags.splice(newTags.indexOf(tag), 1);

			this.setState({
				newTags: newTags
			});
		}

	}

	addStory(story) {
		var stories = [];
		this.state.stories.map(s => stories.push(s));

		stories.push(story);

		this.setState({
			stories: stories
		});
	}

	editButtonEnabled(is) {
		this.setState({
			editButtonEnabled: !is
		});
	}

	revert() {
		this.setState({
				activeGallery: this.props.gallery,
				newTags: [],
				stories: []
			});

		this.editButtonEnabled(true);

		this.refs['gallery-byline'].value = this.props.hasActiveGallery ? this.props.gallery.posts[0].byline : '';
		this.refs['gallery-caption'].value = this.props.gallery.posts[0].caption;

		$(this.refs['gallery-byline']).removeClass('empty');
		$(this.refs['gallery-caption']).removeClass('empty');

		if(this.props.hasActiveGallery) {
			this.refs['gallery-caption'].value = this.props.gallery.posts[0].caption;
		}

		if(this.props.gallery.posts[0].location) {
			this.refs['gallery-location'].value = this.props.gallery.posts[0].location.address;
		}

		this.refs['tags-input'].value = '';
	}

	remove() {
		this.props.remove((err) => {
			if (err)
				return $.snackbar({content: 'Unable to delete gallery'});

			$.snackbar({content: 'Gallery deleted'});
		});
	}

	skip() {
		this.props.skip((err, id) => {
			if (err)
				return $.snackbar({content: 'Unable to skip gallery'});

			$.snackbar({content: 'Gallery skipped! Click to open', timeout: 5000})
				.click(() => {
					window.open('/gallery/' + id);
				});
		});
	}

	verify() {

		var allTags = [], byline = '';
		
		if(!Array.isArray(this.state.activeGallery.tags)) { this.state.activeGallery.tags = []; }
		if(!Array.isArray(this.state.activeGallery.posts)) { this.state.activeGallery.posts = []; }

		this.state.activeGallery.tags.map(t => allTags.push(t));
		this.state.newTags.map(t => allTags.push(t));

		// Byline
		byline = (this.props.activeGalleryType == 'submission') ? this.state.activeGallery.posts[0].byline.trim() : (this.refs['gallery-author'].value + ' / ' + this.refs['gallery-affiliation'].value);

		var params = {
			id: this.state.activeGallery._id,
			byline: byline,
			caption: this.refs['gallery-caption'].value,
			posts: this.state.activeGallery.posts.map(p => p._id),
			stories: this.state.stories.map(s => s._id),
			tags: allTags
		};

		if(this.props.activeGalleryType == 'import') {
			params.other_origin_name = this.refs['gallery-author'].value;
			params.other_origin_affiliation = this.refs['gallery-affiliation'].value;
			params.address = this.refs['gallery-location'].value;
		}

		if (!params.posts || params.posts.length == 0)
			return $.snackbar({content: 'A gallery must have at least one post'});

		if(this.refs['gallery-caption'].length == 0)
			return $.snackbar({content: 'A gallery must have a caption'});

		this.props.verify(params, (err, id) => {
			if (err)
				return $.snackbar({content: 'Unable to verify gallery'});

			$.snackbar({content: 'Gallery verified! Click to open', timeout: 5000})
				.click(() => {
					window.open('/gallery/' + id);
				});
		});
	}

	render() {

		if(this.props.activeGalleryType == 'assignment') { return <div></div> }

		var activeGallery = this.props.gallery;
		if(this.props.hasActiveGallery) { 
			var galleryImages = activeGallery.posts.map((post, i) => {
				if(post.video) {
					return (
						<div key={i}>
							<video width="100%" height="100%" data-id={post._id} controls>
								<source src={post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')} type="video/mp4" />
								Your browser does not support the video tag.\
							</video>
						</div>
					)
				}
				return (
					<div key={i}><img className="img-responsive" src={formatImg(post.image, 'medium')} data-id={post._id} /></div>
				);
			});

			var allTags = [];

			activeGallery.tags.map((tag, i) => {
				allTags.push(<Tag text={'#' + tag} onClick={this.removeGalleryTag.bind(null, tag)} key={i} />);
			});

			this.state.newTags.map((tag, i) => {
				allTags.push(<Tag text={'#' + tag} onClick={this.removeGalleryTag.bind(null, tag)} key={i} />);
			});

		}

		if(this.props.activeGalleryType == 'submission') {

			if(this.props.gallery.location) {
				var editMapLocation = this.props.gallery.location.coordinates[0].map((coord) => {
					return {
						lat: coord[1],
						lng: coord[0]
					}
				});
			}

			var bylineInput = 
					<input
						type="text"
						className="form-control floating-label gallery-byline"
						placeholder="Byline"
						ref="gallery-byline" disabled={this.props.activeGalleryType == 'submission'}  />

		} else {

			var editMapLocation = this.state.mapLocation;

			var nameInput = 
					<div className="split-cell">
						<input
							type="text"
							className="form-control floating-label gallery-author"
							placeholder="Name"
							ref="gallery-author" disabled={this.props.activeGalleryType == 'submission'}  />
					</div>

			var affiliationInput = 
					<div className="split-cell">
						<input
							type="text"
							className="form-control floating-label gallery-affiliation"
							placeholder="Affiliation"
							ref="gallery-affiliation" disabled={this.props.activeGalleryType == 'submission'}  />
					</div>

		}


		return (
			<div className="dialog">
				<div className="dialog-body" style={{visibility: this.props.hasActiveGallery ? 'visible' : 'hidden'}}>
					<div className="gallery-images">
						<Slider
							dots={true}>
							{galleryImages ? galleryImages : <div></div>}
						</Slider>
					</div>
					<div className="split import-other-origin byline-section" style={{marginTop: '42px'}}>
						{bylineInput}
						{nameInput}
						{affiliationInput}
					</div>
					<textarea
						type="text"
						className="form-control floating-label gallery-caption"
						placeholder="Caption"
						onChange={this.props.handleChangeCaption}
						ref="gallery-caption"></textarea>
					<div className="split chips">
						<div className="split-cell">
							<input
								type="text"
								className="form-control floating-label tags-input"
								placeholder="Tags"
								onKeyDown={this.galleryTagsInputKeyDown}
								ref="tags-input" />
							<ul className="chips tags gallery-tags">
								{allTags}
							</ul>
						</div>
						<div className="split-cell">
							<span className="md-type-body2">Suggested tags</span>
							<ul className="chips gallery-suggested-tags">
							</ul>
						</div>
					</div>
					
					<EditStories ref='stories' 
						stories={this.state.stories} 
						addStory={this.addStory} />

					<div style={{height: '309px'}}>
						<div className="map-group">
							<div className="form-group-default">
								<input
									type="text"
									className="form-control floating-label google-autocomplete gallery-location"
									placeholder="Location"
									ref="gallery-location"
									disabled={this.props.activeGalleryType == "submission"} />
							</div>
							<EditMap location={editMapLocation}/>
						</div>
					</div>
				</div>
				<AdminGalleryEditFoot
					revert={this.revert}
					verify={this.verify}
					skip={this.skip}
					remove={this.remove}
					enabled={this.props.hasActiveGallery} />
			</div>
		);
	}
}