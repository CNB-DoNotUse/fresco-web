import React, { PropTypes } from 'react';
import UserItem from '../global/user-item';

const AcceptedUser = ({ user }) => (
    <div className="assignment__accepted-user">
        <UserItem user={user} />
    </div>
);

AcceptedUser.propTypes = {
    user: PropTypes.object.isRequired,
};

export default AcceptedUser;
