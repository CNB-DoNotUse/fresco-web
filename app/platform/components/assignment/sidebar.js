import React, { PropTypes } from 'react';
import utils from 'utils';
import time from 'app/lib/time';
import moment from 'moment';

/**
 * Sidebar Component
 * Description : Column on the left of the posts grid on the assignment detail page
 */
class Sidebar extends React.Component {

    static propTypes = {
        assignment: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        onClickAccepted: PropTypes.func.isRequired,
        expireAssignment: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        map: PropTypes.node.isRequired,
    };

    /**
     * AssignmentStats stats inside the sidebar
     */
    renderStats() {
        const { assignment, user, onClickAccepted } = this.props;
        const acceptedCount = assignment.accepted_count;
        const expirationTime = new Date(assignment.ends_at);
        const expiredText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ')
            + moment(expirationTime).fromNow();
        const createdText = 'Created at ' + time.formatTime(assignment.created_at, true);
        const { photo_count, video_count } = assignment;

        return (
            <div className="meta-list">
                <ul className="md-type-subhead">
                    <li>
                        <span className="mdi mdi-map-marker icon" />
                        <span>
                            {assignment.location
                                ? assignment.address || 'No Address'
                                : 'Global'
                            }
                        </span>
                    </li>
                    <li>
                        <span className="mdi mdi-clock icon" />
                        <span>{createdText}</span>
                    </li>
                    <li className="expired">
                        <span className="mdi mdi-clock icon" />
                        <span>{expiredText}</span>
                    </li>
                    {user.roles.includes('admin') && (
                        assignment.outlets.map((o, i) => (
                            <li key={i}>
                                <span className="mdi mdi-account-multiple icon" />
                                <a href={`/outlet/${o.id}`}>{o.title}</a>
                            </li>
                        ))
                    )}
                    <li>
                        <span className="mdi mdi-image icon" />
                        <span>
                            {photo_count + ' photo' + (utils.isPlural(photo_count) ? 's' : '')}
                        </span>
                    </li>
                    <li>
                        <span className="mdi mdi-movie icon" />
                        <span>
                            {video_count + ' video' + (utils.isPlural(video_count) ? 's' : '')}
                        </span>
                    </li>
                    {user.roles.includes('admin') ? (
                        <li style={{ cursor: 'pointer' }} onClick={onClickAccepted}>
                            <span className="mdi mdi-account-multiple icon" />
                            <span>{`${acceptedCount} accepted ${acceptedCount === 1 ? 'user' : 'users'}`}</span>
                        </li>
                    ) : (
                        <li>
                            <span className="mdi mdi-account-multiple icon" />
                            <span>{`${acceptedCount} accepted ${acceptedCount === 1 ? 'user' : 'users'}`}</span>
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    render() {
        const { assignment, expireAssignment, loading, map } = this.props;
        const expireButton = (
            <button
                className="btn fat tall btn-error assignment-expire"
                onClick={expireAssignment}
                disabled={loading}
            >
                Expire
            </button>
        );

        return (
            <div className="col-sm-4 profile hidden-xs">
                <div className="row">
                    <div className="col-sm-10 col-md-8 col-sm-offset-1">
                        <div className="meta">
                            <div className="meta-description" id="story-description">
                                {assignment.caption || 'No Description'}
                            </div>

                            {moment().diff(assignment.ends_at) < 1 && (
                                <div className="meta-user">{expireButton}</div>
                            )}

                            {this.renderStats()}
                        </div>
                    </div>
                </div>

                {map}
            </div>

        );
    }
}

export default Sidebar;

