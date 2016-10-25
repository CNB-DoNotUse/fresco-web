import React, { PropTypes } from 'react';
import partial from 'lodash/partial';
import UserItem from '../global/user-item';

export const CardBadges = ({ strings }) => {
    const badgeLookup = {
        nsfw: 'graphic',
        abuse: 'abusive',
        spam: 'spam',
        stolen: 'stolen',
    };
    return (
        <div className="moderation-card__badges-ctr">
            {strings.map((s, i) => (
                <span key={i} className="moderation-card__badge">
                    {badgeLookup[s].toUpperCase()}
                </span>
            ))}
        </div>
    );
};

CardBadges.propTypes = {
    strings: PropTypes.array.isRequired,
};

export const CardUser = ({ user }) => (
    user ? (
        <div className="moderation-card__user-item-ctr">
            <UserItem user={user} metaType="flags" />
        </div>
    ) : null
);

CardUser.propTypes = {
    user: PropTypes.object.isRequired,
};

export const CardReports = ({ reports, index = 0, onClickIndex, report_count }) => {
    if (!reports || !reports.length) return null;
    const report = reports[index];

    return (
        <div className="moderation-card__reports-ctr">
            <div className="moderation-card__reports-header">
                <span>Reports</span>
                <span className="moderation-card__reports-page-count">
                    <i onClick={partial(onClickIndex, -1)} className="mdi mdi-chevron-left" />
                    <span>{`${index + 1} / ${report_count}`}</span>
                    <i onClick={partial(onClickIndex, 1)} className="mdi mdi-chevron-right" />
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
    reports: PropTypes.array,
    index: PropTypes.number,
    onClickIndex: PropTypes.func,
    report_count: PropTypes.number,
};

