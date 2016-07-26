import React, { PropTypes } from 'react';
import EditPost from './edit-post';
import Slider from 'react-slick';

/**
 * Component for managing gallery's posts
 */
class EditPosts extends React.Component {
    renderPosts() {
        const { posts, postsToDeleteIds, onToggleDelete } = this.props;

        return posts.map((p, i) => {
            const willDelete = postsToDeleteIds.indexOf(p.id) !== -1;
            return (
                <div key={i} className={`frick-frame ${willDelete ? 'frick-delete' : ''}`}>
                    <EditPost post={p} />
                    <div className="frick-overlay">
                        <span>
                            <span className="mdi mdi-delete icon" />
                            <div className="md-type-caption">This post will be deleted</div>
                        </span>
                    </div>
                    {
                        posts.length > 1
                            ? <a>
                                <span
                                    className={`mdi mdi-close-circle icon ${willDelete ? 'addback' : ''}`}
                                    onClick={() => onToggleDelete(p.id)}
                                />
                            </a>
                            : ''
                    }
                </div>
            );
        });
    }

    render() {
        const { posts } = this.props;

        return (
            <div className="dialog-col col-xs-12 col-md-5">
                <Slider
                    infinite={posts.length > 1}
                    dots
                >
					{this.renderPosts()}
                </Slider>
            </div>
        );
    }
}

EditPosts.propTypes = {
    postsToDeleteIds: PropTypes.array.isRequired,
    posts: PropTypes.array.isRequired,
    onToggleDelete: PropTypes.func.isRequired,
};

EditPosts.defaultProps = {
    postsToDeleteIds: [],
    posts: [],
    onToggleDelete() {},
};

export default EditPosts;

