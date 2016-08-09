import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * User Sidebar parent object
 * @description Column on the left of the user page
 */
class UserSidebar extends React.Component {
    render() {
        const { detailUser, user } = this.props;
        const avatar = detailUser.avatar || utils.defaultAvatar;
        const galleries = detailUser.stats ? detailUser.stats.galleries : 0;
        const photos = detailUser.stats ? detailUser.stats.photos : 0;
        const videos = detailUser.stats ? detailUser.stats.videos : 0;
        let email = '';
        let stripe = '';

        if (user.permissions.includes('get-all-purchases')) {
            email = detailUser.email
                ? <li className="ellipses">
                    <span className="mdi mdi-email icon"></span>
                    <a target="_top" href={`mailto:${detailUser.email}`}>
                        {detailUser.email}
                    </a>
                </li>
                : '';

            stripe = detailUser.stripe
                ? <li className="ellipses">
                    <span className="mdi mdi-bank icon"></span>
                    <a
                        target="_top"
                        href={`https://dashboard.stripe.com/${detailUser.stripe}`}
                    >
                        Stripe
                    </a>
                </li>
                : '';
        }

        return (
            <div className="col-sm-4 profile hidden-xs">
                <div className="container-fluid fat">
                    <div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
                        <img
                            className="img-responsive img-avatar"
                            src={avatar}
                            role="presentation"
                        />

                        <div className="meta">
                            <div className="meta-list">
                                <ul className="md-type-subhead">
                                    {email}

                                    {stripe}

                                    <li>
                                        <span className="mdi mdi-image-multiple icon" />
                                        {`${galleries} galleries`}
                                    </li>
                                    <li>
                                        <span className="mdi mdi-image icon" />
                                        {`${photos} photos`}
                                    </li>
                                    <li>
                                        <span className="mdi mdi-movie icon" />
                                        {`${videos} videos`}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

UserSidebar.propTypes = {
    user: PropTypes.object.isRequired,
    detailUser: PropTypes.object.isRequired,
};

export default UserSidebar;

