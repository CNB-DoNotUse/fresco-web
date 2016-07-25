import React from 'react';
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
    constructor(props) {
        super(props);
        this.toggleHighlight = this.toggleHighlight.bind(this);
    }

    componentDidMount() {
        $.material.init();
    }

    toggleHighlight(e) {
        this.props.updateRating(e.target.checked ? 3 : 2);
    }

    render() {
        var rating = this.props.gallery.rating;

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <BylineEdit ref="byline" gallery={this.props.gallery} />

                    <div className="dialog-row">
                        <textarea
                            id="gallery-edit-caption"
                            type="text"
                            className="form-control floating-label"
                            ref="gallery-caption"
                            value={this.props.gallery.caption}
                            placeholder="Caption"
                            onChange={this.props.updateCaption}
                        />
                    </div>

                    <EditAssignment
                        assignment={this.props.gallery.assignment}
                        updateAssignment={(a) => this.props.updateGalleryField('assignment', a)}
                    />

                    <EditTags
                        tags={this.props.gallery.tags}
                        updateTags={this.props.updateTags}
                    />

                    <EditStories
                        relatedStories={this.props.gallery.related_stories}
                        updateRelatedStories={this.props.updateRelatedStories}
                    />

                    <EditArticles
                        articles={this.props.gallery.articles}
                        updateArticles={this.props.updateArticles}
                    />

                    <div className="dialog-row">
                        <div className="checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={this.props.gallery.rating == 3}
                                    onChange={this.toggleHighlight}
                                />
                                Highlighted
                            </label>
                        </div>
                    </div>
                </div>

                <EditPosts
                    posts={this.props.gallery.posts}
                    files={this.props.gallery.files}
                    deletePosts={this.props.deletePosts}
                    toggleDelete={this.props.toggleDeletePost}
                />

                <EditMap
                    gallery={this.props.gallery}
                    onPlaceChange={this.props.onPlaceChange}
                />
            </div>
        );
    }
}

EditBody.defaultProps = {
    deletePosts: [],
    onPlaceChange() { console.log('GalleryEditBody missing onPlaceChange prop'); },
    toggleDeletePost() { console.log('GalleryEditBody missing toggleDeletePost prop'); },
    updateCaption() { console.log('GalleryEditBody missing updateCaption prop'); },
    updateRelatedStories() { console.log('GalleryEditBody missing updateRelatedStories prop'); },
    updateArticles() { console.log('GalleryEditBody missing updateArticles prop'); },
    updateTags() { console.log('GalleryEditBody missing updatedTags prop'); },
};

export default EditBody;

