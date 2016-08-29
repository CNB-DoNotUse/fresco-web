import React, { PropTypes } from 'react';
import Slider from 'react-slick';
import find from 'lodash/find';
import get from 'lodash/get';
import utils from 'utils';
import FrescoImage from '../global/fresco-image';

const renderPost = (post) => {
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
            src={post.image}
            size="medium"
            refreshInterval
        />
    );
};

const renderPosts = ({ editingPosts, originalPosts, onToggleDelete }) => (
    originalPosts.map((p, i) => {
        const deleteToggled = !find(editingPosts, { id: p.id });

        return (
            <div key={`post${i}`} className={`frick-frame ${deleteToggled ? 'frick-delete' : ''}`}>
                {renderPost(p)}
                <div className="frick-overlay">
                    <span>
                        <span className="mdi mdi-delete icon" />
                        <div className="md-type-caption">This post will be deleted</div>
                    </span>
                </div>
                {editingPosts.length > 1
                    ? <a className="frick-frame__delete-btn">
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

const renderPostsNoDelete = (originalPosts) => (
    originalPosts.map((p, i) => (
        <div key={`post${i}`} className="frick-frame">
            {renderPost(p)}
        </div>
    ))
);

const renderUpload = (u, i) => {
    if ((!typeof i === 'number') || !u || !u.type || !u.url) return null;

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
class EditPosts extends React.Component {

    static propTypes = {
        originalPosts: PropTypes.array.isRequired,
        editingPosts: PropTypes.array,
        className: PropTypes.string,
        uploads: PropTypes.array,
        onToggleDelete: PropTypes.func,
        canDelete: PropTypes.bool,
    }

    static defaultProps = {
        canDelete: false,
        uploads: [],
        editingPosts: [],
        originalPosts: [],
        className: '',
    }

    componentDidUpdate(prevProps) {
        // Reset slick to first index of we have different posts
        if (get(prevProps, 'originalPosts[0].id') !== get(this.props, 'originalPosts[0].id')) {
            this.slider.slickGoTo(0);
        }
    }

    render() {
        const {
            editingPosts,
            originalPosts,
            uploads,
            canDelete,
            onToggleDelete,
            className,
        } = this.props;

        const uploadsJSX = uploads.length
            ? uploads.map((u, i) => renderUpload(u, i)).filter(u => !!u)
            : null;

        const postsJSX = canDelete
            ? renderPosts({ editingPosts, originalPosts, onToggleDelete })
            : renderPostsNoDelete(originalPosts);

        const sliderJSX = uploadsJSX
            ? uploadsJSX.concat(postsJSX)
            : postsJSX;

        return (
            <Slider
                className={className}
                ref={r => this.slider = r}
                infinite={originalPosts.length > 1}
                swipeToSlide
                draggable
                dots
            >
                {sliderJSX}
            </Slider>
        );
    }
}

export default EditPosts;

