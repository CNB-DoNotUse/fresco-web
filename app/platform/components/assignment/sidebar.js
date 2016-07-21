import React, { PropTypes } from 'react';
import utils from 'utils';
import moment from 'moment';

/**
 * sidebar Component
 * Description : Column on the left of the posts grid on the assignment detail page
 */
class Sidebar extends React.Component {
    /**
     * AssignmentStats stats inside the sidebar
     */
    renderStats() {
        const { assignment, stats } = this.props;
        const expirationTime = new Date(assignment.ends_at);
        const expiredText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ')
            + moment(expirationTime).fromNow();
        const createdText = 'Created at ' + moment(assignment.created_at).format('LT');

        if (!stats) {
            return '';
        }

        return (
            <div className="meta-list">
                <ul className="md-type-subhead">
                    <li>
                        <span className="mdi mdi-map-marker icon"></span>
                        <span>
                            {
                                assignment.location
                                    ? assignment.address || 'No Address'
                                    : 'Global'
                            }
                        </span>
                    </li>
                    <li>
                        <span className="mdi mdi-clock icon"></span>
                        <span>{createdText}</span>
                    </li>
                    <li className="expired">
                        <span className="mdi mdi-clock icon"></span>
                        <span>{expiredText}</span>
                    </li>
                    <li>
                        <span className="mdi mdi-account icon"></span>
                        <span>{assignment.outlets[0].title}</span>
                    </li>
                    <li>
                        <span className="mdi mdi-image icon"></span>
                        <span>
                            {
                                stats.photos
                                    ? stats.photos + ' photo' + (utils.isPlural(stats.photos) ? 's' : '')
                                    : 'No photos'
                            }
                        </span>
                    </li>
                    <li>
                        <span className="mdi mdi-movie icon"></span>
                        <span>
                            {
                                stats.videos
                                    ? stats.videos + ' video' + (utils.isPlural(stats.video) ? 's' : '')
                                    : 'No videos'
                            }
                        </span>
                    </li>
                </ul>
            </div>
        );
    }

    render() {
        const { assignment, expireAssignment } = this.props;
        const expireButton = (
            <button
                className="btn fat tall btn-error assignment-expire"
                onClick={expireAssignment}
            >
                Expire
            </button>
        );

        return (
            <div className="col-sm-4 profile hidden-xs">
                <div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
                    <div className="meta">
                        <div className="meta-description" id="story-description">
                            {assignment.caption || 'No Description'}
                        </div>

                        <div className="meta-user">
                            {moment().diff(assignment.ends_at) < 1
                                ? expireButton
                                : ''
                            }
                        </div>

                        {this.renderStats()}

                    </div>
                </div>
            </div>

        );
    }
}

Sidebar.propTypes = {
    assignment: PropTypes.object.isRequired,
    expireAssignment: PropTypes.func.isRequired,
    stats: PropTypes.object.isRequired,
};

export default Sidebar;

