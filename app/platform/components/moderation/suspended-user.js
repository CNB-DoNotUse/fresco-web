import React, { PropTypes } from 'react';
import moment from 'moment';
import UserItem from '../global/user-item';

const SuspendedUser = ({ user, onClickRestore }) => (
    <div className="moderation-suspended__user">
        <UserItem user={user} />

        <span className="moderation-suspended__remaining">
            {`${moment(user.suspended_until).diff(moment(), 'days')} days remaining`}
        </span>

        <btn className="btn btn-flat" onClick={onClickRestore}>restore</btn>
    </div>
);

SuspendedUser.propTypes = {
    user: PropTypes.object.isRequired,
    onClickRestore: PropTypes.func.isRequired,
};

export default SuspendedUser;
