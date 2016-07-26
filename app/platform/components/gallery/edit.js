import React, { PropTypes } from 'react';
import EditFoot from './edit-foot.js';
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

    /**
     * getStateFromProps
     *
     * @param {object} props
     * @returns {object} initial state from passed props
     */
    getStateFromProps(props) {
        const { gallery } = props;

        return {
            tags: gallery.tags || [],
            stories: gallery.stories,
            assignment: gallery.assignment,
            address: gallery.address,
            loading: false,
            caption: gallery.caption || 'No Caption',
            postIds: gallery.posts.map((p) => p.id),
            postIdsToDelete: [],
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
            gallery,
            postIdsToDelete,
            postIds,
        } = this.state;
        const posts = _.difference(postIds, postIdsToDelete);
        const files = gallery.files ? gallery.files : [];

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        if (!posts.length || !files.length) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return null;
        }

        // Configure the byline's other origin
        // var byline = utils.getBylineFromComponent(gallery, this.refs.galleryEditBody.refs.byline);
        // _.extend(params, byline);

        const params = {
            tags,
            caption,
            address,
            geo: utils.getGeoFromCoord(location),
            stories,
            posts,
            assignment_id: assignment ? assignment.id : null,
        };

        return params;
    }

    // TODO: figure out file uploading
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
        .done((response) => {
            // Update parent gallery
            onUpdateGallery(response.body);
            // Hide the modal
            this.hide();
        })
        .fail((err) => {
            $.snackbar({
                content: utils.resolveError(err, 'There was an error saving the gallery!'),
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

    // TODO: refactor
    toggleDeletePost(post) {
        const index = this.state.postIdsToDelete.indexOf(post);

        if (index === -1) {
            this.setState({ postIdsToDelete: this.state.postIdsToDelete.concat(post) });
        } else {
            const posts = this.state.postIdsToDelete;
            posts.splice(index, 1);
            this.setState({ postIdsToDelete: posts });
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
        const {
            postIdsToDelete,
            stories,
            caption,
            assignment,
            tags,
            rating,
            articles,
        } = this.state;
        const { user, gallery } = this.props;

        return (
            <div className="col-xs-12 col-lg-12 edit-new dialog">
                <div className="dialog-head">
                    <span className="md-type-title">Edit Gallery</span>
                    <span
                        className="mdi mdi-close pull-right icon toggle-edit toggler"
                        onClick={() => this.hide()}
                    />
                </div>

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
                            updateArticles={(a) => this.updateArticles({ articles: a })}
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
                        files={gallery.files}
                        deletePosts={postIdsToDelete}
                        toggleDelete={(p) => this.toggleDeletePost(p)}
                    />

                    <EditMap
                        gallery={gallery}
                        onPlaceChange={(p) => this.onPlaceChange(p)}
                        disabled={user.id !== gallery.owner_id}
                    />
                </div>

                <EditFoot
                    gallery={gallery}
                    revert={() => this.revert()}
                    saveGallery={(r) => this.save(r)}
                    verifyGallery={() => this.save(2)}
                    unverifyGallery={() => this.unverifyGallery(1)}
                    updateGallery={(g) => this.updateGallery(g)}
                    hide={() => this.hide()}
                />
            </div>
        );
    }

    render() {
        const { toggled, gallery } = this.props;

        return (
            <div>
                <div className={`dim toggle-edit ${toggled ? 'toggled' : ''}`} />
                <div className={`edit panel panel-default toggle-edit gedit ${toggled ? 'toggled' : ''}`}>
                    {gallery ? this.renderBody() : ''}
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
