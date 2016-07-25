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
        const { gallery } = props;

        this.state = {
            gallery,
            caption: gallery ? gallery.caption : '',
            posts: gallery ? gallery.posts : null,
            ratingChanged: false,
            deletePosts: [],
        };
    }

    componentDidMount() {
        $.material.init();
    }

    componentWillReceiveProps(nextProps) {
        // If props has a gallery, and GalleryEdit does not currently have a
        // gallery or the galleries are not the same
        if (nextProps.gallery &&
            (!this.state.gallery || (this.state.gallery.id !== nextProps.gallery.id))) {
            this.setState({
                gallery: nextProps.gallery,
                posts: nextProps.gallery.posts.map(p => p.id),
            });
            // TODO: is this necessary?
            // $.material.init();
        }
    }

    onPlaceChange(place) {
        const gallery = this.state.gallery;
        gallery.location = place.location;
        gallery.address = place.address;

        this.setState({ gallery });
    }

    updateCaption(e) {
        const gallery = this.state.gallery;
        gallery.caption = e.target.value;

        this.setState({ gallery });
    }

    updateGalleryField(key, value) {
        const gallery = this.state.gallery;
        gallery[key] = value;
        this.setState({ gallery });
    }

    updateRelatedStories(stories) {
        const gallery = this.state.gallery;
        gallery.related_stories = stories;

        this.setState({ gallery });
    }

    updateArticles(articles) {
        const gallery = this.state.gallery;
        gallery.articles = articles;

        this.setState({ gallery });
    }

    updateTags(tags) {
        const gallery = this.state.gallery;
        gallery.tags = tags;

        this.setState({ gallery });
    }

    toggleDeletePost(post) {
        const index = this.state.deletePosts.indexOf(post);

        if (index === -1) {
            this.setState({ deletePosts: this.state.deletePosts.concat(post) });
        } else {
            const posts = this.state.deletePosts;
            posts.splice(index, 1);
            this.setState({ deletePosts: posts });
        }
    }

    updateRating(rating) {
        const { gallery } = this.state;
        gallery.rating = rating;

        // Update new gallery
        this.setState({ gallery, ratingChanged: true });
    }

    toggleHighlight(e) {
        this.updateRating(e.target.checked ? 3 : 2);
    }

    /**
 	 * Updates GalleryEdit Gallery
 	 * Used by GalelryEditFoot's Add Files
 	 */
    updateGallery(gallery) {
        this.setState({ gallery });
    }

    revertGallery() {
        // Set gallery back to original
        const { gallery } = this.props;
        this.setState({
            gallery: _.clone(gallery, true),
            posts: gallery.posts.map(p => p.id),
            deletePosts: [],
        });
    }

    unverifyGallery() {
        this.saveGallery(null, { rating: 1 });
    }

    verifyGallery() {
        this.saveGallery(null, { rating: 2 });
    }

    saveGallery(event, passedParams) {
        const { gallery } = this.state;
        const files = gallery.files ? gallery.files : [];
        const caption = gallery.caption;
        const tags = gallery.tags;
        let assignment = gallery.assignment ? gallery.assignment.id : undefined;


        // If assignment was removed, send -1 instead of undefined.
        if (this.props.gallery.assignment && this.props.gallery.assignment.id && !assignment) {
            assignment = -1;
        }

        // Generate post ids for update
        const posts = _.difference(this.state.posts, this.state.deletePosts);

        if (posts.length + files.length === 0) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return;
        }

        // TODO: deprecated
        // Generate stories for update
        // var stories = gallery.related_stories
        //     ? gallery.related_stories.map((story) => {
        //         if (story.new) return 'NEW=' + JSON.stringify(story);
        //         return story.id;
        //     })
        //     : null;

        // TODO: deprecated
        //Generate articles for update
        // var articles = gallery.articles.map((article) => {
        //     if(article.new) return 'NEW=' + JSON.stringify(article);
        //     return article.id;
        // });

        //Configure params for the updated gallery
        let params = {
            caption,
            // posts: posts,
            // assignment: assignment,
            tags,
            // stories: stories,
            // articles: articles,
        };

        if(typeof(passedParams) == 'object') {
            params = _.extend(params, passedParams);
        }

        // Configure the byline's other origin
        // var byline = utils.getBylineFromComponent(gallery, this.refs.galleryEditBody.refs.byline);
        // _.extend(params, byline);

 		// Check if imported and there is a location to add a location to the save request
        if (gallery.imported && gallery.location) {
            // if (gallery.location.lat && gallery.location.lng) {
            //     params.lat = gallery.location.lat;
            //     params.lon = gallery.location.lng;
            // } else {
            //     const { lat, lng } = utils.getCentroid(
            //         gallery.location.coordinates[0].map((coord) => {
            //             return {
            //                 lat: coord[1],
            //                 lng: coord[0]
            //             }
            //         }));

            //     params.lat = lat;
            //     params.lng = lng;
            // }
            if (gallery.address) {
                params.address = gallery.address;
            }
        }

        // TODO: figure out file uploading
        // if (files.length) {
        //     // Upload files then update gallery in callback
        //     this.uploadNewFiles(gallery, files, (newPosts) => {
        //         this.requestUpdateGallery(newPosts);
        //     });
        // } else {
            // Or just update gallery if no files present
        this.requestUpdateGallery(params);
        // }
    }

    requestUpdateGallery(params) {
        const { gallery } = this.props;
        $.ajax(`/api/gallery/${gallery.id}/update`, {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(params),
        })
        .done((response) => {
            // Update parent gallery
            this.props.onUpdateGallery(response.body);
            // Hide the modal
            this.hide();
        })
        .fail((err) => {
            $.snackbar({
                content: utils.resolveError(err, 'There was an error saving the gallery!'),
            });
        });
    }

    // uploadNewFiles(gallery, files, callback) {
    //     var data = new FormData();

    //     for (var i = 0; i < files.length; i++) {
    //         data.append(i, files[i]);
    //     }

    //     data.append('gallery', gallery.id);

    //     $.ajax({
    //         url: '/api/gallery/addpost',
    //         type: 'POST',
    //         data,
    //         processData: false,
    //         contentType: false,
    //         cache: false,
    //         dataType: 'json',
    //         success: (result, status, xhr) => {
    //             callback(result.data);
    //         },
    //         error: (xhr, status, error) => {
    //             $.snackbar({content: utils.resolveError(error)});
    //         },
    //         xhr: () => {
    //             const xhr = $.ajaxSettings.xhr();
    //             xhr.upload.onprogress = function () {};
    //             xhr.upload.onload = function () {};

    //             return xhr;
    //         },
    //     });
    // }

    hide() {
        this.setState({ gallery: null });
        this.props.toggle();
    }

    renderBody() {
        const { gallery, deletePosts } = this.state;
        const { user } = this.props;

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
                                value={gallery.caption}
                                placeholder="Caption"
                                onChange={(e) => this.updateCaption(e)}
                            />
                        </div>

                        <EditAssignment
                            assignment={gallery.assignment}
                            updateAssignment={(a) => this.updateAssignment(a)}
                        />

                        <EditTags
                            tags={gallery.tags}
                            updateTags={(t) => this.updateTags(t)}
                        />

                        <EditStories
                            relatedStories={gallery.related_stories}
                            updateRelatedStories={(s) => this.updateRelatedStories(s)}
                        />

                        <EditArticles
                            articles={gallery.articles}
                            updateArticles={(a) => this.updateArticles(a)}
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
                        toggleDelete={(p) => this.toggleDeletePost(p)}
                    />

                    <EditMap
                        gallery={gallery}
                        onPlaceChange={(p) => this.onPlaceChange(p)}
                        disabled={user.id === gallery.owner_id}
                    />
                </div>

                <EditFoot
                    gallery={this.state.gallery}
                    revert={() => this.revertGallery()}
                    saveGallery={(e, p) => this.saveGallery(e, p)}
                    verifyGallery={() => this.verifyGallery()}
                    unverifyGallery={() => this.unverifyGallery()}
                    updateGallery={(g) => this.updateGallery(g)}
                    hide={() => this.hide()}
                />
            </div>
        );
    }

    render() {
        const { gallery } = this.state;
        const { toggled } = this.props;

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
};

Edit.defaultProps = {
    gallery: null,
    posts: [],
    toggled: false,
    onUpdateGallery() {},
    toggle() {},
};

export default Edit;
