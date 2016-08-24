import React, { PropTypes } from 'react';
import FrescoImage from '../global/fresco-image';
import Slider from 'react-slick';
import find from 'lodash/find';
import utils from 'utils';

const renderPost = (post, refreshInterval) => {
    if (post.video) {
        return (
            <video width="100%" height="100%" data-id={post.id} controls>
                <source
                    src={utils.formatVideo(post.video)}
                    type="video/mp4"
                />
                Your browser does not support the video tag.
            </video>
        );
    }

    return (
        <FrescoImage
            refreshInterval={refreshInterval}
            src={post.image}
            size="medium"
        />
    );
};

const renderPosts = ({ editingPosts, originalPosts, onToggleDelete, refreshInterval }) => (
    originalPosts.map((p, i) => {
        const deleteToggled = !find(editingPosts, { id: p.id });

        return (
            <div key={`post${i}`} className={`frick-frame ${deleteToggled ? 'frick-delete' : ''}`}>
                {renderPost(p, refreshInterval)}
                <div className="frick-overlay">
                    <span>
                        <span className="mdi mdi-delete icon" />
                        <div className="md-type-caption">This post will be deleted</div>
                    </span>
                </div>
                {editingPosts.length > 1
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

const renderPostsNoDelete = (originalPosts, refreshInterval) => (
    originalPosts.map((p, i) => (
        <div key={`post${i}`} className="frick-frame">
            {renderPost(p, refreshInterval)}
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
const EditPosts = ({
    editingPosts,
    originalPosts,
    uploads,
    canDelete,
    onToggleDelete,
    className,
    refreshInterval }) => {
    const uploadsJSX = uploads.length
        ? uploads.map((u, i) => renderUpload(u, i)).filter(u => !!u)
        : null;
    const postsJSX = canDelete
        ? renderPosts({ editingPosts, originalPosts, onToggleDelete, refreshInterval })
        : renderPostsNoDelete(originalPosts, refreshInterval);
    const sliderJSX = uploadsJSX
        ? uploadsJSX.concat(postsJSX)
        : postsJSX;

    return (
        <Slider
            className={className}
            infinite={originalPosts.length > 1}
            adaptiveHeight
            swipeToSlide
            draggable
            dots
        >
            {sliderJSX}
        </Slider>
    );
};

EditPosts.propTypes = {
    originalPosts: PropTypes.array.isRequired,
    editingPosts: PropTypes.array,
    className: PropTypes.string,
    uploads: PropTypes.array,
    onToggleDelete: PropTypes.func,
    canDelete: PropTypes.bool,
    refreshInterval: PropTypes.bool,
};

EditPosts.defaultProps = {
    canDelete: false,
    uploads: [],
    editingPosts: [],
    originalPosts: [],
    className: '',
};

export default EditPosts;

