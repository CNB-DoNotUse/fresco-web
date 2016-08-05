import React, { PropTypes } from 'react';
import EditTags from './edit-tags';
import EditStories from './edit-stories';
import EditPost from './edit-post';
import Slick from 'react-slick';
import utils from 'utils';
import uniq from 'lodash/uniqBy';

/**
 * Component for editing multiple posts at once (from possibly different galleries)
 * Bulk Edit Parent Object
 */
class BulkEdit extends React.Component {
    constructor(props) {
        super(props);

        const galleries = this.getGalleriesFromPosts();
        const tags = this.getTagsFromGalleries(galleries);
        const stories = this.getStoriesFromGalleries(galleries);
        this.state = {
            caption: '',
            tags,
            stories,
            galleries,
        };
    }

    componentDidMount() {
        $.material.init();
    }

    // getInitialState() {

    // }

    getGalleriesFromPosts() {
        const { posts } = this.props;
        const galleryIds = uniq(posts.map(p => p.parent.id));
    }

    // getTagsFromGalleries(galleries) {
    //     galleries.map(g => )
    // }

    clear() {
        this.setState({
            caption: '',
            tags: [],
            stories: [],
        });
    }

    /**
     * Revert the component to it's initial state (pre-edits)
     */
    revert() {
        const stateToSet = {};
        const caption = this.state.galleries[0].caption;
        const allSame = this.state.galleries.every(gallery => {
            return gallery.caption == caption;
        });

        if (allSame) {
            stateToSet.caption = caption;
        }

        stateToSet.tags = this.getInitialTags();
        stateToSet.stories = this.getInitialStories();

        this.setState(stateToSet);
    }

    /**
     * Save the edits made to each post
     */
    save() {
        const params = {
            galleries: this.state.galleries.map(g => { return g.id; })
        };

        if (this.state.caption.length > 0) {
            params.caption = this.state.caption;
        }

        // Tags
        if (this.state.tags.length > 0) {
            params.tags = this.state.tags;
        }

        // TODO: add support for tags, stories
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
            },
        });
    }

    renderBody() {
        const posts = this.props.posts.map((post, i) => (
            <div key={i}>
                <EditPost post={post} />
            </div>
        ));

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <div className="dialog-row">
                        <textarea
                            ref="caption"
                            type="text"
                            className="form-control floating-label"
                            placeholder="Caption"
                            value={this.state.caption}
                            onChange={(e) => this.setState({ caption: e.target.value })}
                        />
                    </div>

                    <EditTags
                        ref="tags"
                        tags={this.state.tags}
                        updateTags={(t) => this.setState({ tags: t })}
                    />

                    <EditStories
                        stories={this.state.stories}
                        updateStories={(s) => this.setState({ stories: s })}
                    />
                </div>

                <Slick
                    className="gialog-col col-xs-12 col-md-5"
                    dots
                >
                    {posts}
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

