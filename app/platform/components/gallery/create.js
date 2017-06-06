import React, { PropTypes } from 'react';
import utils from 'utils';
import EditPosts from './edit-posts';
import ChipInput from '../global/chip-input';
import api from 'app/lib/api';
import * as Promise from 'bluebird';

/**
 * Description : Component for creating a gallery
 * Gallery Create Parent Object
 */

class Create extends React.Component {
    state = {
        tags: [],
        stories: [],
        articles: [],
        rating: 2,
        caption: '',
        loading: false,
        title: ''
    };

    componentDidMount() {
        $.material.init();
    }

    onCreate() {
        this.createGallery();
    }

    onChangeHighlighted() {
        this.setState({ rating: this.state.rating === 2 ? 3 : 2 });
    }

    /**
     * onScroll - stopPropagation of event
     * (prevents post/list and other parent cmp scroll listeners from triggering)
     *
     * @param {object} e event
     */
    onScroll = (e) => {
        e.stopPropagation();
    };

    /**
     * Clears the form of inputed data
     * @return {[type]} [description]
     */
    clear() {
        this.setState({
            tags: [],
            stories: [],
            articles: [],
            caption: '',
            title: ""
        });
    }

    /**
     * Creates the gallery on button click
 	 */
    createGallery() {
        if (this.state.loading) return;
        const { caption, rating, tags, stories, articles, title } = this.state;
        const { posts, onHide, setSelectedPosts } = this.props;

        // Generate post ids for update
        const postIds = posts.map((p) => p.id);
        if (postIds.length === 0) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return;
        }
        const { stories_add, stories_new } = utils.getRemoveAddParams('stories', [], stories);
        const { articles_add, articles_new } = utils.getRemoveAddParams('articles', [], articles);

        const params = {
            owner_id: null,
            title,
            caption
        };

        this.setState({ loading: true });
        api.post("story/create", params)
        .then((res) => {
            Promise.each(postIds, (id) => api.post(`story/${res.id}/posts/${id}/add` ))
                .then((res2) => {
                    onHide();
                    setSelectedPosts([]);

                    $.snackbar({
                        content: 'Story successfully saved! Click here to view it',
                        timeout: 5000,
                    }).click(() => {
                        const win = window.open(`/story/${res.id}`, '_blank');
                        win.focus();
                    });
                })
        }).catch(() => {

        })
        // .fail((err) => {
        //     this.setState({ loading: false });
        //     $.snackbar({
        //         content: utils.resolveError(err, 'There was an error creating your gallery!'),
        //     });
        // });
    }

    render() {
        const { posts, onHide } = this.props;
        const { caption, tags, stories, articles, rating, loading, title } = this.state;

        return (
            <div onScroll={this.onScroll}>
                <div className="dim toggle-gcreate toggled" />

                <div className="edit panel panel-default toggle-gcreate gcreate toggled">
                    <div className="col-xs-12 col-lg-12 edit-new dialog">

                        <div className="dialog-head">
                            <span className="md-type-title">Create Story</span>
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
                                disabled={loading}
                            >
                                Clear all
                            </button>
                            <button
                                onClick={() => this.onCreate()}
                                type="button"
                                className="btn btn-flat pull-right"
                                disabled={loading}
                            >
                                Save
                            </button>
                            <button
                                onClick={onHide}
                                type="button"
                                className="btn btn-flat pull-right toggle-gcreate toggler toggled"
                                disabled={loading}
                            >
                                Discard
                            </button>
                        </div>

                        <div className="dialog-body">
                            <div className="dialog-col col-xs-12 col-md-5 form-group-default">
                                <div className="dialog-row">
                                    <textarea
                                        value={caption}
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                        onChange={(e) => this.setState({ caption: e.target.value })}
                                    />
                                </div>
                                <div className="dialog-row">
                                    <textarea
                                        value={title}
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="title"
                                        onChange={(e) => this.setState({ title: e.target.value })}
                                    />
                                </div>


                                <div className="dialog-row">
                                    <div className="checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={rating === 3}
                                                onChange={() => this.onChangeHighlighted()}
                                            />
                                            Highlighted
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <EditPosts
                                originalPosts={posts}
                                className="dialog-col col-xs-12 col-md-7"
                            />
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
