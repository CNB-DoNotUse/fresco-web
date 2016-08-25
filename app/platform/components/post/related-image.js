import React from 'react';
import utils from 'utils';
import FrescoImage from '../global/fresco-image';

/** //
Description : Related posts at the bottom of the PostDetail view
// **/

/**
 * PostRelated parent object
 * @description Contains set of all other posts in the parent gallery
 */
export default class PostRelatedImage extends React.Component {
    render() {
        return (
            <a href={"/post/" + this.props.post.id}>
                <FrescoImage
                    className="img-link"
                    src={utils.formatImg(this.props.post.image, 'small')}
                />
            </a>
        );
    }
}
