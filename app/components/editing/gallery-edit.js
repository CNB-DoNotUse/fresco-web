import _ from 'lodash';
import React from 'react';
import GalleryEditBody from './gallery-edit-body.js';
import GalleryEditFoot from './gallery-edit-foot.js';
import global from '../../../lib/global';

/** //

Description : Component for adding gallery editing to the current view

// **/

/**
 * Gallery Edit Parent Object
 */
class GalleryEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            gallery: null,
            caption: '',
            posts: null,
            ratingChanged: false,
            deletePosts: [],
        };

        this.onPlaceChange 			= this.onPlaceChange.bind(this);
        this.toggleDeletePost 		= this.toggleDeletePost.bind(this);
        this.updateCaption 			= this.updateCaption.bind(this);
        this.updateRelatedStories 	= this.updateRelatedStories.bind(this);
        this.updateArticles 		= this.updateArticles.bind(this);
        this.updateTags 			= this.updateTags.bind(this);
        this.updateAssignment 	    = this.updateAssignment.bind(this);
        this.updateRating           = this.updateRating.bind(this);

        this.updateGalleryField     = this.updateGalleryField.bind(this);
        this.updateGallery 			= this.updateGallery.bind(this);
        this.uploadNewFiles 		= this.uploadNewFiles.bind(this);
        this.revertGallery 			= this.revertGallery.bind(this);
        this.saveGallery 			= this.saveGallery.bind(this);
        this.verifyGallery 			= this.verifyGallery.bind(this);
        this.unverifyGallery 		= this.unverifyGallery.bind(this);
        this.hide		 			= this.hide.bind(this);
    }

	componentDidMount() {
		$.material.init();
	}

    componentWillReceiveProps(nextProps) {
        // If props has a gallery, and GalleryEdit does not currently have a gallery or the galleries are not the same
        if (nextProps.gallery &&
            (!this.state.gallery || (this.state.gallery.id !== nextProps.gallery.id))) {
            this.setState({
                gallery: _.clone(nextProps.gallery, true),
                posts: nextProps.gallery.posts.map(p => p.id),
            });
            $.material.init();
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
        this.setState({ gallery })
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

    updateAssignment(assignment) {
        const gallery = this.state.gallery;
        gallery.assignment = assignment;
        this.setState({ gallery });
    }

    toggleDeletePost(post) {
        const index = this.state.deletePosts.indexOf(post);

        if (index === -1) {
            this.setState({ deletePosts: this.state.deletePosts.concat(post) });
        } else {
            var posts = _.clone(this.state.deletePosts, true);
            posts.splice(index, 1);
            this.setState({
                deletePosts: posts
            });
        }
    }

    updateRating(rating) {
        const { gallery } = this.state;
        gallery.rating = rating;

        // Update new gallery
        this.setState({
            gallery,
            ratingChanged: true,
        });
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

	// Returns centroid for passed polygon
    getCentroid(polygon) {
        var path, lat = 0, lng = 0;

        if (Array.isArray(polygon)) {
            var newPolygon = new google.maps.Polygon({paths: polygon});
            path = newPolygon.getPath();
        } else {
            path = polygon.getPath();
        }

        for (var i = 0; i < path.getLength() - 1; ++i) {
            lat += path.getAt(i).lat();
            lng += path.getAt(i).lng();
        }

        lat /= path.getLength() - 1;
        lng /= path.getLength() - 1;
        return new google.maps.LatLng(lat, lng);
    }

    unverifyGallery() {
        this.saveGallery(null, { rating: 1 });
    }

    verifyGallery() {
        this.saveGallery(null, { rating: 2 });
    }

    saveGallery(event, passedParams) {
        const self = this;
        const gallery = _.clone(this.state.gallery, true);
        const files = gallery.files ? gallery.files : [];
        const caption = gallery.caption;
        const tags = gallery.tags;
        let assignment = gallery.assignment ? gallery.assignment.id : undefined;


 		// If assignment was removed, send -1 instead of undefined.
        if (this.props.gallery.assignment && this.props.gallery.assignment.id && !assignment) {
            assignment = -1;
        }

        //Generate post ids for update
        var posts = _.difference(this.state.posts, this.state.deletePosts);

        if(posts.length + files.length == 0 ) return $.snackbar({content:"Galleries must have at least 1 post"});

        // Generate stories for update
        var stories = gallery.related_stories
            ? gallery.related_stories.map((story) => {
                if (story.new) return 'NEW=' + JSON.stringify(story);
                return story.id;
            })
            : null;

        //Generate articles for update
        var articles = gallery.articles.map((article) => {
            if(article.new) return 'NEW=' + JSON.stringify(article);
            return article.id;
        });

        //Configure params for the updated gallery
        var params = {
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
        // var byline = global.getBylineFromComponent(gallery, this.refs.galleryEditBody.refs.byline);
        // _.extend(params, byline);

 		// Check if imported and there is a location to add a location to the save request
        if (gallery.imported && gallery.location) {
            if(gallery.location.lat && gallery.location.lng) {
                params.lat = gallery.location.lat;
                params.lon = gallery.location.lng;
            } else {
                const coord = this.getCentroid(
                    gallery.location.coordinates[0].map((coord) => {
                        return {
                            lat: coord[1],
                            lng: coord[0]
                        }
                    }));
                const lat = coord.lat();
                const lon = coord.lng();

                params.lat = lat;
                params.lon = lon;
            }
            if (gallery.address) {
                params.address = gallery.address;
            }
        }

        if (files.length) {
            // Upload files then update gallery in callback
            this.uploadNewFiles(gallery, files, (newPosts) => {
                updateGallery(newPosts);
            });
        } else {
            // Or just update gallery if no files present
            updateGallery();
        }

        function updateGallery(newPosts) {
            if (typeof newPosts !== 'undefined') {
                params.posts = _.difference(newPosts.posts, self.state.deletePosts);
            }

            $.ajax(`/api/gallery/${gallery.id}/update`, {
                method: 'post',
                contentType: "application/json",
                data: JSON.stringify(params),
                success: (response) => {
                    if(response.err || !response.data) {
                        $.snackbar({
                            content: global.resolveError(response.err, "There was an error saving the gallery!")
                        });
                    }
                    else {
                        //Update parent gallery
                        self.props.updateGallery(response.data);
                        //Hide the modal
                        self.hide();
                    }
                },
            });
        }
    }

    uploadNewFiles(gallery, files, callback) {
        var data = new FormData();

        for (var i = 0; i < files.length; i++) {
            data.append(i, files[i]);
        }

        data.append('gallery', gallery.id);

        $.ajax({
            url: '/api/gallery/addpost',
            type: 'POST',
            data,
            processData: false,
            contentType: false,
            cache: false,
            dataType: 'json',
            success: (result, status, xhr) => {
                callback(result.data);
            },
            error: (xhr, status, error) => {
                $.snackbar({content: global.resolveError(error)});
            },
            xhr: () => {
                const xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function () {};
                xhr.upload.onload = function () {};

                return xhr;
            },
        });
    }

    hide() {
        this.setState({
            gallery: null
        });
        this.props.toggle();
    }

    render() {
        let editBody = '';

        if (this.state.gallery) {
            editBody = (
                <div className="col-xs-12 col-lg-12 edit-new dialog">
                    <div className="dialog-head">
                        <span className="md-type-title">Edit Gallery</span>
                        <span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.hide}></span>
                    </div>

                    <GalleryEditBody
                        ref="galleryEditBody"
                        gallery={this.state.gallery}

                        onPlaceChange={this.onPlaceChange}
                        updateCaption={this.updateCaption}
                        updateRelatedStories={this.updateRelatedStories}
                        updateRating={this.updateRating}
                        updateArticles={this.updateArticles}
                        updateTags={this.updateTags}
                        updateGallery={this.updateGallery}
                        updateGalleryField={this.updateGalleryField}
                        deletePosts={this.state.deletePosts}
                        toggleDeletePost={this.toggleDeletePost}
                    />

                    <GalleryEditFoot
                        gallery={this.state.gallery}
                        revert={this.revertGallery}
                        saveGallery={this.saveGallery}
                        verifyGallery={this.verifyGallery}
                        unverifyGallery={this.unverifyGallery}
                        updateGallery={this.updateGallery}
                        hide={this.hide}
                    />
                </div>
            );
        }

		const toggled = this.props.toggled ? 'toggled' : '';

        return (
            <div>
                <div className={'dim toggle-edit ' + toggled}></div>
                <div className={"edit panel panel-default toggle-edit gedit " + toggled}>
                    {editBody}
                </div>
            </div>
        );
    }
}

GalleryEdit.defaultProps = {
    gallery: null,
    posts: [],
    toggled: false,
    updateGallery() {},
    toggle() {},
};

export default GalleryEdit;
