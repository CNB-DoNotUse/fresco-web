import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * User Sidebar parent object
 * @description Column on the left of the user page
 */
class Sidebar extends React.Component {
    renderUserName(user) {
        const { username, full_name } = user;

        if (full_name && username) {
            return (
                <div className="meta-user--name">
                    <span>
                        {`${full_name}`}
                    </span>
                    <span>
                        {`@${username}`}
                    </span>
                </div>
            );
        }

        if (username) {
            return (
                <div className="meta-user--name">
                    <span>
                        {`@${username}`}
                    </span>
                </div>
            );
        }
    }

    renderUserMeta(user) {
        const newUserJSX = (
            <div className="meta-user--stats">
                New user!
            </div>
        );
        if (!user.stats) return newUserJSX;

        const { photos = 0, videos = 0 } = user.stats;

        if (!photos && !videos) {
            return newUserJSX;
        }
        return (
            <div className="meta-user--stats">
                {user.location
                    ? `${user.location} &#183;`
                    : ''
                }
                {`${photos} photos, ${videos} videos`}
            </div>
        );
    }

    render() {
        const { detailUser } = this.props;
        const avatar = detailUser.avatar || utils.defaultAvatar;

        return (
            <div className="col-sm-4 profile hidden-xs">
                <div className="container-fluid fat">
                    <div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
                        <img
                            className="img-responsive img-avatar"
                            src={avatar}
                            role="presentation"
                        />

                        <div className="meta meta-user">
                            <div className="meta-user--icon">
                                <i className="mdi mdi-account" />
                            </div>
                            <div className="meta-user--text">
                                {this.renderUserName(detailUser)}
                                {this.renderUserMeta(detailUser)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Sidebar.propTypes = {
    user: PropTypes.object.isRequired,
    detailUser: PropTypes.object.isRequired,
};

export default Sidebar;

