import React, { PropTypes } from 'react';
import get from 'lodash/get';
import FrescoImage from '../global/fresco-image';
import { CardBadges, CardUser } from './card-parts';

const GalleryCard = ({
    posts,
    report_reasons,
    owner,
    caption = 'No caption' }) => (
    <div className="moderation-card moderation-card__gallery">
        <FrescoImage
            className="moderation-card__image"
            src={get(posts, '[0].image')}
            loadWithPlaceHolder
        />

        <div className="moderation-card__gallery-caption">
            {caption}
        </div>

        <CardBadges strings={report_reasons} />

        {owner && <CardUser user={owner} />}

        <div className="moderation-card__gallery-actions-ctr">
            <span className="moderation-card__gallery-action">skip</span>
            <div>
                {report_reasons.includes('graphic') &&
                    <span className="moderation-card__gallery-action">mark graphic</span>}
                <span className="moderation-card__gallery-action">suspend user</span>
                <span className="moderation-card__gallery-action">delete</span>
            </div>
        </div>
    </div>
);

GalleryCard.propTypes = {
    posts: PropTypes.array.isRequired,
    report_reasons: PropTypes.array.isRequired,
    owner: PropTypes.object,
    caption: PropTypes.string,
};

export default GalleryCard;

