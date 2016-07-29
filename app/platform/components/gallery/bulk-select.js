import React, { PropTypes } from 'react';
import BulkEdit from './bulk-edit';
import Create from './create';
import utils from 'utils';

/**
 * Gallery Bulk Select Parent Object
 * Component for bulk selecting posts
 */
class BulkSelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            createToggled: false,
            bulkEditToggled: false,
        };
    }

    onToggleCreate() {
        this.setState({ createToggled: !this.state.createToggled });
    }

    onToggleBulkEdit() {
        if (this.props.posts.length > 1) {
            this.setState({ bulkEditToggled: !this.state.bulkEditToggled });
        } else {
            this.setState({ bulkEditToggled: false });
            $.snackbar({ content: 'Select more than one gallery to edit' });
        }
    }

    clear() {
        this.props.setSelectedPosts([]);
    }

    render() {
        const { posts, setSelectedPosts } = this.props;
        const { createToggled, bulkEditToggled } = this.state;
        const count = `${posts.length} post${(utils.isPlural(posts.length)) ? 's' : ''}`;
        const thumbnails = posts.map((post, i) => (
            <a className="thumb" key={i}>
                <img
                    className="img-responsive"
                    src={utils.formatImg(post.image, 'small')}
                    role="presentation"
                />
            </a>
        ));

        return (
            <div>
                <div className={'well hover bulk toggled'} id="bulk-edit">
                    <div id="bulk-thumbs" className="thumbs">{thumbnails}</div>

                    <div className="row md-type-button">
                        <button
                            onClick={() => this.clear()}
                            type="button"
                            className="btn btn-flat"
                        >
                            Clear selection
                            <span id="post-count"> ({count}) </span>
                        </button>

                        <button
                            onClick={() => this.onToggleBulkEdit()}
                            type="button"
                            className="btn btn-flat pull-right toggle-edit toggler"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => this.onToggleCreate()}
                            type="button"
                            className="btn btn-flat pull-right toggle-gcreate toggler"
                        >
                            Create gallery
                        </button>
                    </div>

                </div>

                {bulkEditToggled
                    ? <BulkEdit posts={this.props.posts} />
                    : ''
                }

                {createToggled
                    ? <Create posts={posts} setSelectedPosts={(p) => setSelectedPosts(p)} />
                    : ''
                }
            </div>
        );
    }
}

BulkSelect.propTypes = {
    posts: PropTypes.array,
    setSelectedPosts: PropTypes.func.isRequired,
};

BulkSelect.defaultProps = {
    posts: [],
};

export default BulkSelect;

