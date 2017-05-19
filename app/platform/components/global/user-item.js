import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Stateless user item component used in meta lists and user profiles
 */
const UserName = ({ id, username = "", full_name ="" }) => (
    <div className="meta-user-name">
        {!!full_name &&
            <a href={`/user/${id}`}>
                <span className="meta-user-name__primary">{`${full_name}`}</span>
            </a>
        }

        {!!(username && full_name) &&
            <a href={`/user/${id}`} className="meta-user-name__secondary">{`@${username}`}</a>
        }

        {!!(!full_name && username) &&
            <a href={`/user/${id}`} className="meta-user-name__primary">{`@${username}`}</a>
        }
    </div>
);

const UserMediaMeta = ({ photo_count, video_count, location }) => {
    if (!photo_count && !video_count) {
        return null;
    } else if (photo_count === 0 && video_count === 0){
        return <div className="meta-user-stats">New user!</div>;
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

const UserFlagsMeta = ({ offense_count = 0, report_count = 0}) => {
    const offenses = offense_count > 0
        ? `${offense_count} offenses`
        : 'No offenses';
    const reports = report_count > 0
        ? `${report_count} reports`
        : 'No reports';

    return (
        <div className="meta-user-stats">
            <span className="meta-user-counts">
                {offenses}
                <span> &bull; </span>
                {reports}
            </span>
        </div>
    );
};

// this is the component used to display user info
// TODO: add singular and plural displays
const UserItem = ({ user, metaType = 'media', storyInfo = ''}) => {
    let caption;
    let videos;
    let images;
    if (storyInfo) {
        caption = storyInfo.caption;
        videos = storyInfo.videos;
        images = storyInfo.images;
    }
    let handle;
    switch (metaType) {
        case 'story':
            handle = <UserActive active={true} user={ user }/>;
            break;
        default:
            handle = <UserName {...user} />;
    }
    const trusted = user.trusted || ((!user.trusted && (typeof(user.trusted) === "object")) && user.rating >= .85)
    return (
        <div className="meta-user">
            <div className="meta-user-icon">
                {user.avatar
                    ? <img src={user.avatar} />
                    : <i className="mdi mdi-account" />
                }
                { trusted
                    ? <i className="mdi mdi-check-circle"></i>
                    : <div></div>}
            </div>
            <div className="meta-user-text">
                { handle }
                { metaType === 'media' && <UserMediaMeta {...user} /> }
                { metaType === 'flags' && <UserFlagsMeta {...user} /> }
                { storyInfo ?
                    <section>
                        <p>{caption}</p>
                        <p>{videos} videos • {images} photos</p>
                    </section> :
                    <div></div>
                }
            </div>
        </div>
    );
}

const UserActive = ({ user, active }) => (
    <div className="meta-user-name">
        <a href={`/user/${user.id}`}>
            <span className="meta-user-name__primary">{`${user.full_name}`}</span>
        </a>
        <section>
            <div className={ active ? "green circle" : " gray circle"}></div>
            <p>
                {active ? "Active" : "Inactive"}
            </p>
        </section>
    </div>
);


UserItem.propTypes = {
    user: PropTypes.object,
    metaType: PropTypes.string,
};

export default UserItem;
