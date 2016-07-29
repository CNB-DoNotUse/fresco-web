import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditArticles from './edit-articles';
import EditStories from './edit-stories';
import EditPost from './edit-post';
import Slick from 'react-slick';
import utils from 'utils';

/**
 * Description : Component for creating a gallery
 * Gallery Create Parent Object
 */

class Create extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            relatedStories: [],
            articles: [],
            visibility: 0,
        };
    }

    componentDidMount() {
        $.material.init();
    }

    /**
     * Clears the form of inputed data
     * @return {[type]} [description]
     */
    clear() {
        this.refs.caption.value = '';

        this.setState({
            tags: [],
            relatedStories: [],
            articles: [],
        });
    }

    toggleVisibility() {
        this.setState({ visibility: this.state.visibility === 0 ? 2 : 0 });
    }

    /**
     * Creates the gallery on button click
 	 */
    create() {
        const caption = this.refs.caption.value;
        const { visibility, tags, relatedStories, articles } = this.state;
        const { posts, onHide, setSelectedPosts } = this.props;

        // Generate post ids for update
        const postIds = posts.map((p) => p.id);

        if (postIds.length === 0) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return;
        }

        const storyIds = relatedStories.map((s) => s.id);
        const articleIds = articles.map((a) => a.id);

        const params = {
            caption,
            posts: postIds,
            tags,
            visibility,
            articles: articleIds,
            stories: storyIds,
        };

        $.ajax({
            url: '/api/gallery/create',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(params),
        })
        .done((res) => {
            onHide();
            setSelectedPosts([]);

            $.snackbar({
                content: 'Gallery successfully saved! Click here to view it',
                timeout: 5000,
            }).click(() => {
                const win = window.open(`/gallery/${res.id}`, '_blank');
                win.focus();
            });
        })
        .fail((err) => {
            $.snackbar({
                content: utils.resolveError(err, 'There was an error creating your gallery!'),
            });
        });
    }

    render() {
        const { posts, onHide } = this.props;
        const { tags, relatedStories, articles } = this.state;

        const postsJSX = posts.map((p, i) => (
            <div key={i}>
                <EditPost post={p} />
            </div>
        ));

        return (
            <div>
                <div className="dim toggle-gcreate toggled" />

                <div className="edit panel panel-default toggle-gcreate gcreate toggled">
                    <div className="col-xs-12 col-lg-12 edit-new dialog">

                        <div className="dialog-head">
                            <span className="md-type-title">Create Gallery</span>
                            <span
                                className="mdi mdi-close pull-right icon toggle-edit toggler"
                                onClick={onHide}
                            />
                        </div>

                        <div className="dialog-foot">
                            <button
                                onClick={() => this.clear()}
                                type="button"
                                className="btn btn-flat"
                            >
                                Clear all
                            </button>
                            <button
                                onClick={() => this.create()}
                                type="button"
                                className="btn btn-flat pull-right"
                            >
                                Save
                            </button>
                            <button
                                onClick={onHide}
                                type="button"
                                className="btn btn-flat pull-right toggle-gcreate toggler toggled"
                            >
                                Discard
                            </button>
                        </div>

                        <div className="dialog-body">
                            <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                                <div className="dialog-row">
                                    <textarea
                                        ref="caption"
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                    />
                                </div>

                                <EditTags
                                    ref="tags"
                                    tags={tags}
                                    updateTags={(t) => this.setState({ tags: t })}
                                />

                                <EditStories
                                    relatedStories={relatedStories}
                                    updateRelatedStories={(s) => this.setState({ relatedStories: s })}
                                />

                                <EditArticles
                                    articles={articles}
                                    updateArticles={(a) => this.setState({ articles: a })}
                                />

                                <div className="dialog-row">
                                    <div className="checkbox">
                                        <label>
                                            <input
                                                ref="highlight"
                                                type="checkbox"
                                                onChange={() => this.toggleVisibility()}
                                            />
                                            Highlighted
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <Slick
                                dots
                                className="dialog-col col-xs-12 col-md-5"
                            >
                                {postsJSX}
                            </Slick>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Create.propTypes = {
    onHide: PropTypes.func.isRequired,
    setSelectedPosts: PropTypes.func.isRequired,
    posts: PropTypes.array.isRequired,
};

export default Create;

