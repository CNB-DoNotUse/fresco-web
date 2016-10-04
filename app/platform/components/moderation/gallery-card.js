import React, { PropTypes } from 'react';
import get from 'lodash/get';
import FrescoImage from '../global/fresco-image';

const GalleryCard = ({ gallery }) => (
    <div className="moderation-card moderation-card__gallery">
        <FrescoImage
            className="moderation-card__image"
            src={get(gallery, 'posts[0].image')}
            loadWithPlaceHolder
        />
    </div>
);

GalleryCard.propTypes = {
    gallery: PropTypes.object,
};

export default GalleryCard;

