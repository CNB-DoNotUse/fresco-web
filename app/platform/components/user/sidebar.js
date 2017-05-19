
import React, { PropTypes } from 'react';
import utils from 'utils';
import UserItem from 'platform/components/global/user-item';
import TrustedUser from 'app/platform/components/user/trusted-user.js';

/**
 * User Sidebar parent object
 * @description Column on the left of the user page
 */
class Sidebar extends React.Component {


    render() {
        const { detailUser, user } = this.props;
        const avatar = detailUser.avatar || utils.defaultAvatar;
        const admin = user.roles.includes('admin');
        return (
            <div className="col-sm-4 profile hidden-xs">
                <div className="container-fluid fat">
                    <div>
                        <div className="col-sm-10 col-md-8">
                            <img
                                className="img-responsive img-avatar"
                                src={avatar}
                                role="presentation"
                            />

                            <UserItem user={detailUser} />

                            <div className="meta">
                                <div className="meta-list">
                                    <ul className="md-type-subhead">
                                        {detailUser.email && (
                                            <li className="ellipses">
                                                <span className="mdi mdi-email icon" />
                                                <a target="_top" href={`mailto:${detailUser.email}`}>
                                                    {detailUser.email}
                                                </a>
                                            </li>
                                        )}

                                        {detailUser.stripe_account_id && (
                                            <li className="ellipses">
                                                <span className="mdi mdi-bank icon" />
                                                <a
                                                    target="_top"
                                                    href={`https://dashboard.stripe.com/${detailUser.stripe_account_id}`}
                                                >
                                                    Stripe
                                                </a>
                                            </li>
                                        )}

                                        { admin ?
                                            <TrustedUser detailUser={ detailUser }/>
                                            : <div></div> }
                                    </ul>
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
