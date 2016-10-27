import React, { PropTypes } from 'react';
import { getAddressFromLatLng } from 'app/lib/location';
import utils from 'utils';
import request from 'superagent';
import api from 'app/lib/api';
import times from 'lodash/times';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import EditPosts from './edit-posts';
import EditByline from './edit-byline';
import EditAssignment from './edit-assignment';
import ExplicitCheckbox from '../global/explicit-checkbox';
import AutocompleteMap from '../global/autocomplete-map';
import ChipInput from '../global/chip-input';
import { LoaderOpacity } from '../global/loader';

/**
 * Gallery Edit Parent Object
 * Component for adding gallery editing to the current view
 */
class Edit extends React.Component {

    state = this.getStateFromProps(this.props);

    componentDidMount() {
        $.material.init();
    }

    // If props has a gallery, and GalleryEdit does not currently have a
    // gallery or the galleries are not the same
    componentWillReceiveProps(nextProps) {
        this.setState(this.getStateFromProps(nextProps));
    }

    /**
     * getStateFromProps
     *
     * @param {object} props
     * @returns {object} initial state from passed props
     */
    getStateFromProps(props) {
        const { gallery } = props;
        if (!gallery) return {};

        return {
            tags: gallery.tags || [],
            stories: gallery.stories,
            assignments: gallery.assignments,
            caption: gallery.caption || 'No Caption',
            posts: gallery.posts,
            articles: gallery.articles,
            rating: gallery.rating,
            is_nsfw: gallery.is_nsfw,
            isOriginalGallery: utils.isOriginalGallery(this.props.gallery),
            uploads: [],
            loading: false,
            ...this.getInitialLocationData(),
            external_account_name: gallery.external_account_name,
            external_source: gallery.external_source,
        };
    }

    onRemove = () => {
        const { gallery } = this.props;
        if (!gallery || !gallery.id || this.state.loading) return;

        this.removeGallery(gallery.id);
    }

    onSave = () => {
        const params = this.getFormData();
        const { gallery, onUpdateGallery } = this.props;
        let { loading, uploads, assignments, isOriginalGallery } = this.state;

        if (!get(gallery, 'id') || !params || loading) return;
        this.setState({ loading: true });
        const postsToDelete = isOriginalGallery ? get(params, 'posts_remove') : [];

        Promise.all([
            this.saveGallery(gallery.id, params),
            this.deletePosts(postsToDelete),
        ])
        .then(res => {
            if (get(res[0], 'posts_new.length')) {
                return Promise.all([
                    res[0],
                    this.uploadFiles(res[0].posts_new, this.getFilesFromUploads()),
                ]);
            }

            return res;
        })
        .then(res => {
            this.hide();
            this.setState({ uploads: [], loading: false }, () => {
                $.snackbar({ content: 'Gallery saved!' });
                onUpdateGallery(Object.assign(res[0], { assignments }));
            });
        })
        .catch(err => {
            $.snackbar({ content: 'There was an error saving the gallery!' });
            this.setState({ loading: false });
        });
    }

    onChangeFileInput(e) {
        const files = e.target.files;
        if (!files || !files.length) return;

        times(files.length, (i) => {
            const file = files[i];
            const type = file.type;

            if (type.indexOf('image') > -1) {
                const reader = new FileReader();
                reader.onload = (r) => {
                    const upload = {
                        type,
                        url: r.target.result,
                        file,
                    };

                    this.setState({ uploads: this.state.uploads.concat(upload) });
                };
                reader.readAsDataURL(file);
            } else if (type.indexOf('video') > -1) {
                const upload = ({
                    type,
                    url: URL.createObjectURL(file),
                    file,
                });

                this.setState({ uploads: this.state.uploads.concat(upload) });
            }
        });

        this.fileInput.value = '';
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
                this.setState({ address, location: data.location });
            });
        }
    }

    onClickClear() {
        if (this.state.loading) return;
        const { gallery } = this.props;

        this.setState({
            tags: [],
            stories: [],
            assignments: [],
            uploads: [],
            address: '',
            caption: 'No Caption',
            articles: [],
            rating: gallery.rating,
            is_nsfw: false,
            external_account_name: '',
            external_source: '',
        });
    }

    /**
     * onScroll - stopPropagation of event
     * (prevents post/list and other parent cmp scroll listeners from triggering)
     *
     * @param {object} e event
     */
    onScroll = (e) => {
        e.stopPropagation();
    }

    getInitialLocationData() {
        const { gallery } = this.props;
        const location = gallery.location || get(gallery, 'posts[0].location');
        const address = gallery.address || get(gallery, 'posts[0].address');

        return { location, address };
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
            stories,
            articles,
            external_account_name,
            external_source,
            rating,
            is_nsfw,
        } = this.state;
        const { gallery } = this.props;
        const postsFormData = this.getPostsFormData();

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        if (!postsFormData) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return null;
        }

        const params = {
            tags,
            caption,
            external_account_name,
            external_source,
            ...postsFormData,
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
            ...utils.getRemoveAddParams('articles', gallery.articles, articles),
            rating,
            is_nsfw,
        };

        // Make sure our params are valid types and don't have any empty arrays
        // Special exception if the param is a `bool`
        return pickBy(params, v => {
            return (typeof(v) === 'boolean' || !!v) && (Array.isArray(v) ? v.length : true);
        });
    }

    getFilesFromUploads() {
        return this.state.uploads.filter(u => !get(u, 'deleteToggled')).map(u => u.file);
    }

    // only set assignment on new posts if gallery isn't
    // curated and all posts belong to same assignment
    getAssignmentParam() {
        const { assignments } = this.state;
        if (!assignments.length) {
            return { assignment_id: null };
        }
        if (assignments.length === 1) {
            return { assignment_id: assignments[0].id };
        }

        return null;
    }

    getPostsFormData() {
        const { gallery } = this.props;
        const files = this.getFilesFromUploads();
        let { posts, rating } = this.state;

        if (!files.length && !posts.length) return null;

        if (files.length) {
            files.forEach((file) => {
                posts = posts.concat({ contentType: file.type, new: true });
            });
        }

        let { posts_new, posts_add, posts_remove } =
            utils.getRemoveAddParams('posts', gallery.posts, posts);

        posts_new = posts_new
            ? posts_new.map(p =>
                Object.assign({}, p, {
                    rating,
                    ...this.getAssignmentParam(),
                }))
            : null;

        return {
            posts_new,
            posts_add,
            posts_remove,
            ...this.getPostsUpdateParams(posts_remove),
        };
    }

    getPostsUpdateParams(removed = []) {
        const { gallery } = this.props;
        const posts = gallery.posts.filter(p => !removed.includes(p.id));
        const { address, location, rating } = this.state;
        // check to see if should save locations on all gallery's posts
        const sameLocation = isEqual(this.getInitialLocationData(), { address, location });
        let params;
        if (sameLocation) {
            params = posts.map(p => {
                return Object.assign(
                    pickBy({
                        id: p.id,
                        rating: rating === 3 ? 2 : rating }, v => !!v),
                    this.getAssignmentParam()
                );
            });
        } else {
            params = posts.map(p => {
                return Object.assign(
                    pickBy({
                        id: p.id,
                        address,
                        lat: location.lat,
                        lng: location.lng,
                        rating: rating === 3 ? 2 : rating }, v => !!v),
                    this.getAssignmentParam()
                );
            });
        }

        return { posts_update: params };
    }

    uploadFiles(posts, files) {
        if (!posts || !files || !files.length) return Promise.resolve;
        const requests = posts.map((p, i) => {
            if (files[i]) {
                return new Promise((resolve, reject) => {
                    request
                    .put(p.upload_url)
                    .set('Content-Type', files[i].type)
                    .send(files[i])
                    .end((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            return Promise.resolve();
        });

        return Promise.all(requests);
    }

    deletePosts(postIds) {
        if (!postIds || !postIds.length) return Promise.resolve();
        return api.post('post/delete', { post_ids: postIds });
    }

    saveGallery(id, params) {
        if (!id || !params) return Promise.resolve();

        return new Promise((resolve, reject) => (
            $.ajax({
                url: `/api/gallery/${id}/update`,
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify(params),
            })
            .done(resolve)
            .fail(reject)
        ));
    }

    removeGallery(id) {
        if (!id || this.state.loading) return;

        alertify.confirm('Are you sure you want to delete this gallery?', (confirmed) => {
            if (!confirmed) return;
            this.setState({ loading: true });

            $.ajax({
                url: `/api/gallery/${id}/delete`,
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json',
            })
            .done(() => {
                $.snackbar({ content: 'Gallery deleted' });
                location.href = document.referrer || '/highlights';
            })
            .fail(() => {
                $.snackbar({ content: 'Unable to delete gallery' });
            })
            .always(() => {
                this.setState({ loading: false });
            });
        });
    }

    /**
	 * Reverts all changes
	 */
    revert() {
        if (this.state.loading) return;

        this.setState(this.getStateFromProps(this.props));
    }

    toggleHighlight(e) {
        this.setState({ rating: e.target.checked ? 3 : 2 });
    }

    toggleIsNSFW = () => {
        this.setState({ is_nsfw: !this.state.is_nsfw });
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

    onToggleDeleteUpload(upload, i) {
        const { uploads } = this.state;
        const deleteToggled = !get(upload, 'deleteToggled', false);
        uploads[i] = Object.assign({}, upload, { deleteToggled });

        this.setState({ uploads });
    }

    hide() {
        this.props.toggle();
    }

    renderAddMore() {
        const { gallery } = this.props;
        if (!gallery || !gallery.posts) return null;

        if (utils.isImportedGallery(gallery)) {
            return (
                <button
                    type="button"
                    onClick={() => this.fileInput.click()}
                    className="btn btn-flat"
                    disabled={this.state.loading}
                >
                    Add More
                </button>
            );
        }

        return null;
    }

    renderMap() {
        const { address, location, isOriginalGallery } = this.state;
        const { gallery } = this.props;
        const mapDisabled = !isOriginalGallery || utils.isSubmittedGallery(gallery);

        return (
            <div className="dialog-col col-xs-12 col-md-5 pull-right">
                <AutocompleteMap
                    address={address}
                    location={location}
                    onPlaceChange={(place) => this.onPlaceChange(place)}
                    onMapDataChange={(data) => this.onMapDataChange(data)}
                    onRadiusUpdate={(r) => this.onRadiusUpdate(r)}
                    hasRadius={false}
                    disabled={mapDisabled}
                    draggable={!mapDisabled}
                    rerender
                />
            </div>
        );
    }

    renderBody() {
        const { gallery } = this.props;
        const {
            stories,
            caption,
            assignments,
            tags,
            rating,
            is_nsfw,
            articles,
            posts,
            uploads,
            isOriginalGallery,
            external_account_name,
            external_source,
        } = this.state;
        if (!gallery) return '';

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    {isOriginalGallery ? (
                        <EditByline
                            gallery={gallery}
                            external_source={external_source}
                            external_account_name={external_account_name}
                            onChangeExtAccountName={(a) =>
                                this.setState({ external_account_name: a })
                            }
                            onChangeExtSource={(s) =>
                                this.setState({ external_source: s })
                            }
                        />
                    ) : ''}

                    <div className="dialog-row">
                        <textarea
                            id="gallery-edit-caption"
                            type="text"
                            className="form-control floating-label"
                            value={caption}
                            placeholder="Caption"
                            onChange={(e) => this.setState({ caption: e.target.value })}
                        />
                    </div>

                    <EditAssignment
                        onChange={a => this.setState({ assignments: a })}
                        assignments={assignments}
                    />

                    <ChipInput
                        model="tags"
                        items={tags}
                        modifyText={(t) => `#${t}`}
                        updateItems={(t) => this.setState({ tags: t })}
                        autocomplete={false}
                        className="dialog-row"
                    />

                    <ChipInput
                        model="stories"
                        queryAttr="title"
                        items={stories}
                        updateItems={(s) => this.setState({ stories: s })}
                        className="dialog-row"
                        createNew={false}
                        autocomplete
                    />

                    <ChipInput
                        model="articles"
                        queryAttr="link"
                        altAttr="title"
                        items={articles}
                        updateItems={(a) => this.setState({ articles: a })}
                        className="dialog-row"
                        createNew
                        search
                    />

                    <div className="dialog-row">
                        <div className="checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={rating === 3}
                                    onChange={(e) => this.toggleHighlight(e)}
                                />
                                Highlighted
                            </label>
                        </div>
                    </div>

                    <ExplicitCheckbox
                        is_nsfw={is_nsfw}
                        onChange={this.toggleIsNSFW}
                    />
                </div>

                {get(posts, 'length') || get(uploads, 'length') ? (
                    <EditPosts
                        originalPosts={gallery.posts}
                        editingPosts={posts}
                        uploads={uploads}
                        onToggleDeletePost={p => this.onToggleDeletePost(p)}
                        onToggleDeleteUpload={(u, i) => this.onToggleDeleteUpload(u, i)}
                        className="dialog-col col-xs-12 col-md-5"
                        canDelete
                    />
                ) : null}

                {this.renderMap()}
            </div>
        );
    }

    renderFooter() {
        const { gallery } = this.props;
        const { loading, isOriginalGallery } = this.state;
        if (!gallery) return '';

        return (
            <div className="dialog-foot">
                <input
                    id="gallery-upload-files"
                    type="file"
                    accept="image/*,video/*,video/mp4"
                    ref={(r) => { this.fileInput = r; }}
                    style={{ display: 'none' }}
                    disabled={loading}
                    onChange={(e) => this.onChangeFileInput(e)}
                    multiple
                />

                <button
                    type="button"
                    onClick={() => this.revert()}
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Revert changes
                </button>

                <button
                    type="button"
                    onClick={() => this.onClickClear()}
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Clear all
                </button>

                {this.renderAddMore()}

                <button
                    type="button"
                    onClick={this.onSave}
                    className="btn btn-flat pull-right"
                    disabled={loading}
                >
                    Save
                </button>

                {isOriginalGallery ? (
                    <button
                        type="button"
                        onClick={() =>
                            this.setState({ rating: (gallery.rating < 2 ? 2 : 1) }, this.onSave)}
                        className="btn btn-flat pull-right"
                        disabled={loading}
                    >
                        {(gallery.rating < 2) ? 'Verify' : 'Unverify'}
                    </button>
                ) : null}

                <button
                    type="button"
                    onClick={this.onRemove}
                    className="btn btn-flat pull-right"
                    disabled={loading}
                >
                    Delete
                </button>

                <button
                    type="button"
                    onClick={() => this.hide()}
                    className="btn btn-flat pull-right toggle-gedit toggler"
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        );
    }

    render() {
        const { visible } = this.props;
        const { loading } = this.state;

        return (
            <div onScroll={this.onScroll}>
                <div className={`dim toggle-edit ${visible ? 'toggled' : ''}`} />
                <div
                    className={`edit panel panel-default toggle-edit
                    gedit ${visible ? 'toggled' : ''}`}
                >
                    <div className="col-xs-12 col-lg-12 edit-new dialog">
                        <div className="dialog-head">
                            <span className="md-type-title">Edit Gallery</span>
                            <span
                                className="mdi mdi-close pull-right icon toggle-edit toggler"
                                onClick={() => this.hide()}
                            />
                        </div>

                        {this.renderBody()}

                        {this.renderFooter()}
                    </div>

                    <LoaderOpacity visible={loading} />
                </div>
            </div>
        );
    }
}

Edit.propTypes = {
    gallery: PropTypes.object.isRequired,
    toggle: PropTypes.func.isRequired,
    onUpdateGallery: PropTypes.func,
    visible: PropTypes.bool.isRequired,
};

Edit.defaultProps = {
    onUpdateGallery: () => {},
};

export default Edit;

