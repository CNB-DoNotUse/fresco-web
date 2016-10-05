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

export const CardReports = ({ reports, index = 0 }) => {
    if (!reports || !reports.length) return null;
    const report = reports[index];

    return (
        <div className="moderation-card__reports-ctr">
            <div className="moderation-card__reports-header">
                <span>Reports</span>
                <span className="moderation-card__reports-page-count">
                    <i className="mdi mdi-chevron-left" />
                    <span>{`${index + 1} / ${reports.length}`}</span>
                    <i className="mdi mdi-chevron-right" />
                </span>
            </div>
            <div className="moderation-card__report-message">
                <span className="moderation-card__spacer-bar" />
                {report.message}
            </div>
            <CardUser user={report.user} />
        </div>
    );
};

CardReports.propTypes = {
    reports: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
};

