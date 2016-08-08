import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditStories from './edit-stories';
import EditPost from './edit-post';
import Slick from 'react-slick';
import utils from 'utils';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

/**
 * Component for editing multiple posts at once (from possibly different galleries)
 * Bulk Edit Parent Object
 */
class BulkEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
        this.getStateFromProps(props);
    }

    componentDidMount() {
        $.material.init();
    }

    getStateFromProps(props) {
        const galleryIds = uniq(props.posts.map(p => p.parent.id));
        let galleries;

        $.ajax({
            url: `/api/gallery/${galleryIds.join(',')}`,
        })
        .then((res) => {
            if (Array.isArray(res)) galleries = res;
            else galleries = [res];

            this.setState(this.getStateFromGalleries(galleries));
        }, () => this.setState(this.getStateFromGalleries(galleries)));
    }

    getStateFromGalleries(galleries) {
        if (!galleries) return { galleries: [], tags: [], stories: [], caption: '' };
        const tags = galleries.reduce((p, c) => (p.concat(c.tags)), []);
        const stories = galleries.reduce((p, c) => (p.concat(c.stories)), []);
        const caption = galleries.reduce((p, c) => (p === c.caption ? p : ''), galleries[0].caption);
        const posts = uniqBy(galleries.reduce((p, c) => (p.concat(c.posts)), []), 'id');

        return { galleries, tags, stories, caption, posts };
    }

    clear() {
        this.setState({ caption: '', tags: [], stories: [] });
    }

    /**
     * Revert the component to it's initial state (pre-edits)
     */
    revert() {
        this.setState(this.getStateFromGalleries(this.state.galleries));
    }

    /**
     * Save the edits made to each post
     */
    // TODO: add support for add/remove/new of tags, stories
    save() {
        const { galleries, caption, tags } = this.state;
        const params = {
            galleries: galleries.map(g => g.id),
            tags,
        };

        if (caption && caption.length) params.caption = caption;
        if (tags && tags.length) params.tags = tags;

        // $.ajax({
        //     url: '/api/gallery/bulkupdate',
        //     type: 'post',
        //     data: JSON.stringify(params),
        //     contentType: 'application/json',
        //     success: (data) => {
        //         if (data.err) {
        //             $.snackbar({
        //                 content: utils.resolveError(data.err, 'We were not able to save these changes')
        //             });
        //             return;
        //         }
        //         window.location.reload();
        //     },
        // });
    }

    renderBody() {
        const { caption, tags, stories, posts } = this.state;

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <div className="dialog-row">
                        <textarea
                            ref="caption"
                            type="text"
                            className="form-control floating-label"
                            placeholder="Caption"
                            value={caption}
                            onChange={(e) => this.setState({ caption: e.target.value })}
                        />
                    </div>

                    <EditTags
                        ref="tags"
                        tags={tags}
                        updateTags={(t) => this.setState({ tags: t })}
                    />

                    <EditStories
                        stories={stories}
                        updateStories={(s) => this.setState({ stories: s })}
                    />
                </div>

                <Slick
                    className="gialog-col col-xs-12 col-md-5"
                    dots
                >
                    {posts && posts.length
                        ? posts.map((post, i) => (
                            <div key={i}>
                                <EditPost post={post} />
                            </div>
                        ))
                        : <div />
                    }
                </Slick>
            </div>
        );
    }

    renderFooter() {
        return (
            <div className="dialog-foot">
                <button
                    onClick={() => this.revert()}
                    type="button"
                    className="btn btn-flat"
                >
                    Revert
                </button>
                <button
                    onClick={() => this.clear()}
                    type="button"
                    className="btn btn-flat"
                >
                    Clear All
                </button>
                <button
                    onClick={() => this.save()}
                    type="button"
                    className="btn btn-flat pull-right"
                >
                    Save
                </button>
                <button
                    onClick={this.props.onHide}
                    type="button"
                    className="btn btn-flat pull-right toggle-bedit"
                >
                    Discard
                </button>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className="dim toggle-bedit toggled" />

                <div className="edit panel panel-default toggle-bedit bedit toggled">
                    <div className="col-xs-12 col-lg-12 edit-new dialog">
                        <div className="dialog-head">
                            <span className="md-type-title">Bulk Edit</span>
                            <span
                                className="mdi mdi-close pull-right icon toggle-edit toggler"
                                onClick={this.props.onHide}
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

BulkEdit.propTypes = {
    posts: PropTypes.array.isRequired,
    onHide: PropTypes.func.isRequired,
};

BulkEdit.defaultProps = {
    posts: [],
};

export default BulkEdit;

