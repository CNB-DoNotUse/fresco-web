import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import EditTags from './../gallery/edit-tags';
import EditStories from './../gallery/edit-stories';
import EditPosts from './../gallery/edit-posts';
import EditAssignment from './../gallery/edit-assignment';
import EditByline from './../gallery/edit-byline';
import { getAddressFromLatLng } from 'app/lib/location';
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
            getAddressFromLatLng(data.location, (address) => {
                this.setState({
                    address,
                    location: data.location,
                });
            });
        }
    }


	/**
	 * Gets all form data and verifies gallery.
	 */
    onVerify() {
        if (this.state.loading) return;
        this.setState({ loading: true });
        const { onUpdateGallery, gallery } = this.props;
        const params = this.getFormData();

        $.ajax({
            url: `/api/gallery/${gallery.id}/update`,
            method: 'POST',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            onUpdateGallery(gallery.id);
            $.snackbar({
                content: 'Gallery verified! Click to open',
                timeout: 5000,
            }).click(() => {
                const win = window.open(`/gallery/${gallery.id}`, '_blank');
                win.focus();
            });
        })
        .fail(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Unable to verify gallery' });
        });
    }

	/**
	 * Removes gallery
     */
    onRemove() {
        if (this.state.loading) return;
        this.setState({ loading: true });
        const { onUpdateGallery, gallery } = this.props;

        $.ajax({
            url: `/api/gallery/${gallery.id}/delete`,
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            onUpdateGallery(gallery.id);
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
    onSkip() {
        if (this.state.loading) return;
        this.setState({ loading: true });
        const { onUpdateGallery, gallery } = this.props;
        const { rating } = this.state;

        $.ajax({
            url: `/api/gallery/${gallery.id}/update`,
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ rating }),
        })
        .done(() => {
            onUpdateGallery(gallery.id);
            $.snackbar({ content: 'Gallery skipped! Click to open', timeout: 5000 })
                .click(() => { window.open(`/gallery/${gallery.id}`); });
        })
        .fail(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Unable to skip gallery' });
        });
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
            rating: gallery.rating,
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
            rating,
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
            ...this.getPostsUpdateParams(),
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
            assignment_id: assignment ? assignment.id : null,
            external_account_name,
            external_source,
            rating,
        };

        return params;
    }

    getPostsUpdateParams() {
        const { gallery } = this.props;
        const { address, location, rating } = this.state;
        // check to see if should save locations on all gallery's posts
        if ((isEqual(this.getInitialLocationData(), { address, location }))
            || (!gallery.posts || !gallery.posts.length)) {
                return {
                    posts_update: gallery.posts.map(p => ({
                        id: p.id,
                        rating,
                    })),
                };
        }

        return {
            posts_update: gallery.posts.map(p => ({
                id: p.id,
                address,
                lat: location.lat,
                lng: location.lng,
                rating,
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
                        <EditPosts originalPosts={gallery.posts} />
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
                        draggable={galleryType !== 'submissions'}
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
                        onClick={() => this.setState({ rating: 2 },
                            () => this.onVerify())}
                        disabled={loading}
                    >
                        Verify
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-skip"
                        onClick={() => this.setState({ rating: 2 },
                            () => this.onSkip())}
                        disabled={loading}
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right gallery-delete"
                        onClick={() => this.onRemove()}
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

