import React, { PropTypes } from 'react';
import { CardBadges, CardUser, CardReports } from './card-parts';

const UserCard = ({
    user,
    reportData,
    onClickReportsIndex,
    onSuspend,
    onSkip,
    onRemove,
    onDisable }) => (
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

        {reportData &&
            <CardReports
                {...reportData}
                report_count={user.report_count}
                onClickIndex={onClickReportsIndex}
            />
        }

        <div className="moderation-card__actions-ctr">
            <span
                className="moderation-card__action"
                onClick={onSkip}
            >
                skip
            </span>
            <div>
                <span
                    className="moderation-card__action"
                    onClick={onSuspend}
                >
                    {user.suspended_until ? 'unsuspend user' : 'suspend user'}
                </span>
                <span
                    className="moderation-card__action"
                    onClick={onDisable}
                >
                    disable
                </span>
            </div>
        </div>
    </div>
);

UserCard.propTypes = {
    user: PropTypes.object.isRequired,
    reportData: PropTypes.object.isRequired,
    onClickReportsIndex: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onSuspend: PropTypes.func.isRequired,
    onSkip: PropTypes.func.isRequired,
    onDisable: PropTypes.func.isRequired,
};

export default UserCard;

