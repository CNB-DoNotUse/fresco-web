import React, { PropTypes } from 'react';
import Slider from 'react-slick';
import AutocompleteMap from '../global/autocomplete-map';
import EditTags from './../editing/gallery-edit-tags';
import EditStories from './../editing/gallery-edit-stories';
import GalleryEditAssignment from './../editing/gallery-edit-assignment';
import FrescoImage from '../global/fresco-image';
import utils from 'utils';

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
            tags: activeGallery.tags || [],
            stories: activeGallery.stories,
            assignment: activeGallery.assignment,
            address: activeGallery.address,
            loading: false,
            caption: activeGallery.caption || 'No Caption',
        };
    }

    getFormData() {
        const {
            tags,
            caption,
            address,
            location,
        } = this.state;

        this.setState({ loading: true });

        // const stories = this.state.activeGallery.related_stories.map((story) => (
        //     (story.new ? `NEW=${JSON.stringify({ title: story.title })}` : story.id)
        // ));

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        const params = {
            tags,
            caption,
            address,
            geo: utils.getGeoFromCoord(location),
        };

        return params;
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
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
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
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                rating: 1,
            }),
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
	 */
    verify() {
        const id = this.state.activeGallery.id;
        const params = this.getFormData();

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'POST',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
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
        this.setState({ stories });
    }

	/**
	 * Updates state with new tags
	 */
    updateTags(tags) {
        this.setState({ tags });
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
        this.setState({ caption: e.target.value });
    }

    renderPosts() {
        const { activeGallery } = this.state;
        if (!activeGallery.posts) return <div />;
        // Map gallery posts into slider elements
        return activeGallery.posts.map((post, i) => {
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

    render() {
        const { hasActiveGallery, galleryType } = this.props;
        const {
            activeGallery,
            location,
            address,
            stories,
            tags,
            caption,
        } = this.state;

        if (!hasActiveGallery || !activeGallery) {
            return <div />;
        }

        return (
            <div className="dialog admin-edit-pane">
                <div
                    className="dialog-body"
                    style={{ visibility: hasActiveGallery ? 'visible' : 'hidden' }}
                >
                    <div className="gallery-images">
                        <Slider
                            dots
                            infinite={false}
                        >
                            {this.renderPosts()}
                        </Slider>
                    </div>

                    <textarea
                        type="text"
                        className="form-control floating-label gallery-caption"
                        placeholder="Caption"
                        onChange={(e) => this.handleChangeCaption(e)}
                        defaultValue={caption}
                        ref="gallery-caption"
                    />

                    <GalleryEditAssignment
                        assignment={activeGallery.assignment}
                        updateGalleryField={(k, v) => this.updateGallery(k, v)}
                    />

                    <EditTags
                        updateTags={(t) => this.updateTags(t)}
                        tags={tags}
                    />

                    <EditStories
                        relatedStories={stories}
                        updateRelatedStories={(s) => this.updateStories(s)}
                    />

                    <AutocompleteMap
                        location={location}
                        defaultLocation={address}
                        onPlaceChange={(p) => this.onPlaceChange(p)}
                        disabled={galleryType === 'submissions'}
                        hasRadius={false}
                        rerender
                    />
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
    galleryType: PropTypes.string.isRequired,
    onUpdateGallery: PropTypes.func.isRequired,
};

export default GalleryEdit;

