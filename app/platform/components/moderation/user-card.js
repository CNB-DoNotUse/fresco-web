import React, { Component, PropTypes } from 'react';
import { CardBadges, CardUser, CardReports } from './card-parts';

export default class UserCard extends Component {
    static propTypes = {
        reportData: PropTypes.object.isRequired,
        onClickReportsIndex: PropTypes.func.isRequired,
        onSuspend: PropTypes.func.isRequired,
        onSkip: PropTypes.func.isRequired,
        opacity: PropTypes.number,
        report_count: PropTypes.number,
        report_reasons: PropTypes.array,
        suspended_until: PropTypes.string,
        bio: PropTypes.string,
        id: PropTypes.string,
        username: PropTypes.string,
        full_name: PropTypes.string,
    };

    static defaultProps = {
        opacity: 1,
    };

    render() {
        const {
            reportData,
            onClickReportsIndex,
            onSuspend,
            onSkip,
            opacity,
            report_count,
            report_reasons,
            suspended_until,
            bio,
            id,
            username,
            full_name,
        } = this.props;

        return (
            <div
                style={{ opacity }}
                className="moderation-card moderation-card__gallery"
            >
                <CardBadges strings={report_reasons} />

                <div className="moderation-card__user-info">
                    <CardUser user={{ id, username, full_name }} />

                    <div className="moderation-card__user-bio">
                        {bio}
                    </div>
                </div>

                {reportData &&
                    <CardReports
                        {...reportData}
                        report_count={report_count}
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
                            {suspended_until ? 'unsuspend user' : 'suspend user'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

