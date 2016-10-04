import React, { PropTypes } from 'react';
import UserItem from '../global/user-item';

export const CardBadges = ({ strings }) => (
    <div className="moderation-card__badges-ctr">
        {strings.map((s, i) => (
            <span key={i} className="moderation-card__badge">
                {s.toUpperCase()}
            </span>
        ))}
    </div>
);

CardBadges.propTypes = {
    strings: PropTypes.array.isRequired,
};

export const CardUser = ({ user }) => (
    <div className="moderation-card__user-item-ctr">
        <UserItem user={user} metaType="flags" />
    </div>
);

CardUser.propTypes = {
    user: PropTypes.object.isRequired,
};

