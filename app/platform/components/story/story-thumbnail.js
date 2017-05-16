import React from 'react';
import FrescoImage from 'app/platform/components/global/fresco-image';

export default const StoryThumbnail = ({ src, location, postTime, key, unread }) => (
    <li key={ key }>
        <FrescoImage src={ src }/>
        <p className="post-location">{ location }</p>
        { unread && <div className="circle blue"></div> }
        <p className="post-time">{ postTime }</p>
    </li>
);
