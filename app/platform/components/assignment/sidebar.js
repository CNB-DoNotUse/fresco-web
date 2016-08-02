import React, { PropTypes } from 'react';
import utils from 'utils';
import moment from 'moment';

/**
 * Sidebar Component
 * Description : Column on the left of the posts grid on the assignment detail page
 */
class Sidebar extends React.Component {

    /**
     * AssignmentStats stats inside the sidebar
     */
    renderStats() {
        const { assignment } = this.props;
        const expirationTime = new Date(assignment.ends_at);
        const expiredText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ')
            + moment(expirationTime).fromNow();
        const createdText = 'Created at ' + moment(assignment.created_at).format('LT');
        const {photo_count, video_count } = assignment;

        return (
            <div className="meta-list">
                <ul className="md-type-subhead">
                    <li>
                        <span className="mdi mdi-map-marker icon"></span>
                        <span>
                            {assignment.location
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
                        <span>
                            {assignment.outlets[0]
                                ? assignment.outlets[0].title
                                : ''
                            }
                        </span>
                    </li>
                    <li>
                        <span className="mdi mdi-image icon"></span>
                        <span>
                            {photo_count + ' photo' + (utils.isPlural(photo_count) ? 's' : '')}
                        </span>
                    </li>
                    <li>
                        <span className="mdi mdi-movie icon"></span>
                        <span>
                            {video_count + ' photo' + (utils.isPlural(video_count) ? 's' : '')}
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
};

export default Sidebar;

