import React, { PropTypes } from 'react';
import utils from 'utils'

/**
 * Stateless user item component used in meta lists
 */
export default class UserItem extends React.Component {

    render() {
        const { user } = this.props;

        return (
            <li className="meta-user">
                <div>
                    <a href={"/user/" + user.id}>
                        <img
                            className="img-circle img-responsive"
                            src={user.avatar || utils.defaultSmallAvatar} />
                    </a>
                </div>
                <div>
                    <a href={"/user/" + user.id}>
                        <span className="md-type-title">{user.full_name}</span>
                    </a>
                    
                    <span className="md-type-body1">{user.email}</span>

                    <span className="md-type-body1">{user.username}</span>

                    <span className="md-type-body1">{user.twitter_handle || 'No Twitter'} • {user.outlet ? 
                        <a href={"/outlet/" + user.id}>Outlet</a> : 'No Outlet'}
                    </span>
                </div>
            </li>

        )
    }
}


UserItem.propTypes = {
    user: PropTypes.object
};