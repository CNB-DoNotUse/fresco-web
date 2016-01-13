import _ from 'lodash';
import React from 'react'
import Slider from 'react-slick'
import Dropdown from './../global/dropdown'
import AutocompleteMap from '../global/autocomplete-map'
import EditTags from './../editing/gallery-edit-tags'
import EditStories from './../editing/gallery-edit-stories'
import AdminGalleryEditFoot from './admin-gallery-edit-foot'
import BylineEdit from '../editing/byline-edit'
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
			tags: [],
			stories: [],
			address: null,
			mapLocation: []
		}
		this.editButtonEnabled = this.editButtonEnabled.bind(this);
		this.handleTwitterBylineChange = this.handleTwitterBylineChange.bind(this);
		this.handleChangeCaption = this.handleChangeCaption.bind(this);
		this.updateTags = this.updateTags.bind(this);
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
				activeGallery: _.clone(this.props.gallery, true),
				tags: [],
				stories: [],
				mapLocation: null
			});

			if( this.props.hasActiveGallery ) {

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
	 * Updates state with new tags
	 */
	 updateTags(tags) {
	 	var gallery = this.state.activeGallery;
	 		gallery.tags = tags;

	 	this.setState({
	 		activeGallery: gallery
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
			address: place.address,
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
			activeGallery: _.clone(this.props.gallery, true),
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
		
		if(!Array.isArray(this.state.activeGallery.tags)) { 
			this.state.activeGallery.tags = []; 
		}
		if(!Array.isArray(this.state.activeGallery.posts)) { 
			this.state.activeGallery.posts = []; 
		}

		// Byline
		if(this.refs.byline.refs.byline) {
			byline = this.refs.byline.refs.byline.value;
		} else {
			byline = this.refs.byline.refs.name.value + ' / ' + this.refs.byline.refs.affiliation.value;
		}

		var params = {
			id: this.state.activeGallery._id,
			byline: byline,
			caption: this.refs['gallery-caption'].value,
			posts: this.state.activeGallery.posts.map(p => p._id),
			stories: this.state.stories.map(s => s._id),
			tags: this.state.activeGallery.tags
		};

		if(this.props.activeGalleryType == 'import') {
			params.other_origin_name = this.refs.byline.refs.name.value;
			params.other_origin_affiliation = this.refs.byline.refs.affiliation.value;
			params.address = this.state.address;
		}
		if (!params.posts || params.posts.length == 0)
			return $.snackbar({content: 'A gallery must have at least one post'});

		if(this.refs['gallery-caption'].length == 0)
			return $.snackbar({content: 'A gallery must have a caption'});

		this.props.verify(params, (err, id) => {
			
			if (err)
				return $.snackbar({content: 'Unable to verify gallery'});

			$.snackbar({ 
				content: 'Gallery verified! Click to open', 
				timeout: 5000 
			}).click(() => {
				var win = window.open('/gallery/' + id, '_blank');
				win.focus();
			});

		});
	}

	render() {
		// If doesn't have active gallery or galleryType is an assignment, don't render anything.
		if(!this.props.hasActiveGallery || this.props.activeGalleryType == 'assignment' || !this.props.gallery || !this.props.gallery.posts) { return <div></div> }

		var activeGallery = this.props.gallery;

		// Map gallery posts into slider elements
		var galleryImages = [];
		if(activeGallery.posts) {
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
		}

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
						style={{width: '100%'}}
						placeholder="Byline"
						ref="gallery-byline" disabled={this.props.activeGalleryType == 'submission'}  />

		} else { // if an import

			// set map location to one from state
			var editMapLocation = this.state.mapLocation;
			// Is a twitter import. Should show dropdown for handle vs username
			if(activeGallery.posts && activeGallery.posts[0].meta.twitter) { 
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

					<BylineEdit ref="byline" gallery={this.props.gallery} />

					<textarea
						type="text"
						className="form-control floating-label gallery-caption"
						placeholder="Caption"
						onChange={this.props.handleChangeCaption}
						ref="gallery-caption"></textarea>

					<EditTags  
						updateTags={this.updateTags}
						tags={this.state.activeGallery.tags} />

					<EditStories
						relatedStories={this.state.stories} 
						updateRelatedStories={this.updateRelatedStories} />

					<div style={{height: '309px'}}>
						<AutocompleteMap
							defaultLocation={activeGallery.posts[0].location ? activeGallery.posts[0].location.address : null}
							location={editMapLocation}
							onPlaceChange={this.onPlaceChange}
							disabled={this.props.activeGalleryType != 'import'}
							hasRadius={false}
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