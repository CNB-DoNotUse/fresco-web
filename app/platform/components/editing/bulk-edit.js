import React from 'react'
import GalleryEditTags from './gallery-edit-tags'
import GalleryEditStories from './gallery-edit-stories'
import EditPost from './edit-post.js'
import Slick from 'react-slick'
import utils from 'utils'

/** //

Description : Component for editing multiple posts at once (from possibly
    different galleries)

// **/

/**
 * Bulk Edit Parent Object
 */
export default class BulkEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            caption: '',
            tags: [],
            relatedStories: [],
            galleries: []
        }
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.clear = this.clear.bind(this);
        this.revert = this.revert.bind(this);
        this.save = this.save.bind(this);
        this.updateCaption = this.updateCaption.bind(this);
        this.updateTags = this.updateTags.bind(this);
        this.updateRelatedStories = this.updateRelatedStories.bind(this);
    }

    /**
     * Show this component. Most be called to initialize the fields in the panel
     */
    show() {
        this.clear();
        $('.toggle-bedit').toggleClass('toggled');

        let galleryIds = new Set(this.props.posts.map(post => { return post.parent }));
        $.get('/api/gallery/resolve', {galleries: [...galleryIds]}, (data) => {
            if (!data.data) {
                this.hide();
                $.snackbar({
                    content: utils.resolveError(data.err, 'We were unable to edit these posts')
                });
                return;
            }

            this.setState({
                galleries: data.data
            });

            this.revert();
        });
    }

    hide() {
        $('.toggle-bedit').toggleClass('toggled');
    }

    clear() {
        this.setState({
            caption: '',
            tags: [],
            relatedStories: []
        })
    }

    /**
     * Get the tags that are common between every gallery
     * @return {Array[string]} The common tags between each gallery
     */
    getInitialTags() {
        let tags = new Set(this.state.galleries[0].tags);
        for (let gallery of this.state.galleries) {
            let galleryTags = new Set(gallery.tags);

            //This is a set intersection. JS Sets don't have this built in
            tags = new Set([...tags].filter(x => galleryTags.has(x)));
        }
        return [...tags];
    }

    /**
     * Get the stories that are common between every gallery. A Story object looks
     * like this:
     * {
     *         id: string,
     *         title: string
     * }
     * @return {Array[Story]} The common stories between each gallery
     */
    getInitialStories() {
        // We can't use the same method that tags uses, as sets test for reference
        // equality, not value equality. So we have to manually check each id

        let stories = this.state.galleries[0].related_stories
        for (let gallery of this.state.galleries) {
            stories = intersectStories(gallery.related_stories, stories);
        }
        return stories;

        function intersectStories(array1, array2) {
            var new_array = [];
            array2.forEach(function(item) {
                var found = array1.some(function(item2) {
                    return item.id == item2.id;
                });

                if (found) {
                    new_array.push(item);
                }
            });

            return new_array;
        }
    }

    /**
     * Revert the component to it's initial state (pre-edits)
     */
    revert() {
        let stateToSet = {};

        let caption = this.state.galleries[0].caption;
        let allSame = this.state.galleries.every(gallery => {
            return gallery.caption == caption;
        });

        if (allSame) {
            stateToSet.caption = caption;
        }

        stateToSet.tags = this.getInitialTags();
        stateToSet.relatedStories = this.getInitialStories();

        this.setState(stateToSet);
    }

    /**
     * Save the edits made to each post
     */
    save() {
        // Only send what's changed

        let params = {
            galleries: this.state.galleries.map(g => { return g.id; })
        }

        if (this.state.caption.length > 0) {
            params.caption = this.state.caption;
        }

        // Tags
        if (this.state.tags.length > 0) {
            params.tags = this.state.tags;
        }

        let tagsToRemove = subtractArrays(this.getInitialTags(), this.state.tags);
        if (tagsToRemove.length > 0) {
            params.tags_removed = tagsToRemove;
        }

        // Stories
        let stories = processStories(this.state.relatedStories)
        if (stories.length > 0) {
            params.stories = stories;
        }

        let storiesToRemove = subtractArrays(processStories(this.getInitialStories()), stories);
        if (storiesToRemove.length > 0) {
            params.stories_removed = storiesToRemove;
        }

        $.ajax({
            url: '/api/gallery/bulkupdate',
            type: 'post',
            data: JSON.stringify(params),
            contentType: 'application/json',
            success: (data) => {
                if (data.err) {
                    $.snackbar({
                        content: utils.resolveError(data.err, 'We were not able to save these changes')
                    });
                    return;
                }
                window.location.reload();
            }
        });

        function subtractArrays(array1, array2) {
            let result = new Set(array1);
            for (let item of array2) {
                result.delete(item);
            }
            return [...result];
        }

        /**
         * Turn an array of story objects into id & creation strings. Needed to send
         * to the api.
         * @param    {Array[Story]} stories The story objects to process.
         * @return {Array[string]}                 The processed stories, ready to send
         */
        function processStories(stories) {
            return stories.map((story) => {
                if(story.new)
                    return 'NEW=' + JSON.stringify(story);
                else
                    return story.id;
                });
            }
    }

    updateCaption(e) {
        let caption = e.target.value;

        this.setState({
            caption: caption
        });
    }

    updateTags(tags) {
        this.setState({
            tags: tags
        });
    }

    updateRelatedStories(relatedStories) {
        this.setState({
            relatedStories: relatedStories
        });
    }

    render() {
        let posts = this.props.posts.map((post, i) => {
            return (
                <div key={i++}>
                    <EditPost post={post} />
                </div>
            )
        });

        return (
            <div>
                <div className="dim toggle-bedit" />

                <div className="edit panel panel-default toggle-bedit bedit">
                    <div className="col-xs-12 col-lg-12 edit-new dialog">

                        <div className="dialog-head">
                            <span className="md-type-title">Bulk Edit</span>
                            <span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.hide}></span>
                        </div>

                        <div className="dialog-foot">
                            <button onClick={this.revert} type="button" className="btn btn-flat">Revert</button>
                            <button onClick={this.clear} type="button" className="btn btn-flat">Clear All</button>
                            <button onClick={this.save} type="button" className="btn btn-flat pull-right">Save</button>
                            <button onClick={this.hide} type="button" className="btn btn-flat pull-right toggle-bedit">Discard</button>
                        </div>

                        <div className="dialog-body">
                            <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                                <div className="dialog-row">
                                    <textarea
                                        ref="caption"
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                        value={this.state.caption}
                                        onChange={this.updateCaption} />
                                </div>

                                <GalleryEditTags
                                    ref="tags"
                                    tags={this.state.tags}
                                    updateTags={this.updateTags} />

                                <GalleryEditStories
                                    relatedStories={this.state.relatedStories}
                                    updateRelatedStories={this.updateRelatedStories}/>
                            </div>

                            <Slick
                                dots={true}
                                className="gialog-col col-xs-12 col-md-5">
                                {posts}
                            </Slick>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

BulkEdit.defaultProps = {
    posts: []
}
