import React, { PropTypes } from 'react';
import { getAddressFromLatLng } from 'app/lib/location';
import utils from 'utils';
import request from 'superagent';
import times from 'lodash/times';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import EditPosts from './edit-posts';
import EditByline from './edit-byline';
import AutocompleteMap from '../global/autocomplete-map';
import ChipInput from '../global/chip-input';
import { LoaderOpacity } from '../global/loader';

/**
 * Gallery Edit Parent Object
 * Component for adding gallery editing to the current view
 */
class Edit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

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
            assignment: null,
            caption: gallery.caption || 'No Caption',
            posts: gallery.posts,
            articles: gallery.articles,
            rating: gallery.rating,
            isOriginalGallery: utils.isOriginalGallery(this.props.gallery),
            uploads: [],
            loading: false,
            ...this.getInitialLocationData(),
            external_account_name: gallery.external_account_name,
            external_source: gallery.external_source,
        };
    }

    onRemove() {
        const { gallery } = this.props;
        if (!gallery || !gallery.id || this.state.loading) return;

        this.removeGallery(gallery.id);
    }

    onSave = () => {
        const params = this.getFormData();
        const { gallery, onUpdateGallery } = this.props;
        if (!get(gallery, 'id') || !params || this.state.loading) return;
        this.setState({ loading: true });

        Promise.all([
            this.saveGallery(gallery.id, params),
            this.deletePosts(get(params, 'posts_remove')),
        ])
        .then((res) => {
            if (get(res[0], 'posts_new.length')) {
                return Promise.all([
                    res[0],
                    this.uploadFiles(res[0].posts_new, this.fileInput.files),
                ]);
            }

            return res;
        })
        .then((res) => {
            this.hide();
            this.setState({ uploads: [], loading: false }, () => {
                $.snackbar({ content: 'Gallery saved!' });
                onUpdateGallery(res[0]);
            });
        })
        .catch(() => {
            $.snackbar({ content: 'There was an error saving the gallery!' });
            this.setState({ loading: false });
        });
    }

    onChangeFileInput(e) {
        const file = e.target.files[0];
        if (!file) return;

        const type = file.type;
        const { uploads } = this.state;

        if(type.indexOf('image') > -1) {
            const reader = new FileReader();
            reader.onload = (r) => {
                uploads.unshift({ type, url: r.target.result })
                this.setState({ uploads });
            };
            reader.readAsDataURL(file);
        } else if(type.indexOf('video') > -1){
            uploads.unshift({
                type,
                url: URL.createObjectURL(file)
            });

            this.setState({ uploads });
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

    onClickClear() {
        if (this.state.loading) return;
        const { gallery } = this.props;

        this.setState({
            tags: [],
            stories: [],
            assignment: null,
            uploads: [],
            address: '',
            caption: 'No Caption',
            articles: [],
            rating: gallery.rating,
            external_account_name: '',
            external_source: '',
        });
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
            assignment,
            external_account_name,
            external_source,
            rating,
        } = this.state;
        const { gallery } = this.props;
        const posts = this.getPostsFormData();

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        if (!posts) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return null;
        }

        const params = {
            tags,
            caption,
            external_account_name,
            external_source,
            ...this.getPostsFormData(),
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
            ...utils.getRemoveAddParams('articles', gallery.articles, articles),
            assignment_id: assignment ? assignment.id : null,
            rating,
        };

        return pickBy(params, v => !!v && (Array.isArray(v) ? v.length : true));
    }

    getPostsFormData() {
        const { gallery } = this.props;
        const files = this.fileInput.files;
        let { posts, rating } = this.state;

        if (!files.length && !posts.length) return null;

        if (files.length) {
            times(files.length, (i) => {
                posts = posts.concat({ contentType: files[i].type, new: true });
            });
        }

        let { posts_new, posts_add, posts_remove } =
            utils.getRemoveAddParams('posts', gallery.posts, posts);
        posts_new = posts_new ? posts_new.map(p => Object.assign({}, p, { rating })) : null;

        return {
            posts_new,
            posts_add,
            posts_remove,
            ...this.getPostsUpdateParams(),
        };
    }

    getPostsUpdateParams() {
        const { gallery } = this.props;
        const { address, location, rating } = this.state;
        const sameLocation = isEqual(this.getInitialLocationData(), { address, location });
        const sameRating = rating === gallery.rating;
        // check to see if should save locations on all gallery's posts
        if (sameLocation && sameRating) return null;
        if (sameLocation) {
            return {
                posts_update: gallery.posts.map(p => (pickBy({
                    id: p.id,
                    rating: rating === 3 ? 2 : rating,
                }, v => !!v))),
            };
        }

        return {
            posts_update: gallery.posts.map(p => (pickBy({
                id: p.id,
                address,
                lat: location.lat,
                lng: location.lng,
                rating: rating === 3 ? 2 : rating,
            }, v => !!v))),
        };
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
        return new Promise((resolve, reject) => (
            $.ajax({
                url: '/api/post/delete',
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify({ post_ids: postIds }),
            })
            .done((res) => resolve(res))
            .fail((err) => reject(err))
        ));
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
            .done((res) => resolve(res))
            .fail((err) => reject(err))
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

    toggleDeletePost(post) {
        this.setState({
            posts: this.state.posts.filter(p => p.id !== post.id)
        });
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
            assignment,
            tags,
            rating,
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

                    <ChipInput
                        model="assignments"
                        placeholder="Assignment"
                        attr="title"
                        items={assignment ? [assignment] : []}
                        updateItems={(a) => this.setState({ assignment: a[0] })}
                        multiple={false}
                        className="dialog-row"
                        autocomplete
                    />

                    <ChipInput
                        model="tags"
                        items={tags}
                        updateItems={(t) => this.setState({ tags: t })}
                        autocomplete={false}
                    />

                    <ChipInput
                        model="stories"
                        attr="title"
                        items={stories}
                        updateItems={(s) => this.setState({ stories: s })}
                        className="dialog-row"
                        autocomplete
                    />

                    <ChipInput
                        model="articles"
                        attr="title"
                        items={articles}
                        updateItems={(a) => this.setState({ articles: a })}
                        autocomplete
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
                </div>

                {get(posts, 'length') || get(uploads, 'length') ? (
                    <EditPosts
                        originalPosts={gallery.posts}
                        editingPosts={posts}
                        uploads={uploads}
                        canDelete={isOriginalGallery}
                        onToggleDelete={(p) => this.toggleDeletePost(p)}
                        className="dialog-col col-xs-12 col-md-5"
                    />
                ) : null}

                {this.renderMap(isOriginalGallery)}
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
                    ref={(r) => this.fileInput = r}
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
                    onClick={() => this.onRemove()}
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
            <div>
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

