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

        this.state = { loading: false };
    }

    componentDidMount() {
        $.material.init();
        this.getStateFromProps(this.props);
    }

    /**
     * Save the edits made to each gallery
     */
    onClickSave() {
        this.saveGalleries();
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
        })
        .then(() => this.setState(this.getStateFromGalleries(galleries)));
    }

    getStateFromGalleries(galleries) {
        if (!galleries) return { galleries: [], tags: [], stories: [], caption: '' };
        const tags = uniq(galleries.reduce((p, c) => (p.concat(c.tags)), []));
        const stories = uniqBy(galleries.reduce((p, c) => (p.concat(c.stories)), []), 'id');
        const caption = galleries.reduce((p, c) => (p === c.caption ? p : ''), galleries[0].caption);
        const posts = uniqBy(galleries.reduce((p, c) => (p.concat(c.posts)), []), 'id');

        return { galleries, tags, stories, caption, posts };
    }

    saveGallery(gallery, data) {
        if (!gallery || !data) return null;
        const { tags, caption, stories } = data;

        const params = {
            tags,
            caption,
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
        };

        return $.ajax(`/api/gallery/${gallery.id}/update`, {
            data: JSON.stringify(params),
            method: 'post',
            contentType: 'application/json',
        });
    }

    saveGalleries() {
        const { loading, galleries, caption, tags, stories } = this.state;
        if (loading) return;
        this.setState({ loading: true });

        Promise.all(galleries.map(g => this.saveGallery(g, { caption, tags, stories })))
        .then(() => {
            $.snackbar({ content: 'Galleries updated!' });
        }, () => {
            $.snackbar({ content: 'There was an error updating galleries.' });
        })
        .then(() => {
            this.setState({ loading: false });
        });
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
        const { loading } = this.state;

        return (
            <div className="dialog-foot">
                <button
                    onClick={() => this.revert()}
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Revert
                </button>
                <button
                    onClick={() => this.clear()}
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                >
                    Clear All
                </button>
                <button
                    onClick={() => this.onClickSave()}
                    type="button"
                    className="btn btn-flat pull-right"
                    disabled={loading}
                >
                    Save
                </button>
                <button
                    onClick={this.props.onHide}
                    type="button"
                    className="btn btn-flat pull-right toggle-bedit"
                    disabled={loading}
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

