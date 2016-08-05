import React, { PropTypes } from 'react';
import EditPost from './edit-post';
import Slider from 'react-slick';
import find from 'lodash/find';

/**
 * Component for managing gallery's posts
 */
class EditPosts extends React.Component {
    renderDeleteButton(post, deleteToggled) {
        const { posts, onToggleDelete } = this.props;
        if (posts.length <= 0) {
            return '';
        }

        return (
            <a>
                <span
                    className={`mdi mdi-close-circle icon ${deleteToggled ? 'addback' : ''}`}
                    onClick={() => onToggleDelete(post)}
                />
            </a>
        );
    }

    renderPosts() {
        const { posts, gallery } = this.props;

        return posts.map((p, i) => {
            const deleteToggled = !find(gallery.posts, { id: p.id });

            return (
                <div key={i} className={`frick-frame ${deleteToggled ? 'frick-delete' : ''}`}>
                    <EditPost post={p} />
                    <div className="frick-overlay">
                        <span>
                            <span className="mdi mdi-delete icon" />
                            <div className="md-type-caption">This post will be deleted</div>
                        </span>
                    </div>
                    {this.renderDeleteButton(p, deleteToggled)}
                </div>
            );
        });
    }

    render() {
        const { posts } = this.props;

        return (
            <div className="dialog-col col-xs-12 col-md-5">
                <Slider infinite={posts.length > 1} dots >
					{this.renderPosts()}
                </Slider>
            </div>
        );
    }
}

EditPosts.propTypes = {
    gallery: PropTypes.object.isRequired,
    posts: PropTypes.array.isRequired,
    onToggleDelete: PropTypes.func.isRequired,
};

export default EditPosts;

