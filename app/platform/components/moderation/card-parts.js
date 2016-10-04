import React, { PropTypes } from 'react';

export const CardBadges = ({ strings }) => (
    <div className="moderation-card__badges-ctr">
        {strings.map(s => (
            <span className="moderation-card__badge">
                {s.toUpperCase()}
            </span>
        ))}
    </div>
);

CardBadges.propTypes = {
    reason: PropTypes.array.isRequired,
};

