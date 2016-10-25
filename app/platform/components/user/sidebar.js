import React, { PropTypes } from 'react';
import utils from 'utils';
import UserItem from 'platform/components/global/user-item';

/**
 * User Sidebar parent object
 * @description Column on the left of the user page
 */
class Sidebar extends React.Component {

    render() {
        const { detailUser } = this.props;
        const avatar = detailUser.avatar || utils.defaultAvatar;

        return (
            <div className="col-sm-4 profile hidden-xs">
                <div className="container-fluid fat">
                    <div>
                        <div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
                            <img
                                className="img-responsive img-avatar"
                                src={avatar}
                                role="presentation"
                            />

                            <UserItem user={detailUser} />

                            <div className="meta">
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
            </div>
        );
    }
}

Sidebar.propTypes = {
    user: PropTypes.object.isRequired,
    detailUser: PropTypes.object.isRequired,
};

export default Sidebar;