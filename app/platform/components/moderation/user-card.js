import React, { Component, PropTypes } from 'react';
import partial from 'lodash/partial';
import { CardBadges, CardUser, CardReports } from './card-parts';

export default class UserCard extends Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        reportData: PropTypes.object.isRequired,
        onClickReportsIndex: PropTypes.func.isRequired,
        onSuspend: PropTypes.func.isRequired,
        onSkip: PropTypes.func.isRequired,
        onDisable: PropTypes.func.isRequired,
    };

    state = {
        opacity: 1,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.id !== this.props.user.id) {
            this.setState({ opacity: 1 });
        }
    }

    componentWillUnmount() {
        if (this.timer) clearTimeout(this.timer);
    }

    onRemove = (cb) => {
        this.setState({ opacity: 1 }, () => {
            this.timer = setTimeout(() => {
                this.setState({ opacity: 0 }, () => {
                    this.timer = setTimeout(cb, 300);
                });
            }, 300);
        });
    }

    render() {
        const {
            user,
            reportData,
            onClickReportsIndex,
            onSuspend,
            onSkip,
            onDisable,
        } = this.props;

        return (
            <div
                style={{ opacity: this.state.opacity }}
                className="moderation-card moderation-card__gallery"
            >
                <CardBadges strings={user.report_reasons} />

                <div className="moderation-card__user-info">
                    <CardUser user={user} />

                    <div className="moderation-card__user-bio">
                        {user.bio}
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
                        onClick={partial(this.onRemove, onSkip)}
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
                    </div>
                </div>
            </div>
        );
    }
}

