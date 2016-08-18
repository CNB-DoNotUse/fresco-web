import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditStories from './edit-stories';
import EditArticles from './edit-articles';
import EditPosts from './edit-posts';
import EditAssignment from './edit-assignment';
import EditByline from './edit-byline';
import AutocompleteMap from '../global/autocomplete-map';
import utils from 'utils';
import request from 'superagent';
import times from 'lodash/times';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

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

    onRemove() {
        const { gallery } = this.props;
        if (!gallery || !gallery.id || this.state.loading) return;

        this.removeGallery(gallery.id);
    }

    onSave(rating = this.state.rating) {
        const params = this.getFormData();
        params.rating = rating;
        const { gallery, onUpdateGallery } = this.props;
        if (!gallery || !gallery.id || !params || this.state.loading) return;
        this.setState({ loading: true });

        this.saveGallery(gallery.id, params)
        .then((res) => {
            if (get(res, 'posts_new.length' && this.fileInput.files)) {
                return Promise.all([
                    res,
                    this.uploadFiles(res.posts_new, this.fileInput.files),
                ]);
            }

            return res;
        })
        .then((res) => {
            this.hide();
            this.setState({ uploads: [], loading: false }, () => {
                $.snackbar({ content: 'Gallery saved!' });
                onUpdateGallery(res);
            });
        })
        .catch((err) => {
            $.snackbar({ content: 'There was an error saving the gallery!' });
            this.setState({ loading: false });
        });
    }

    onChangeFileInput(e) {
        const file = e.target.files[0];
        if (!file) return;
        const type = file.type.split('/')[0];
        const { uploads } = this.state;

        if (type === 'image') {
            const reader = new FileReader();
            reader.onload = (r) => {
                uploads.unshift({ type, url: r.target.result });
                this.setState({ uploads });
            };
            reader.readAsDataURL(file);
        } else if (type === 'video') {
            const url = URL.createObjectURL(file);
            uploads.unshift({ type, url });
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

    onClickClear() {
        if (this.state.loading) return;
        const { gallery } = this.props;

        this.setState({
            tags: [],
            stories: [],
            assignment: null,
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
            uploads: [],
            loading: false,
            ...this.getInitialLocationData(),
            external_account_name: gallery.external_account_name,
            external_source: gallery.external_source,
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
            stories,
            articles,
            assignment,
            external_account_name,
            external_source,
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
        };

        return params;
    }

    getPostsFormData() {
        const { gallery } = this.props;
        const files = this.fileInput.files;
        let { posts } = this.state;

        if (!files.length && !posts.length) return null;

        if (files.length) {
            times(files.length, (i) => {
                posts = posts.concat({ contentType: files[i].type, new: true });
            });
        }

        return {
            ...utils.getRemoveAddParams('posts', gallery.posts, posts),
            ...this.getPostsLocationsParams(),
        };
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

    uploadFiles(posts, files) {
        const requests = posts.map((p, i) => {
            if (files[i]) {
                return new Promise((resolve, reject) => {
                    request
                        .put(p.url)
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

    saveGallery(id, params) {
        if (!id || !params || this.state.loading) return Promise.resolve();

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
        const { posts } = this.state;
        this.setState({ posts: posts.filter(p => p.id !== post.id) });
    }

    hide() {
        this.props.toggle();
    }

    renderAddMore() {
        const { gallery } = this.props;
        if (!gallery || !gallery.posts) return null;

        if (!gallery.owner_id && gallery.posts.every(p => !p.owner_id)) {
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
        const { address, location } = this.state;

        return (
            <div className="dialog-col col-xs-12 col-md-5 pull-right">
                <AutocompleteMap
                    address={address}
                    location={location}
                    onPlaceChange={(place) => this.onPlaceChange(place)}
                    onMapDataChange={(data) => this.onMapDataChange(data)}
                    onRadiusUpdate={(r) => this.onRadiusUpdate(r)}
                    hasRadius={false}
                    draggable
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
            external_account_name,
            external_source,
        } = this.state;
        if (!gallery) return '';

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">

                    <EditByline
                        gallery={gallery}
                        external_source={external_source}
                        external_account_name={external_account_name}
                        onChangeExtAccountName={(a) =>
                                this.setState({ external_account_name: a })}
                        onChangeExtSource={(s) =>
                                this.setState({ external_source: s })}
                    />

                    <div className="dialog-row">
                        <textarea
                            id="gallery-edit-caption"
                            type="text"
                            className="form-control floating-label"
                            ref="gallery-caption"
                            value={caption}
                            placeholder="Caption"
                            onChange={(e) => this.setState({ caption: e.target.value })}
                        />
                    </div>

                    <EditAssignment
                        assignment={assignment}
                        updateAssignment={(a) => this.setState({ assignment: a })}
                    />

                    <EditTags
                        tags={tags}
                        updateTags={(t) => this.setState({ tags: t })}
                    />

                    <EditStories
                        stories={stories}
                        updateStories={(s) => this.setState({ stories: s })}
                    />

                    <EditArticles
                        articles={articles}
                        updateArticles={(a) => this.setState({ articles: a })}
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

                {get(posts, 'length') || get(uploads, 'length')
                    ? <EditPosts
                        posts={posts}
                        uploads={uploads}
                        gallery={gallery}
                        onToggleDelete={(p) => this.toggleDeletePost(p)}
                    />
                    : null
                }

                {this.renderMap()}
            </div>
        );
    }

    renderFooter() {
        const { gallery } = this.props;
        const { loading } = this.state;
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
                    onClick={() => this.onSave()}
                    className="btn btn-flat pull-right"
                    disabled={loading}
                >
                    Save
                </button>

                {utils.isOriginalGallery(gallery)
                    ? <button
                        type="button"
                        onClick={() =>
                                this.onSave((gallery.rating < 2) ? 2 : 1)}
                        className="btn btn-flat pull-right"
                        disabled={loading}
                    >
                        {(gallery.rating < 2) ? 'Verify' : 'Unverify'}
                    </button>
                    : null
                }

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

