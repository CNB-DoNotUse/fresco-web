import React, { PropTypes } from 'react';
import Slider from 'react-slick';
import AutocompleteMap from '../global/autocomplete-map';
import EditTags from './../editing/gallery-edit-tags';
import EditStories from './../editing/gallery-edit-stories';
import GalleryEditAssignment from './../editing/gallery-edit-assignment';
import AdminGalleryEditFoot from './admin-gallery-edit-foot';
import FrescoImage from '../global/fresco-image';
import clone from 'lodash/clone';

/**

	Admin Submission Edit component.
	Delete, Skip, Verify imported

**/
class AdminGalleryEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeGallery: {},
            editButtonsEnabled: false,
            address: null,
            mapLocation: [],
            waiting: false,
        };

        this.resetState = this.resetState.bind(this);

        this.editButtonEnabled = this.editButtonEnabled.bind(this);
        this.updateTags = this.updateTags.bind(this);
        this.updateRelatedStories = this.updateRelatedStories.bind(this);
        this.onPlaceChange = this.onPlaceChange.bind(this);
        this.updateGallery = this.updateGallery.bind(this);

        this.revert = this.revert.bind(this);
        this.skip = this.skip.bind(this);
        this.verify = this.verify.bind(this);
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        this.editButtonEnabled(false);
        this.resetState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.gallery.id !== nextProps.gallery.id) {
            this.resetState(nextProps);
        }
    }

	/**
	 * Updates state map location when AutocompleteMap gives new location
	 */
    onPlaceChange(place) {
        this.setState({ address: place.address, location: place.location });
    }

    /**
     * Updates state with new stories
     */
    updateRelatedStories(stories) {
        const gallery = this.state.activeGallery;

        gallery.related_stories = stories;

        this.setState({ activeGallery: gallery });
    }

	/**
	 * Updates state with new tags
	 */
    updateTags(tags) {
        const gallery = this.state.activeGallery;
        gallery.tags = tags;

        this.setState({ activeGallery: gallery });
    }


	/**
	 * Updates specific field of gallery
	 */
    updateGallery(key, value) {
        const gallery = this.state.activeGallery;
        gallery[key] = value;

        this.setState({ activeGallery: gallery });
    }


	/**
	 * Called when caption input fires keyUp event
	 */
    handleChangeCaption(e) {
        this.setState({ editedCaption: e.target.value });
        this.refs['gallery-caption'].value = e.target.value;
    }

	/**
	 * Update state gallery to props gallery
     */
    resetState(props) {
        // Reset form
        this.setState({
            activeGallery: clone(props.gallery, true),
            tags: [],
            stories: [],
            assignment: props.gallery.assignment,
            mapLocation: null,
            waiting: false,
            caption: props.gallery.caption || 'No Caption',
        });

        // Remove materialize empty input class
        // $(this.refs['gallery-byline']).removeClass('empty');
        $(this.refs['gallery-caption']).removeClass('empty');
        $(this.refs['gallery-stories-input']).removeClass('empty');
    }

	/**
	 * Changes whether or not edit buttons are enabled
	 * @param  {bool} is
	 */
    editButtonEnabled(is) {
        this.setState({ editButtonEnabled: !is });
    }

	/**
	 * Reverts all changes
	 */
    revert() {
        this.setState({ activeGallery: clone(this.props.gallery, true) });
        this.editButtonEnabled(true);
        this.refs['gallery-caption'].value = this.props.gallery.caption || 'No Caption';
        this.refs['gallery-caption'].className =
            this.refs['gallery-caption'].className.replace(/\bempty\b/, '');
    }

	/**
	 * Removes callery
     */
    remove() {
        if (this.state.waiting) return;
        this.setState({ waiting: true });

        this.props.remove((err) => {
            this.setState({ waiting: false });
            if (err) return $.snackbar({ content: 'Unable to delete gallery' });
            return $.snackbar({ content: 'Gallery deleted' });
        });
    }

	/**
     * Skips gallery
     */
    skip() {
        if (this.state.waiting) return;
        this.setState({ waiting: true });

        this.props.skip((err, id) => {
            this.setState({ waiting: false });
            if (err) return $.snackbar({ content: 'Unable to skip gallery' });

            return $.snackbar({ content: 'Gallery skipped! Click to open', timeout: 5000 })
                .click(() => { window.open('/gallery/' + id) });
        });
    }

	/**
	 * Gets all form data and verifies gallery.
	 */
    verify() {
        // TODO: add support for posts and stories(v2 api doesnt support yet)
        if (this.state.waiting) return null;

        const gallery = this.state.activeGallery;
        const id = gallery.id;
        const tags = !Array.isArray(gallery.tags) ? [] : gallery.tags;
        const assignmentId = gallery.assignment ? gallery.assignment.id : undefined;
        const caption = this.refs['gallery-caption'].value;
        // const posts = gallery.posts.map(p => p.id);

        this.setState({ waiting: true });

        // if (!gallery.related_stories) gallery.related_stories = [];

        // const stories = this.state.activeGallery.related_stories.map((story) => (
        //     (story.new ? `NEW=${JSON.stringify({ title: story.title })}` : story.id)
        // ));

        // necessary? - v2 api doesnt support null values
        // let params = {};
        // [{ id }, { caption }, { tags }, { assignmentId }].forEach((p) => {
        //     if (p) params = Object.assign({}, params, { p });
        // });

        const params = {
            id,
            caption,
            tags,
            assignmment_id: assignmentId,
        };

        if (this.props.activeGalleryType === 'import') {
            params.address = this.state.address;

            if (this.state.location) {
                params.lat = this.state.location.lat;
                params.lon = this.state.location.lng;
            }
        }

//         if (!params.posts || params.posts.length === 0) {
//             this.setState({ waiting: false });

//             return $.snackbar({ content: 'A gallery must have at least one post' });
//         }

        if (this.refs['gallery-caption'].length === 0) {
            this.setState({ waiting: false });

            return $.snackbar({ content: 'A gallery must have a caption' });
        }

        return this.props.verify(params, (err, galleryId) => {
            this.setState({ waiting: false });

            if (err) return $.snackbar({ content: 'Unable to verify gallery' });

            return $.snackbar({
                content: 'Gallery verified! Click to open',
                timeout: 5000,
            }).click(() => {
                const win = window.open(`/gallery/${galleryId}`, '_blank');
                win.focus();
            });
        });
    }

    render() {
        if (!this.props.hasActiveGallery || !this.state.activeGallery) {
            return <div />;
        }

        const { activeGallery } = this.state;
        let location = '';
        let address = '';

        // Map gallery posts into slider elements
        let galleryImages = [];
        if (activeGallery.posts) {
            galleryImages = activeGallery.posts.map((post, i) => {
                if (post.video) {
                    return (
                        <div key={i}>
                            <video
                                data-id={post.id}
                                className="admin-video"
                                preload="none"
                                width="100%"
                                height="100%"
                                controls
                                poster={post.video.replace('/videos', '/images/small').replace('.m3u8', '-thumb00001.jpg')}
                                src={post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')} type="video/mp4"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    );
                }

                return (
                    <div key={i}>
                        <FrescoImage
                            imageClass={'img-responsive'}
                            image={post.image}
                            size={'medium'}
                        />
                    </div>
                );
            });
        }

		// If gallery is a submission,
        if (this.props.activeGalleryType === 'submission') {
            // map polygon points to array.
            if (activeGallery.location) {
                location = activeGallery.location.coordinates[0].map((coord) => (
                    { lat: coord[1], lng: coord[0] }
                ));

                address = activeGallery.address ? activeGallery.address : null;
            }
        } else { // if an import
            if (this.state.location) {
                location = this.state.location;
                address = this.state.address;
            } else {
                address = activeGallery.address ? activeGallery.address : null;
            }
        }

        return (
            <div className="dialog">
                <div
                    className="dialog-body"
                    style={{ visibility: this.props.hasActiveGallery ? 'visible' : 'hidden' }}
                >
                    <div className="gallery-images">
                        <Slider
                            dots
                            infinite={false}
                        >
                            {galleryImages || <div />}
                        </Slider>
                    </div>

                    <textarea
                        type="text"
                        className="form-control floating-label"
                        placeholder="Byline (generated in v2 api - coming soon)"
                        defaultValue={'Byline placeholder'}
                    />

                    <textarea
                        type="text"
                        className="form-control floating-label gallery-caption"
                        placeholder="Caption"
                        onChange={(e) => this.handleChangeCaption(e)}
                        defaultValue={activeGallery.caption ? activeGallery.caption : 'No Caption'}
                        ref="gallery-caption"
                    />

                    <GalleryEditAssignment
                        assignment={activeGallery.assignment}
                        updateGalleryField={this.updateGallery}
                    />

                    <EditTags
                        updateTags={this.updateTags}
                        tags={activeGallery.tags}
                    />

                    <EditStories
                        relatedStories={activeGallery.related_stories}
                        updateRelatedStories={this.updateRelatedStories}
                    />

                    <div style={{ height: '309px' }}>
                        <AutocompleteMap
                            location={location}
                            defaultLocation={address}
                            onPlaceChange={this.onPlaceChange}
                            disabled={this.props.activeGalleryType !== 'import'}
                            hasRadius={false}
                            rerender
                        />
                    </div>
                </div>
                <AdminGalleryEditFoot
                    revert={this.revert}
                    verify={this.verify}
                    skip={this.skip}
                    remove={this.remove}
                    enabled={!this.state.waiting}
                />
            </div>
		);
    }
}

AdminGalleryEdit.propTypes = {
    gallery: PropTypes.object.isRequired,
    hasActiveGallery: PropTypes.bool.isRequired,
    remove: PropTypes.func.isRequired,
    skip: PropTypes.func.isRequired,
    verify: PropTypes.func.isRequired,
    activeGalleryType: PropTypes.string.isRequired,
};

export default AdminGalleryEdit;

