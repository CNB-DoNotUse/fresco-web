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
        if (posts.length <= 1) {
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

        return gallery.posts.map((p, i) => {
            const deleteToggled = !find(posts, { id: p.id });

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

    renderUpload(u, i) {
        if (!typeof(i) === 'number' || !u || !u.type || !u.url) return null;

        if (u.type === 'image') {
            return (
                <div key={`upload${i}`} className="frick-frame">
                    <img
                        role="presentation"
                        className="img-responsive"
                        src={u.url}
                    />
                </div>
            );
        } else if (u.type === 'video') {
            return (
                <div key={`upload${i}`} className="frick-frame">
                    <video width="100%" height="100%" src={u.url} controls>
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        return null;
    }

    renderUploads() {
        const { uploads } = this.props;
        if (!uploads.length) return null;

        return uploads.map((u, i) => this.renderUpload(u, i)).filter(u => !!u);
    }

    renderSliderImages() {
        const uploadsJSX = this.renderUploads();
        const postsJSX = this.renderPosts();

        return uploadsJSX
            ? uploadsJSX.concat(postsJSX)
            : postsJSX;
    }

    render() {
        const { posts } = this.props;

        return (
            <div className="dialog-col col-xs-12 col-md-5">
                <Slider infinite={posts.length > 1} dots >
					{this.renderSliderImages()}
                </Slider>
            </div>
        );
    }
}

EditPosts.propTypes = {
    gallery: PropTypes.object.isRequired,
    posts: PropTypes.array.isRequired,
    uploads: PropTypes.array.isRequired,
    onToggleDelete: PropTypes.func.isRequired,
};

export default EditPosts;

