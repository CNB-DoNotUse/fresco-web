import React from 'react'
import global from '../../../lib/global'

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
                <img
                    className="img-link"
                    src={global.formatImg(this.props.post.image, 'small')} />
            </a>
        );
    }
}
