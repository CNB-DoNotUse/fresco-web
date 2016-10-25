import React from 'react';
import FrescoImage from '../global/fresco-image';

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
                    src={this.props.post.image}
                    size="medium"
                    placeholderStyle={{ height: "300px" }}
                />
            </a>
        );
    }
}
