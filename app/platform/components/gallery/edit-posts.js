import React, { PropTypes } from 'react';
import EditPost from './edit-post';
import Slider from 'react-slick';
import find from 'lodash/find';

const renderPosts = (posts, gallery, onToggleDelete) => (
    gallery.posts.map((p, i) => {
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
                {posts.length > 1
                    ? <a>
                        <span
                            className={`mdi mdi-close-circle icon ${deleteToggled ? 'addback' : ''}`}
                            onClick={() => onToggleDelete(p)}
                        />
                    </a>
                    : null
                }
            </div>
        );
    })
);

const renderPostsNoDelete = (posts, gallery) => (
    gallery.posts.map((p, i) => (
        <div key={i} className="frick-frame">
            <EditPost post={p} />
        </div>
    ))
);

const renderUpload = (u, i) => {
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
};

/**
 * Component for managing gallery's posts
 */
const EditPosts = ({ posts, uploads, gallery, canDelete, onToggleDelete, className }) => {
    const uploadsJSX = uploads.length
        ? uploads.map((u, i) => renderUpload(u, i)).filter(u => !!u)
        : null;
    const postsJSX = canDelete
        ? renderPosts(posts, gallery, onToggleDelete)
        : renderPostsNoDelete(posts, gallery, onToggleDelete);
    const sliderJSX = uploadsJSX
        ? uploadsJSX.concat(postsJSX)
        : postsJSX;

    return (
        <div className={className}>
            <Slider infinite={posts.length > 1} dots >
                {sliderJSX}
            </Slider>
        </div>
    );
};

EditPosts.propTypes = {
    gallery: PropTypes.object.isRequired,
    posts: PropTypes.array.isRequired,
    canDelete: PropTypes.bool.isRequired,
    className: PropTypes.string,
    uploads: PropTypes.array,
    onToggleDelete: PropTypes.func,
};

EditPosts.defaultProps = {
    canDelete: true,
    uploads: [],
    posts: [],
    className: '',
};

export default EditPosts;

