import React, { PropTypes } from 'react';
import utils from 'utils';
import FrescoImage from '../global/fresco-image';

/**
 * Single Edit-Post Element
 * @description Post element that is wrapped inside container slick usually
 */

const EditPost = ({ post }) => {
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
        <FrescoImage image={post.image} size="medium" />
    );
};

EditPost.propTypes = {
    post: PropTypes.object,
};

EditPost.defaultProps = {
    post: {},
};

export default EditPost;

