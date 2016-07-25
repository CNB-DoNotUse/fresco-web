import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditStories from './edit-stories';
import EditArticles from './edit-articles';
import EditPosts from './edit-posts';
import EditMap from './edit-map';
import EditAssignment from './edit-assignment';
import BylineEdit from '../editing/byline-edit.js';

/**
 * Gallery Edit Body, inside of the GalleryEdit class
 * @description manages all of the input fields, and speaks to parent
 */

class EditBody extends React.Component {
    componentDidMount() {
        $.material.init();
    }

    toggleHighlight(e) {
        this.props.updateRating(e.target.checked ? 3 : 2);
    }

    render() {
        const {
            gallery,
            updateCaption,
            updateGalleryField,
            updateTags,
            updateRelatedStories,
            updateArticles,
            deletePosts,
            toggleDeletePost,
            onPlaceChange,
            userId,
        } = this.props;

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
                            value={gallery.caption}
                            placeholder="Caption"
                            onChange={updateCaption}
                        />
                    </div>

                    <EditAssignment
                        assignment={gallery.assignment}
                        updateAssignment={(a) => updateGalleryField('assignment', a)}
                    />

                    <EditTags
                        tags={gallery.tags}
                        updateTags={updateTags}
                    />

                    <EditStories
                        relatedStories={gallery.related_stories}
                        updateRelatedStories={updateRelatedStories}
                    />

                    <EditArticles
                        articles={gallery.articles}
                        updateArticles={updateArticles}
                    />

                    <div className="dialog-row">
                        <div className="checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={gallery.rating == 3}
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
                    deletePosts={deletePosts}
                    toggleDelete={toggleDeletePost}
                />

                <EditMap
                    gallery={gallery}
                    onPlaceChange={onPlaceChange}
                    disabled={userId === gallery.owner_id}
                />
            </div>
        );
    }
}

EditBody.propTypes = {
    gallery: PropTypes.object.isRequired,
    onPlaceChange: PropTypes.func.isRequired,
    toggleDeletePost: PropTypes.func.isRequired,
    updateCaption: PropTypes.func.isRequired,
    updateRelatedStories: PropTypes.func.isRequired,
    updateArticles: PropTypes.func.isRequired,
    updateTags: PropTypes.func.isRequired,
    updateGalleryField: PropTypes.func.isRequired,
    updateRating: PropTypes.func.isRequired,
    deletePosts: PropTypes.array,
    userId: PropTypes.number,
};

EditBody.defaultProps = {
    deletePosts: [],
};

export default EditBody;

