import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditStories from './edit-stories';
import EditArticles from './edit-articles';
import EditPosts from './edit-posts';
import EditAssignment from './edit-assignment';
import AutocompleteMap from '../global/autocomplete-map';
import utils from 'utils';
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
        if (!this.props.gallery || (this.props.gallery.id !== nextProps.gallery.id)) {
            this.revert();
        }
    }

    onRemove() {
        const { gallery, remove, loading } = this.props;
        if (!gallery || !gallery.id || loading) return;

        remove(gallery.id);
    }

    onSave(rating = this.state.rating) {
        const params = this.getFormData();
        const { gallery, save, loading } = this.props;
        if (!gallery.id || !params || loading) return;
        params.rating = rating;

        save(gallery.id, params, this.fileInput);
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
        // TODO: merge in array of file objects
        const files = this.fileInput.files;
        if (files.length) {
            times(files.length, (i) => {
                posts.push({ contentType: files[i].type, new: true });
            });
        }

        return utils.getRemoveAddParams('posts', gallery.posts, posts);
    }

    /**
	 * Reverts all changes
	 */
    revert() {
        if (this.props.loading) return;

        this.setState(this.getStateFromProps(this.props));
    }

    clear() {
        if (this.props.loading) return;
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
                    gallery={gallery}
                    onToggleDelete={(p) => this.toggleDeletePost(p)}
                />

                {this.renderMap()}
            </div>
        );
    }

    renderFooter() {
        const { gallery, user, loading } = this.props;
        const inputStyle = { display: 'none' };
        if (!gallery || !user) return '';

        return (
            <div className="dialog-foot">
                <input
                    id="gallery-upload-files"
                    type="file"
                    accept="image/*,video/*,video/mp4"
                    ref={(r) => this.fileInput = r}
                    style={inputStyle}
                    disabled={loading}
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
        return (
            <div>
                <div className="dim toggle-edit toggled" />
                <div className={"edit panel panel-default toggle-edit gedit toggled"}>
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
    toggle: PropTypes.func,
    remove: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    user: PropTypes.object,
    loading: PropTypes.bool.isRequired,
};

Edit.defaultProps = {
    toggle() {},
    loading: false,
};

export default Edit;

