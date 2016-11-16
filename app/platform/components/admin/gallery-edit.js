import React, { PropTypes } from 'react';
import { getAddressFromLatLng } from 'app/lib/location';
import utils from 'utils';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import get from 'lodash/get';
import api from 'app/lib/api';
import { isImportedGallery } from 'app/lib/models';
import AutocompleteMap from '../global/autocomplete-map';
import ExplicitCheckbox from '../global/explicit-checkbox';
import ChipInput from '../global/chip-input';
import EditPosts from './../gallery/edit-posts';
import EditByline from './../gallery/edit-byline';

/**
 *	Admin Gallery Edit component.
 *	Delete, Skip, Verify galleries
 */
export default class GalleryEdit extends React.Component {
    static propTypes = {
        gallery: PropTypes.object.isRequired,
        galleryType: PropTypes.string.isRequired,
        onUpdateGallery: PropTypes.func.isRequired,
    };

    state = this.getStateFromProps(this.props);

    componentDidUpdate(prevProps) {
        if (this.props.gallery.id !== prevProps.gallery.id) {
            this.setState(this.getStateFromProps(this.props));
            this.galleryCaption.className = this.galleryCaption.className.replace(/\bempty\b/, '');
        }
    }

    getStateFromProps(props) {
        const { gallery } = props;

        return {
            assignment: get(gallery, 'assignments[0]'),
            editButtonsEnabled: false,
            tags: gallery.tags || [],
            stories: gallery.stories || [],
            caption: gallery.caption || 'No Caption',
            loading: false,
            external_account_name: gallery.external_account_name,
            external_source: gallery.external_source,
            rating: gallery.rating,
            posts: gallery.posts,
            is_nsfw: gallery.is_nsfw,
            owner: gallery.owner,
            ...this.getInitialLocationData(),
        };
    }

    /**
     * Reverts all changes
     */
    onRevert = () => {
        if (this.state.loading) return;

        this.setState(this.getStateFromProps(this.props));
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
        const params = { ...this.getPostsParams(), rating };

        api
        .post(`gallery/${gallery.id}/update`, params)
        .then(() => {
            onUpdateGallery(gallery.id);
            $.snackbar({ content: 'Gallery skipped! Click to open', timeout: 5000 })
                .click(() => { window.open(`/gallery/${gallery.id}`); });
        })
        .catch(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Unable to skip gallery' });
        });
    }

    onToggleDeletePost(post) {
        let { posts } = this.state;
        if (posts.some(p => p.id === post.id)) {
            posts = posts.filter(p => p.id !== post.id);
        } else {
            posts = posts.concat(post);
        }

        this.setState({ posts });
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
            external_account_name,
            external_source,
            rating,
            is_nsfw,
            posts,
            owner,
        } = this.state;
        const { gallery } = this.props;

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        let params = {
            tags,
            caption,
            address,
            is_nsfw,
            ...this.getPostsParams(),
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
            external_account_name,
            external_source,
            rating,
            owner_id: owner ? owner.id : null,
        };

        // Make sure our params are valid types and don't have any empty arrays
        // Special exception if the param is a `bool`
        params = pickBy(params, (v, k) => {
            if (gallery[k] === v) return false;
            return (typeof(v) === 'boolean' || !!v) && (Array.isArray(v) ? v.length : true);
        });

        return params;
    }

    getPostsParams() {
        const { gallery } = this.props;
        const { address, location, rating, assignment } = this.state;
        const { posts_remove } = utils.getRemoveAddParams('posts', gallery.posts, this.state.posts);

        // check to see if should save locations on all gallery's posts
        const posts = this.state.posts.filter(p => !posts_remove.includes(p.id));
        const sameLocation = isEqual(this.getInitialLocationData(), { address, location });
        let posts_update;

        if (sameLocation || !posts) {
            posts_update = posts.map(p => ({
                id: p.id,
                rating,
                assignment_id: assignment ? assignment.id : null,
            }));
        }

        // filter out unchanged params
        posts_update = posts.map(p => pickBy({
            id: p.id,
            address,
            lat: location.lat,
            lng: location.lng,
            rating,
            assignment_id: assignment ? assignment.id : null,
        }, (v, k) => k === 'id' || p[k] !== v));

        return { posts_update, posts_remove };
    }

    getInitialLocationData() {
        const { gallery } = this.props;
        const location = gallery.location || get(gallery, 'posts[0].location');
        const address = gallery.address || get(gallery, 'posts[0].address');

        return { location, address };
    }

    /**
     * Updates state with new stories
     */
    updateStories = (stories) => {
        this.setState({ stories });
    }

    onChangeIsNSFW = () => {
        this.setState({ is_nsfw: !this.state.is_nsfw });
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
            is_nsfw,
            posts,
            owner,
        } = this.state;

        if (!gallery) {
            return <div />;
        }

        return (
            <div className="dialog admin-edit-pane">
                <div className="dialog-body" style={{ visibility: 'visible' }} >
                    <div className="gallery-images">
                        <EditPosts
                            originalPosts={gallery.posts}
                            editingPosts={posts}
                            onToggleDeletePost={p => this.onToggleDeletePost(p)}
                            canDelete
                            refreshInterval
                        />
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
                        className="form-control floating-label"
                        placeholder="Caption"
                        onChange={(e) => this.handleChangeCaption(e)}
                        value={caption}
                        ref={r => { this.galleryCaption = r; }}
                    />

                    <ChipInput
                        model="assignments"
                        placeholder="Assignment"
                        queryAttr="title"
                        items={assignment ? [assignment] : []}
                        updateItems={a => this.setState({ assignment: a[0] })}
                        multiple={false}
                        className="dialog-row"
                        autocomplete
                    />

                    <ChipInput
                        model="tags"
                        items={tags}
                        updateItems={(t) => this.setState({ tags: t })}
                        autocomplete={false}
                        multiple
                    />

                    <ChipInput
                        model="stories"
                        queryAttr="title"
                        items={stories}
                        updateItems={this.updateStories}
                        className="dialog-row"
                        autocomplete
                    />

                    {isImportedGallery(gallery) && (
                        <ChipInput
                            model="users"
                            placeholder="Owner"
                            queryAttr="full_name"
                            altAttr="username"
                            items={owner ? [owner] : []}
                            updateItems={u => this.setState({ owner: u[0] })}
                            className="dialog-row"
                            createNew={false}
                            multiple={false}
                            search
                        />
                    )}

                    <ExplicitCheckbox
                        is_nsfw={is_nsfw}
                        onChange={this.onChangeIsNSFW}
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
                        className="btn btn-flat"
                        onClick={this.onRevert}
                        disabled={loading}
                    >
                        Revert changes
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat pull-right"
                        onClick={() => this.setState({ rating: 2 }, () => this.onVerify())}
                        disabled={loading}
                    >
                        Verify
                    </button>
                    {galleryType === 'submissions' && (
                        <button
                            type="button"
                            className="btn btn-flat pull-right"
                            onClick={() => this.setState({ rating: 1 }, () => this.onSkip())}
                            disabled={loading}
                        >
                            Skip
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-flat pull-right"
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

