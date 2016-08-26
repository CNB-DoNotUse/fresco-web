import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Stateless video that sets up a JWPlayer video
 */
class FrescoVideo extends React.Component {
    static propTypes = {
        video: PropTypes.string,
        thumbnail: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object
    };

    componentDidMount() {
        console.log(this.props);

        jwplayer('fresco-video').setup({ 
            width: 640,
            height: 360,
            file: "https://d2pcejopg5lhf7.cloudfront.net/streams/40607bc14481e7475025119f3eb5454d_1472161189400_submission.m3u8"
        });
    }

    render() {
        return (
            <div id="fresco-video" style={{ width: '240px' }} />
        );
    }
}

export default FrescoVideo;