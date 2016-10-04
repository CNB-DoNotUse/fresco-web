import React, { PropTypes } from 'react';
import { CardBadges, CardUser } from './card-parts';

const UserCard = ({ user }) => (
    <div className="moderation-card moderation-card__gallery">
        <CardBadges strings={user.report_reasons} />

        <div className="moderation-card__user-info">
            <CardUser user={user} />

            <div className="moderation-card__user-bio">
                {user.bio}
            </div>

            <div>
                <span className="moderation-card__user-link">activity</span>
                <span className="moderation-card__user-link">blocks</span>
            </div>
        </div>

        <div className="moderation-card__actions-ctr">
            <span className="moderation-card__action">skip</span>
            <div>
                <span className="moderation-card__action">suspend user</span>
                <span className="moderation-card__action">disable</span>
            </div>
        </div>
    </div>
);

UserCard.propTypes = {
    user: PropTypes.object.isRequired,
};

export default UserCard;

