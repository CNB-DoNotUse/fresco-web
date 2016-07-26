import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditStories from './edit-stories';
import EditArticles from './edit-articles';
import EditPosts from './edit-posts';
import EditMap from './edit-map';
import EditAssignment from './edit-assignment';
import BylineEdit from './byline-edit.js';
import utils from 'utils';
import _ from 'lodash';

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

	/**
	 * Updates state map location when AutocompleteMap gives new location
	 */
    onPlaceChange(place) {
        this.setState({ address: place.address, location: place.location });
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
            loading: false,
            caption: gallery.caption || 'No Caption',
            postIds: gallery.posts.map((p) => p.id),
            postsToDeleteIds: [],
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
            location,
            stories,
            assignment,
            postsToDeleteIds,
            postIds,
        } = this.state;
        const { gallery } = this.props;
        const posts = _.difference(postIds, postsToDeleteIds);

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        if (!posts.length) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return null;
        }

        // Configure the byline's other origin
        const byline = utils.getBylineFromComponent(gallery, this.refs.byline).byline || '';

        const params = {
            tags,
            caption,
            address,
            geo: utils.getGeoFromCoord(location),
            byline,
            stories,
            posts,
            assignment_id: assignment ? assignment.id : null,
        };

        return params;
    }

    save(rating) {
        const params = this.getFormData();
        const { gallery, onUpdateGallery } = this.props;
        if (!gallery.id || !params) return;
        params.rating = rating;

        $.ajax(`/api/gallery/${gallery.id}/update`, {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(params),
        })
        .done((res) => {
            // Update parent gallery
            onUpdateGallery(res);
            // Hide the modal
            this.hide();
        })
        .fail((err) => {
            $.snackbar({
                content: utils.resolveError(err, 'There was an error saving the gallery!'),
            });
        });
    }

    remove() {
        const id = this.props.gallery.id;
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
                this.props.onUpdateGallery(id);
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

    addMore() {
        this.refs.fileInput.click();
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
            postIds: [],
            postsToDeleteIds: [],
            articles: [],
            rating: gallery.rating,
        });
    }

    // TODO: refactor
    toggleDeletePost(post) {
        const index = this.state.postsToDeleteIds.indexOf(post);

        if (index === -1) {
            this.setState({ postsToDeleteIds: this.state.postsToDeleteIds.concat(post) });
        } else {
            const posts = this.state.postsToDeleteIds;
            posts.splice(index, 1);
            this.setState({ postsToDeleteIds: posts });
        }
    }

    toggleHighlight(e) {
        this.setState({ rating: e.target.checked ? 3 : 2 });
    }

    /**
 	 * Updates GalleryEdit Gallery
 	 * Used by GalelryEditFoot's Add Files
 	 */
    updateGallery(gallery) {
        this.setState({ gallery });
    }

    hide() {
        this.setState({ gallery: null });
        this.props.toggle();
    }

    renderBody() {
        const { user, gallery } = this.props;
        const {
            postsToDeleteIds,
            stories,
            caption,
            assignment,
            tags,
            rating,
            articles,
        } = this.state;
        if (!gallery || !user) return '';

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <BylineEdit ref="byline" gallery={gallery} />

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
                        relatedStories={stories}
                        updateRelatedStories={(s) => this.setState({ stories: s })}
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
                    posts={gallery.posts}
                    postsToDeleteIds={postsToDeleteIds}
                    onToggleDelete={(p) => this.toggleDeletePost(p)}
                />

                <EditMap
                    gallery={gallery}
                    onPlaceChange={(p) => this.onPlaceChange(p)}
                    disabled={user.id !== gallery.owner_id}
                />
            </div>
        );
    }

    renderFooter() {
        const { gallery, user } = this.props;
        const inputStyle = { display: 'none' };
        if (!gallery || !user) return '';

        return (
            <div className="dialog-foot">
                <input
                    id="gallery-upload-files"
                    type="file"
                    accept="image/*,video/*,video/mp4"
                    ref="fileUpload"
                    style={inputStyle}
                    onChange={() => this.fileUploaderChanged()}
                    multiple
                />

                <button
                    type="button"
                    onClick={() => this.revert()}
                    className="btn btn-flat"
                >
                    Revert changes
                </button>

                <button
                    type="button"
                    onClick={() => this.clear()}
                    className="btn btn-flat"
                >
                    Clear all
                </button>

                {
                    // TODO: when should this be button be visible
                    user.id === gallery.owner_id
                        ? <button
                            type="button"
                            onClick={() => this.addMore()}
                            className="btn btn-flat"
                        >
                            Add More
                        </button>
                        : ''
                }

                <button
                    type="button"
                    onClick={() => this.save()}
                    className="btn btn-flat pull-right"
                >
                    Save
                </button>

                {
                    gallery.rating < 2
                        ? <button
                            type="button"
                            onClick={() => this.save(2)}
                            className="btn btn-flat pull-right"
                        >
                            Verify
                        </button>
                        : <button
                            onClick={() => this.save(1)}
                            className="btn btn-flat pull-right"
                        >
                            Unverify
                        </button>
                }

                <button
                    type="button"
                    onClick={() => this.remove()}
                    className="btn btn-flat pull-right"
                >
                    Delete
                </button>

                <button
                    type="button"
                    onClick={() => this.hide()}
                    className="btn btn-flat pull-right toggle-gedit toggler"
                >
                    Cancel
                </button>
            </div>
        );
    }

    render() {
        const { toggled } = this.props;

        return (
            <div>
                <div className={`dim toggle-edit ${toggled ? 'toggled' : ''}`} />
                <div className={`edit panel panel-default toggle-edit gedit ${toggled ? 'toggled' : ''}`}>
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
    gallery: PropTypes.object,
    toggled: PropTypes.bool,
    toggle: PropTypes.func,
    onUpdateGallery: PropTypes.func,
    user: PropTypes.object,
};

Edit.defaultProps = {
    gallery: null,
    toggled: false,
    onUpdateGallery() {},
    toggle() {},
};

export default Edit;
