import React, { PropTypes } from 'react';
import UserItem from '../global/user-item';

/**
 * AcceptedUser
 *
 * @param {Object} {user} User object from api containing user info such as name and email
 * @returns {JSX} Accepted user stateless component
 */
const AcceptedUser = ({ user }) => (
    <div className="assignment__accepted-user">
        <UserItem user={user} />
    </div>
);

AcceptedUser.propTypes = {
    user: PropTypes.object.isRequired,
};

export default AcceptedUser;
