import React, { PropTypes } from 'react';
import FrescoImage from '../global/fresco-image';
import utils from 'utils';

/**
 * Gallery Bulk Select Parent Object
 * Component for bulk selecting posts
 */
class BulkSelect extends React.Component {
    clear() {
        this.props.setSelectedPosts([]);
    }

    render() {
        const { posts, onToggleCreate, onToggleEdit } = this.props;
        const count = `${posts.length} post${(utils.isPlural(posts.length)) ? 's' : ''}`;
        const thumbnails = posts.map((post, i) => (
            <a className="thumb" key={i}>
                <FrescoImage
                    className="img-responsive"
                    src={post.image}
                    size="small"
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
                            onClick={() => onToggleEdit()}
                            type="button"
                            className="btn btn-flat pull-right toggle-edit toggler"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => onToggleCreate()}
                            type="button"
                            className="btn btn-flat pull-right toggle-gcreate toggler"
                        >
                            Create gallery
                        </button>
                    </div>

                </div>
            </div>
        );
    }
}

BulkSelect.propTypes = {
    posts: PropTypes.array,
    setSelectedPosts: PropTypes.func.isRequired,
    onToggleEdit: PropTypes.func,
    onToggleCreate: PropTypes.func,
};

BulkSelect.defaultProps = {
    posts: [],
};

export default BulkSelect;

