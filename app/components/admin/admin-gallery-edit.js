import React from 'react'
import Slider from 'react-slick'
import Dropdown from './../global/dropdown'
import AutocompleteMap from '../global/autocomplete-map'
import EditTags from './../editing/gallery-edit-tags'
import EditStories from './../editing/gallery-edit-stories'
import AdminGalleryEditFoot from './admin-gallery-edit-foot'
import global from '../../../lib/global'

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
		this.handleTwitterBylineChange = this.handleTwitterBylineChange.bind(this);
		this.handleChangeCaption = this.handleChangeCaption.bind(this);

		this.addTag = this.addTag.bind(this);
		this.removeTag = this.removeTag.bind(this);

		this.updateRelatedStories = this.updateRelatedStories.bind(this);

		this.onPlaceChange = this.onPlaceChange.bind(this);

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
					// this.refs['gallery-location'].value = this.props.gallery.posts[0].location.address;
				}
			}

			// Remove materialize empty input class
			$(this.refs['gallery-byline']).removeClass('empty');
			$(this.refs['gallery-caption']).removeClass('empty');
			$(this.refs['gallery-stories-input']).removeClass('empty');

		}
	}

	/**
	 * Called when byline input fires keyUp event
	 */
	handleTwitterBylineChange(selected) {
		this.refs['gallery-author'].value = selected;
	}

	/**
	 * Called when caption input fires keyUp event
	 */
	handleChangeCaption(e) {
		this.setState({
			editedCaption: e.target.value
		});

		this.refs['gallery-caption'].value = e.target.value;

	}


	/**
	 * Adds tag from state
	 */
	addTag(tag) {
		var tags = this.state.newTags.concat(tag);
		this.setState({
			newTags: tags
		});
	}

	/**
	 * Removes tag from state
	 */
	removeTag(tag) {
		var tags = _clone(this.state.newTags, true);
		var index = tags.indexOf(tag);

		if(index == -1) return;

		tags.splice(index, 1);

		this.setState({
			newTags: newTags
		});
	}

	/**
	 * Updates state with new stories
	 */
	updateRelatedStories(stories) {

		this.setState({
			stories: stories
		});
	}

	/**
	 * Updates state map location when AutocompleteMap gives new location
	 */
	onPlaceChange(place) {
		this.setState({
			mapLocation: place.location
		});
	}

	/**
	 * Changes whether or not edit buttons are enabled
	 * @param  {bool} is
	 */
	editButtonEnabled(is) {
		this.setState({
			editButtonEnabled: !is
		});
	}

	/**
	 * Reverts all changes
	 */
	revert() {
		this.setState({
				activeGallery: this.props.gallery,
				newTags: [],
				stories: []
			});

		this.editButtonEnabled(true);

		this.refs['gallery-byline'].value = this.props.hasActiveGallery ? this.props.gallery.posts[0].byline : '';
		this.refs['gallery-caption'].value = this.props.gallery.posts[0].caption;

		this.refs['gallery-byline'].className = this.refs['gallery-byline'].className.replace(/\bempty\b/,'');
		this.refs['gallery-caption'].className = this.refs['gallery-caption'].className.replace(/\bempty\b/,'');

		if(this.props.hasActiveGallery) {
			this.refs['gallery-caption'].value = this.props.gallery.posts[0].caption;
		}

	}

	/**
	 * Removes callery
	 */
	remove() {
		this.props.remove((err) => {
			if (err)
				return $.snackbar({content: 'Unable to delete gallery'});

			$.snackbar({content: 'Gallery deleted'});
		});
	}

	/**
	 * Skips gallery
	 */
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

	/**
	 * Gets all form data and verifies gallery.
	 */
	verify() {

		var byline = '';
		
		if(!Array.isArray(this.state.activeGallery.tags)) { this.state.activeGallery.tags = []; }
		if(!Array.isArray(this.state.activeGallery.posts)) { this.state.activeGallery.posts = []; }

		// Byline
		byline = (this.props.activeGalleryType == 'submission') ? this.state.activeGallery.posts[0].byline.trim() : (this.refs['gallery-author'].value + ' / ' + this.refs['gallery-affiliation'].value);

		var params = {
			id: this.state.activeGallery._id,
			byline: byline,
			caption: this.refs['gallery-caption'].value,
			posts: this.state.activeGallery.posts.map(p => p._id),
			stories: this.state.stories.map(s => s._id),
			tags: this.state.newTags.concat(this.state.activeGallery.tags)
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
		// If doesn't have active gallery or galleryType is an assignment, don't render anything.
		if(!this.props.hasActiveGallery || this.props.activeGalleryType == 'assignment') { return <div></div> }

		var activeGallery = this.props.gallery;

		// Map gallery posts into slider elements
		var galleryImages = [];
		activeGallery.posts.map((post, i) => {
			if(post.video) {
				galleryImages.push(
					<div key={i}>
						<video width="100%" height="100%" data-id={post._id} controls>
							<source src={post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					</div>
				)
			} else {
				galleryImages.push(
					<div key={i}><img className="img-responsive" src={global.formatImg(post.image, 'medium')} data-id={post._id} /></div>
				)
			}
		});

		// If gallery is a submission, 
		if(this.props.activeGalleryType == 'submission') {
			// map polygon points to array.
			if(this.props.gallery.location) {
				var editMapLocation = this.props.gallery.location.coordinates[0].map((coord) => {
					return {
						lat: coord[1],
						lng: coord[0]
					}
				});
			}

			// set byline text
			var bylineInput = 
					<input
						type="text"
						className="form-control floating-label gallery-byline"
						placeholder="Byline"
						ref="gallery-byline" disabled={this.props.activeGalleryType == 'submission'}  />

		} else { // if an import
			// set map location to one from state
			var editMapLocation = this.state.mapLocation;

			// Is a twitter import. Should show dropdown for handle vs username
			if(activeGallery.posts[0].meta.twitter) { 
				var twitterObj = activeGallery.posts[0].meta.twitter;
				var nameInput =
					<div>
						<Dropdown 
							options={[twitterObj.handle, twitterObj.user_name]}
							selected={twitterObj.handle}
							onSelected={this.handleTwitterBylineChange}/>
						<input type="hidden" ref="gallery-author" />
					</div>

			} else {

				// If not a twitter import, just show the author, disabled if not an import
				var nameInput = 
					<div className="split-cell">
						<input
							type="text"
							className="form-control floating-label gallery-author"
							placeholder="Name"
							ref="gallery-author" disabled={this.props.activeGalleryType == 'submission'}  />
					</div>
			}

			// Affiliation input, disabled if not an import
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

					<EditTags ref='tags' tags={activeGallery.tags.concat(this.state.newTags)} addTag={this.addTag} removeTag={this.removeTag} />

					<EditStories ref='stories' 
						stories={this.state.stories} 
						updateRelatedStories={this.updateRelatedStories} />

					<div style={{height: '309px'}}>
						<AutocompleteMap
							defaultLocation={activeGallery.posts[0].location ? activeGallery.posts[0].location.address : null}
							location={editMapLocation}
							onPlaceChange={this.onPlaceChange}
							disabled={this.props.activeGalleryType != 'import'}
							rerender={true} />
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