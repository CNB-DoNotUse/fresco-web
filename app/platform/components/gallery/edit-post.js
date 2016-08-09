import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Single Edit-Post Element
 * @description Post element that is wrapped inside container slick usually
 */

class EditPost extends React.Component {
    render() {
        const { post } = this.props;

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
            <img
                role="presentation"
                className="img-responsive"
                src={utils.formatImg(post.image, 'medium')}
                data-id={post.id}
            />
        );
    }
}

EditPost.propTypes = {
    post: PropTypes.object,
};

EditPost.defaultProps = {
    post: {},
};

export default EditPost;

