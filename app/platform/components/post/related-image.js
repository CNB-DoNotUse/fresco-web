import React, { PropTypes } from 'react';
import FrescoImage from '../global/fresco-image';

/**
 * PostRelated parent object
 * @description Contains set of all other posts in the parent gallery
 */
const PostRelatedImage = ({ post }) => (
    <a href={`/post/${post.id}`}>
        <FrescoImage
            className="img-link"
            src={post.image}
            size="medium"
            placeholderStyle={{ height: '300px' }}
        />
    </a>
);

PostRelatedImage.propTypes = {
    post: PropTypes.object,
};

export default PostRelatedImage;

