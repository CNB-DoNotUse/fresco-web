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
        loading: false,
    };

    componentDidMount() {
        $.material.init();
    }

    onCreate() {
        if (this.state.loading) return;
        const { onHide, storyCreation, storyFunctions } = this.props;

        // Generate post ids for update
        const postIds = storyCreation.posts.map((p) => p.id);
        if (postIds.length === 0) {
            $.snackbar({ content: 'Galleries must have at least 1 post' });
            return;
        }

        const params = {
            owner_id: null,
            title: storyCreation.title,
            caption: storyCreation.caption,
            tags: storyCreation.tags
        };

        this.setState({ loading: true });
        api.post("story/create", params)
        .then((res) => {
            Promise.each(postIds, (id) => api.post(`story/${res.id}/posts/${id}/add` ))
                .then((res2) => {
                    onHide();
                    storyFunctions.clearFields();

                    $.snackbar({
                        content: 'Story successfully saved! Click here to view it',
                        timeout: 5000,
                    }).click(() => {
                        const win = window.open(`/story/${res.id}`, '_blank');
                        win.focus();
                    });
                })
        }).catch((err) => {
            this.setState({ loading: false });
            $.snackbar({
                content: utils.resolveError(err, 'There was an error creating your story!'),
            });
        })
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

    render() {
        const { posts, onHide, storyFunctions } = this.props;
        const { loading } = this.state;
        const { caption, tags, rating, title } = this.props.storyCreation;
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
                                onClick={ storyFunctions.clear }
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
                            <div className="gallery-images">
                                <EditPosts
                                    originalPosts={posts}
                                    afterChange={ storyFunctions.changePostIndex }/>
                            </div>
                            <div className="dialog-col col-xs-12 col-md-5 form-group-default">
                                <div className="dialog-row">
                                    <textarea
                                        value={title}
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Title"
                                        onChange={(e) => storyFunctions.changeTitle(e.currentTarget.value)}
                                        />
                                </div>
                                <div className="dialog-row">
                                    <textarea
                                        value={caption}
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                        onChange={(e) => { storyFunctions.changeCaption(e.currentTarget.value)}}
                                    />
                                </div>
                                <div className="dialog-row">
                                    <ChipInput
                                        model="tags"
                                        items={ tags }
                                        updateItems={(t) => storyFunctions.addTag(t)}
                                        autocomplete={false}
                                        multiple
                                        />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// <EditPosts
//     originalPosts={posts}
//     className="dialog-col col-xs-12 col-md-7"
//     />
Create.propTypes = {
    onHide: PropTypes.func.isRequired,
    setSelectedPosts: PropTypes.func.isRequired,
    posts: PropTypes.array.isRequired,
};

export default Create;
