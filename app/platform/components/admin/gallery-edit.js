import React, { PropTypes } from 'react';
import Slider from 'react-slick';
import AutocompleteMap from '../global/autocomplete-map';
import EditTags from './../gallery/edit-tags';
import EditStories from './../gallery/edit-stories';
import EditAssignment from './../gallery/edit-assignment';
import FrescoImage from '../global/fresco-image';
import utils from 'utils';

/**
 *	Admin Gallery Edit component.
 *	Delete, Skip, Verify galleries
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

    onVerify() {
        const { gallery, verify } = this.props;
        const params = this.getFormData();
        params.rating = 2;

        verify(gallery.id, params);
    }

    getStateFromProps(props) {
        const { gallery } = props;
        const location = gallery.location || gallery.posts ? gallery.posts[0].location : null;
        const address = gallery.address || gallery.posts ? gallery.posts[0].address : null;

        return {
            editButtonsEnabled: false,
            tags: gallery.tags || [],
            stories: gallery.stories,
            assignment: gallery.assignment,
            caption: gallery.caption || 'No Caption',
            location,
            address,
        };
    }

    /**
     * getFormData
     *
     * @returns {Object} Form Data Object
     */
    getFormData() {
        const {
            tags,
            caption,
            address,
            location,
            stories,
            assignment,
        } = this.state;

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        const params = {
            tags,
            caption,
            address,
            geo: utils.getGeoFromCoord(location),
            stories,
            assignment_id: assignment ? assignment.id : null,
        };

        return params;
    }

	/**
	 * Reverts all changes
	 */
    revert() {
        if (this.props.loading) return;

        this.setState(this.getStateFromProps(this.props));
        this.refs['gallery-caption'].className =
            this.refs['gallery-caption'].className.replace(/\bempty\b/, '');
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

    updateAssignment(assignment) {
        this.setState({ assignment });
    }

	/**
	 * Called when caption input fires keyUp event
	 */
    handleChangeCaption(e) {
        this.setState({ caption: e.target.value });
    }

    renderPosts() {
        const { gallery } = this.props;
        if (!gallery.posts) return <div />;
        // Map gallery posts into slider elements
        return gallery.posts.map((post, i) => {
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
        const { gallery, galleryType, loading, skip, remove } = this.props;
        const {
            location,
            address,
            stories,
            tags,
            caption,
            assignment,
        } = this.state;

        if (!gallery) {
            return <div />;
        }

        return (
            <div className="dialog admin-edit-pane">
                <div className="dialog-body" style={{ visibility: 'visible' }} >
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
                        value={caption}
                        ref="gallery-caption"
                    />

                    <EditAssignment
                        assignment={assignment}
                        updateAssignment={(a) => this.updateAssignment(a)}
                    />

                    <EditTags
                        updateTags={(t) => this.updateTags(t)}
                        tags={tags}
                    />

                    <EditStories
                        stories={stories}
                        updateStories={(s) => this.updateStories(s)}
                    />

                    <AutocompleteMap
                        location={location}
                        address={address}
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
                        disabled={loading}
                    >
                        Revert changes
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-verify"
                        onClick={() => this.onVerify()}
                        disabled={loading}
                    >
                        Verify
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-skip"
                        onClick={() => skip(gallery.id)}
                        disabled={loading}
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-delete"
                        onClick={() => remove(gallery.id)}
                        disabled={loading}
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
    galleryType: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    skip: PropTypes.func.isRequired,
    verify: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
};

export default GalleryEdit;

