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
                    <span>{`${full_name}`}</span>
                    <span>{`@${username}`}</span>
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

        return <div className="meta-user--name" />;
    }

    renderUserMeta(user) {
        const { photos, videos } = user;

        if (!photos && !videos) {
            return (
                <div className="meta-user--stats">
                    New user!
                </div>
            )
        }

        return (
            <div className="meta-user--stats">
                {user.location ? 
                    `${user.location} &#183;`
                : ''}
                
                {`${photos} photos, ${videos} videos`}
            </div>
        );
    }

    render() {
        const { user, detailUser } = this.props;
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
                            <div className="meta-list">
                                <ul className="md-type-subhead">
                                    {detailUser.email ?
                                        <li className="ellipses">
                                            <span className="mdi mdi-email icon"></span>
                                            <a target="_top" href={`mailto:${detailUser.email}`}>
                                                {detailUser.email}
                                            </a>
                                        </li>
                                    : ''}

                                    {detailUser.stripe_account_id ?
                                        <li className="ellipses">
                                            <span className="mdi mdi-bank icon"></span>
                                            <a
                                                target="_top"
                                                href={`https://dashboard.stripe.com/${detailUser.stripe}`}
                                            >
                                                Stripe
                                            </a>
                                        </li>
                                    : ''}
                                </ul>
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

