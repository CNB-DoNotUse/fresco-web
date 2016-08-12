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
                        {`@${full_name}`}
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

    render() {
        const { detailUser, user } = this.props;
        const avatar = detailUser.avatar || utils.defaultAvatar;
        const photoCount = detailUser.stats ? detailUser.stats.photos : 0;
        const videoCount = detailUser.stats ? detailUser.stats.videos : 0;

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
                                <div className="meta-user--stats">
                                    {detailUser.location
                                        ? `${detailUser.location} &#183;`
                                        : ''
                                    }
                                    {`${photoCount} photos, ${videoCount} videos`}
                                </div>
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

