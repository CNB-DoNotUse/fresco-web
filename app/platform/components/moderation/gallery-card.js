import React, { PropTypes } from 'react';
import get from 'lodash/get';
import FrescoImage from '../global/fresco-image';
import { CardBadges, CardUser } from './card-parts';

const GalleryCard = ({ posts, report_reasons, owner }) => (
    <div className="moderation-card moderation-card__gallery">
        <FrescoImage
            className="moderation-card__image"
            src={get(posts, '[0].image')}
            loadWithPlaceHolder
        />
        <CardBadges strings={report_reasons} />
        {owner && <CardUser user={owner} />}
    </div>
);

GalleryCard.propTypes = {
    posts: PropTypes.array.isRequired,
    report_reasons: PropTypes.array.isRequired,
};

export default GalleryCard;

