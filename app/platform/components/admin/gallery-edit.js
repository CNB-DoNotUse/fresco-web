import React, { PropTypes } from 'react';
import Slider from 'react-slick';
import AutocompleteMap from '../global/autocomplete-map';
import EditTags from './../gallery/edit-tags';
import EditStories from './../gallery/edit-stories';
import EditAssignment from './../gallery/edit-assignment';
import EditByline from './../gallery/edit-byline';
import FrescoImage from '../global/fresco-image';
import utils from 'utils';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

/**
 *	Admin Gallery Edit component.
 *	Delete, Skip, Verify galleries
 */
class GalleryEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.gallery.id !== nextProps.gallery.id) {
            this.setState(this.getStateFromProps(nextProps));
            this.refs['gallery-caption'].className =
                this.refs['gallery-caption'].className.replace(/\bempty\b/, '');
        }
    }

	/**
	 * Updates state map location when AutocompleteMap gives new location
	 */
    onPlaceChange(place) {
        this.setState({ address: place.address, location: place.location });
    }

    /**
     * Updates state map location when AutocompleteMap gives new location from drag
     */
    onMapDataChange(data) {
        if (data.source === 'markerDrag') {
            const geocoder = new google.maps.Geocoder();

            geocoder.geocode({ location: {
                lat: data.location.lat,
                lng: data.location.lng,
            } },
            (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    this.setState({
                        address: results[0].formatted_address,
                        location: data.location,
                    });
                }
            });
        }
    }

    onVerify() {
        const { gallery } = this.props;
        const params = this.getFormData();
        params.rating = 2;

        this.verify(gallery.id, params);
    }

    getStateFromProps(props) {
        const { gallery } = props;

        return {
            editButtonsEnabled: false,
            tags: gallery.tags || [],
            stories: gallery.stories || [],
            assignment: null,
            caption: gallery.caption || 'No Caption',
            loading: false,
            external_account_name: gallery.external_account_name,
            external_source: gallery.external_source,
            ...this.getInitialLocationData(),
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
            stories,
            assignment,
            external_account_name,
            external_source,
        } = this.state;
        const { gallery } = this.props;

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        const params = {
            tags,
            caption,
            address,
            ...this.getPostsLocationsParams(),
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
            assignment_id: assignment ? assignment.id : null,
            external_account_name,
            external_source,
        };

        return params;
    }

    getPostsLocationsParams() {
        const { gallery } = this.props;
        const { address, location } = this.state;
        // check to see if should save locations on all gallery's posts
        if ((isEqual(this.getInitialLocationData(), { address, location }))
            || (!gallery.posts || !gallery.posts.length)) {
            return null;
        }

        return {
            posts_update: gallery.posts.map(p => ({
                id: p.id,
                address,
                lat: location.lat,
                lng: location.lng,
            })),
        };
    }

    getInitialLocationData() {
        const { gallery } = this.props;
        const location = gallery.location || get(gallery, 'posts[0].location');
        const address = gallery.address || get(gallery, 'posts[0].address');

        return { location, address };
    }

	/**
	 * Gets all form data and verifies gallery.
	 */
    verify(id, params) {
        if (!id || !params || this.state.loading) return;
        const { onUpdateGallery } = this.props;
        this.setState({ loading: true });

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'POST',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            onUpdateGallery(id);
            $.snackbar({
                content: 'Gallery verified! Click to open',
                timeout: 5000,
            }).click(() => {
                const win = window.open(`/gallery/${id}`, '_blank');
                win.focus();
            });
        })
        .fail(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Unable to verify gallery' });
        });
    }

	/**
	 * Removes callery
     */
    remove(id) {
        if (!id || this.state.loading) return;
        this.setState({ loading: true });
        const { onUpdateGallery } = this.props;

        $.ajax({
            url: `/api/gallery/${id}/delete`,
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            onUpdateGallery(id);
            $.snackbar({ content: 'Gallery deleted' });
        })
        .fail(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Unable to delete gallery' });
        });
    }

	/**
     * Skips gallery
     */
    skip(id) {
        if (!id || this.state.loading) return;
        this.setState({ loading: true });
        const { onUpdateGallery } = this.props;

        $.ajax({
            url: `/api/gallery/${id}/update`,
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                rating: 1,
            }),
        })
        .done(() => {
            onUpdateGallery(id);
            $.snackbar({ content: 'Gallery skipped! Click to open', timeout: 5000 })
                .click(() => { window.open(`/gallery/${id}`); });
        })
        .fail(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Unable to skip gallery' });
        });
    }

	/**
	 * Reverts all changes
	 */
    revert() {
        if (this.state.loading) return;

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
            if (post.stream) {
                return (
                    <div key={i}>
                        <video
                            data-id={post.id}
                            className="admin-video"
                            preload="none"
                            width="100%"
                            height="100%"
                            controls
                            poster={post.stream.replace('/videos', '/images/small').replace('.m3u8', '-thumb00001.jpg')}
                            src={post.stream.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')} type="video/mp4"
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
        const { gallery, galleryType } = this.props;
        const {
            location,
            address,
            stories,
            tags,
            caption,
            assignment,
            loading,
            external_account_name,
            external_source,
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

                    <EditByline
                        gallery={gallery}
                        external_account_name={external_account_name}
                        external_source={external_source}
                        onChangeExtAccountName={(a) =>
                                this.setState({ external_account_name: a })}
                        onChangeExtSource={(s) =>
                                this.setState({ external_source: s })}
                    />

                    <textarea
                        type="text"
                        className="form-control floating-label gallery-caption"
                        placeholder="Caption"
                        onChange={(e) => this.handleChangeCaption(e)}
                        value={caption}
                        ref="gallery-caption"
                    />

                    <EditAssignment
                        gallery={gallery}
                        assignment={assignment}
                        updateAssignment={(a) => this.setState({ assignment: a })}
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
                        onMapDataChange={(data) => this.onMapDataChange(data)}
                        disabled={galleryType === 'submissions'}
                        hasRadius={false}
                        draggable
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
                        onClick={() => this.skip(gallery.id)}
                        disabled={loading}
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-delete"
                        onClick={() => this.remove(gallery.id)}
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
    onUpdateGallery: PropTypes.func.isRequired,
};

export default GalleryEdit;

