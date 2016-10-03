import React, { PropTypes } from 'react';
import utils from 'utils'

/**
 * Stateless user item component used in meta lists and user profiles
 */
const UserItem = ({ user }) => (
    <div className="meta-user">
        <div className="meta-user-icon">
            {user.avatar ? 
                <img src={user.avatar} />
            :
                <i className="mdi mdi-account" />
            }
        </div>
        <div className="meta-user-text">
            {UserName(user)}
            {UserMeta(user)}
        </div>
    </div>
);

const UserName = ({ id, username, full_name }) => (
    <div className="meta-user-name">
        {full_name ? 
            <a href={`/user/${id}`}>
                <span className="full_name">{`${full_name}`}</span>
            </a>
        : ''}

        {username && full_name ? 
            <span className="username">{`@${username}`}</span>
        :
            <a href={`/user/${id}`} className="username">{`@${username}`}</a>
        }
    </div>
);

const UserMeta = ({ photo_count, video_count, location }) => {
    if (!photo_count && !video_count) {
        return (
            <div className="meta-user-stats">New user!</div>
        );
    }

    return (
        <div className="meta-user-stats">
            {location ?
                <span className="meta-user-location">
                    <span>{location}</span>
                    <span>&bull;</span>
                </span>
            : null}

            <span className="meta-user-counts">
                {`${photo_count} ${(utils.isPlural(photo_count) ? 'photos' : 'photo')}, ${video_count} ${utils.isPlural(video_count) ? 'videos' : 'video'}`}
            </span>
        </div>
    );
}

UserItem.propTypes = {
    user: PropTypes.object
};

export default UserItem;