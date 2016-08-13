import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditStories from './edit-stories';
import EditArticles from './edit-articles';
import EditPosts from './edit-posts';
import EditAssignment from './edit-assignment';
import AutocompleteMap from '../global/autocomplete-map';
import utils from 'utils';
import request from 'superagent';
import times from 'lodash/times';

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

        this.remove(gallery.id);
    }

    onSave(rating = this.state.rating) {
        const params = this.getFormData();
        const { gallery } = this.props;
        if (!gallery || !gallery.id || !params || this.state.loading) return;
        params.rating = rating;

        this.save(gallery.id, params, this.fileInput);
    }

    onChangeFileInput(e) {
        const file = e.target.files[0];
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
            assignment: gallery.assignment,
            address: gallery.address,
            caption: gallery.caption || 'No Caption',
            posts: gallery.posts,
            articles: gallery.articles,
            rating: gallery.rating,
            uploads: [],
            loading: false,
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
            articles,
            assignment,
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
            address,
            ...this.getPostsFormData(),
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
            ...utils.getRemoveAddParams('articles', gallery.articles, articles),
            assignment_id: assignment ? assignment.id : null,
        };

        return params;
    }

    getPostsFormData() {
        const { gallery } = this.props;
        const { posts } = this.state;
        const files = this.fileInput.files;
        if (files.length) {
            times(files.length, (i) => {
                posts.push({ contentType: files[i].type, new: true });
            });
        }

        return utils.getRemoveAddParams('posts', gallery.posts, posts);
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

    save(id, params, fileInput) {
        if (!id || !params || this.state.loading) return;
        const { onUpdateGallery } = this.props;
        this.setState({ loading: true });

        $.ajax(`/api/gallery/${id}/update`, {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(params),
        })
        .done((res) => {
            const saveCB = () => {
                this.hide();
                this.setState({ loading: false, uploads: [] },
                    () => {
                        onUpdateGallery(res);
                        $.snackbar({ content: 'Gallery saved!' });
                    });
            };
            if (res.posts_new && fileInput.files) {
                this.uploadFiles(res.posts_new, fileInput.files)
                .then(() => saveCB(),
                    () => $.snackbar({ content: 'There was an error saving the gallery!' }));
            } else {
                saveCB();
            }
        })
        .fail((err) => {
            this.setState({ loading: false });
            $.snackbar({
                content: utils.resolveError(err, 'There was an error saving the gallery!'),
            });
        });
    }

    remove(id) {
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

    clear() {
        if (this.state.loading) return;
        const { gallery } = this.props;

        this.setState({
            tags: [],
            stories: [],
            assignment: null,
            address: '',
            caption: 'No Caption',
            posts: [],
            articles: [],
            rating: gallery.rating,
        });
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

    renderMap() {
        const { gallery } = this.props;
        const location = gallery.location
            || (gallery.posts[0] ? gallery.posts[0].location : null);
        const address = gallery.address
            || (gallery.posts[0] ? gallery.posts[0].address : null);

        return (
            <div className="dialog-col col-xs-12 col-md-5 pull-right">
                <AutocompleteMap
                    address={address}
                    location={location}
                    hasRadius={false}
                    disabled
                    rerender
                />
            </div>
        );
    }

    renderBody() {
        const { user, gallery } = this.props;
        const {
            stories,
            caption,
            assignment,
            tags,
            rating,
            articles,
            posts,
            uploads,
        } = this.state;
        if (!gallery || !user) return '';

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <div className="dialog-row">
                        <textarea
                            type="text"
                            className="form-control"
                            value={utils.getBylineFromGallery(gallery) || ''}
                            placeholder="Byline"
                            disabled
                        />
                    </div>

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

                <EditPosts
                    posts={posts}
                    uploads={uploads}
                    gallery={gallery}
                    onToggleDelete={(p) => this.toggleDeletePost(p)}
                />

                {this.renderMap()}
            </div>
        );
    }

    renderFooter() {
        const { gallery, user } = this.props;
        const { loading } = this.state;
        if (!gallery || !user) return '';

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
                    onClick={() => this.clear()}
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Clear all
                </button>

                {!gallery.owner_id
                    // can add more posts when gallery is an import(null owner id)
                    ? <button
                        type="button"
                        onClick={() => this.fileInput.click()}
                        className="btn btn-flat"
                        disabled={loading}
                    >
                        Add More
                    </button>
                    : ''
                }

                <button
                    type="button"
                    onClick={() => this.onSave()}
                    className="btn btn-flat pull-right"
                    disabled={loading}
                >
                    Save
                </button>

                {gallery.rating < 2
                    ? <button
                        type="button"
                        onClick={() => this.onSave(2)}
                        className="btn btn-flat pull-right"
                        disabled={loading}
                    >
                        Verify
                    </button>
                    : <button
                        onClick={() => this.onSave(1)}
                        className="btn btn-flat pull-right"
                        disabled={loading}
                    >
                        Unverify
                    </button>
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
                    gedit ${visible ? 'toggled ': ''}`}
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
    onUpdateGallery: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    user: PropTypes.object,
};

export default Edit;

