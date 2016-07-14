import React, { PropTypes } from 'react';
import Slider from 'react-slick';
import AutocompleteMap from '../global/autocomplete-map';
import EditTags from './../editing/gallery-edit-tags';
import EditStories from './../editing/gallery-edit-stories';
import GalleryEditAssignment from './../editing/gallery-edit-assignment';
import FrescoImage from '../global/fresco-image';

/**
 *	Admin Submission Edit component.
 *	Delete, Skip, Verify imported
 */
class GalleryEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentDidMount() {
        $.material.init();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.gallery.id !== nextProps.gallery.id) {
            this.revert();
        }
    }

	/**
	 * Updates state map location when AutocompleteMap gives new location
	 */
    onPlaceChange(place) {
        this.setState({ address: place.address, location: place.location });
    }

    getStateFromProps(props) {
        const activeGallery = props.gallery;

        return {
            activeGallery,
            editButtonsEnabled: false,
            tags: activeGallery.tags,
            stories: activeGallery.stories,
            assignment: activeGallery.assignment,
            address: activeGallery.address,
            loading: false,
            caption: activeGallery.caption || 'No Caption',
        };
    }

    getFormData() {
        if (this.state.loading) return;

        const gallery = this.state.activeGallery;
        const id = gallery.id;
        const tags = !Array.isArray(gallery.tags) ? [] : gallery.tags;
        const assignmentId = gallery.assignment ? gallery.assignment.id : null;
        const caption = this.refs['gallery-caption'].value;
        // const posts = gallery.posts.map(p => p.id);

        this.setState({ loading: true });

        // const stories = this.state.activeGallery.related_stories.map((story) => (
        //     (story.new ? `NEW=${JSON.stringify({ title: story.title })}` : story.id)
        // ));

        const params = {
            id,
            caption,
            tags,
            assignment_id: assignmentId,
        };

        if (this.props.activeGalleryType === 'import') {
            params.address = this.state.address;

            if (this.state.location) {
                params.lat = this.state.location.lat;
                params.lon = this.state.location.lng;
            }
        }

        if (!params.posts || params.posts.length === 0) {
            this.setState({ loading: false });
            $.snackbar({ content: 'A gallery must have at least one post' });
            return;
        }

        if (this.refs['gallery-caption'].length === 0) {
            this.setState({ loading: false });
            $.snackbar({ content: 'A gallery must have a caption' });
            return;
        }
    }

	/**
	 * Removes callery
     */
    remove() {
        if (this.state.loading) return;
        this.setState({ loading: true });
        const id = this.state.activeGallery.id;

        $.ajax({
            url: `/api/gallery/${id}/delete`,
            method: 'post',
            contentType: 'application/json',
            dataType: 'json',
            success: () => {
                this.props.onUpdateGallery(id);
                $.snackbar({ content: 'Gallery deleted' });
            },
            error: () => {
                $.snackbar({ content: 'Unable to delete gallery' });
            },
            done: () => {
                this.setState({ loading: false });
            },
        });
    }

	/**
     * Skips gallery
     */
    skip() {
        if (this.state.loading) return;
        this.setState({ loading: true });
        const id = this.state.activeGallery.id;

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                rating: 1,
            }),
            dataType: 'json',
            success: () => {
                this.props.onUpdateGallery(id);
                $.snackbar({ content: 'Gallery skipped! Click to open', timeout: 5000 })
                    .click(() => { window.open('/gallery/' + id); });
            },
            error: () => {
                $.snackbar({ content: 'Unable to skip gallery' });
            },
            done: () => {
                this.setState({ loading: false });
            },
        });
    }

	/**
	 * Gets all form data and verifies gallery.
     * TODO: add support for posts and stories(v2 api doesnt support yet)
	 */
    verify() {
        const id = this.state.activeGallery.id;
        const params = this.getFormData();

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(params),
            dataType: 'json',
            success: () => {
                this.onUpdateGallery(id);
                $.snackbar({
                    content: 'Gallery verified! Click to open',
                    timeout: 5000,
                }).click(() => {
                    const win = window.open(`/gallery/${id}`, '_blank');
                    win.focus();
                });
            },
            error: () => {
                $.snackbar({ content: 'Unable to verify gallery' });
            },
            done: () => {
                this.setState({ loading: false });
            },
        });
    }

	/**
	 * Reverts all changes
	 */
    revert() {
        if (this.state.loading) return;

        this.setState(this.getStateFromProps(this.props));
        this.refs['gallery-caption'].value = this.props.gallery.caption || 'No Caption';
        this.refs['gallery-caption'].className =
            this.refs['gallery-caption'].className.replace(/\bempty\b/, '');
        $(this.refs['gallery-stories-input']).removeClass('empty');
    }

    /**
     * Updates state with new stories
     */
    updateStories(stories) {
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

    render() {
        const { hasActiveGallery, activeGalleryType } = this.props;
        const { activeGallery } = this.state;

        if (!hasActiveGallery || !activeGallery) {
            return <div />;
        }

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
        if (activeGalleryType === 'submission') {
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
            <div className="dialog admin-edit-pane">
                <div className="dialog-body" style={{ visibility: hasActiveGallery ? 'visible' : 'hidden' }}>
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
                        className="form-control floating-label gallery-caption"
                        placeholder="Caption"
                        onChange={(e) => this.handleChangeCaption(e)}
                        defaultValue={activeGallery.caption}
                        ref="gallery-caption"
                    />

                    <GalleryEditAssignment
                        assignment={activeGallery.assignment}
                        updateGalleryField={() => this.updateGallery()}
                    />

                    <EditTags
                        updateTags={() => this.updateTags()}
                        tags={activeGallery.tags}
                    />

                    <EditStories
                        relatedStories={activeGallery.stories}
                        updateRelatedStories={(stories) => this.updateStories(stories)}
                    />

                    <div style={{ height: '309px' }}>
                        <AutocompleteMap
                            location={location}
                            defaultLocation={address}
                            onPlaceChange={() => this.onPlaceChange()}
                            disabled={activeGalleryType !== 'import'}
                            hasRadius={false}
                            rerender
                        />
                    </div>
                </div>
                <div className="dialog-foot">
                    <button
                        type="button"
                        className="btn btn-flat gallery-revert"
                        onClick={() => this.revert()}
                        disabled={this.state.loading}
                    >
                        Revert changes
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-verify"
                        onClick={() => this.verify()}
                        disabled={this.state.loading}
                    >
                        Verify
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-skip"
                        onClick={() => this.skip()}
                        disabled={this.state.loading}
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-delete"
                        onClick={() => this.remove()}
                        disabled={this.state.loading}
                    >
                        Delete
                    </button>
                </div>
            </div>
		);
    }
}

GalleryEdit.propTypes = {
    gallery: PropTypes.object.isRequired,
    hasActiveGallery: PropTypes.bool.isRequired,
    activeGalleryType: PropTypes.string.isRequired,
    onUpdateGallery: PropTypes.func.isRequired,
};

export default GalleryEdit;

