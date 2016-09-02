import React, { PropTypes } from 'react';
import utils from 'utils';
require('script!video.js/dist/video.js')
require('script!videojs-contrib-hls/dist/videojs-contrib-hls.js')
import '../../../sass/platform/video.scss';

/**
 * Stateless video that sets up an HTML video or Video.JS player for m3u8
 */
class FrescoVideo extends React.Component {
    static propTypes = {
        video: PropTypes.string,
        thumbnail: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        autoplay: PropTypes.bool
    };

    static defaultProps = {
        autoplay: false,
        muted: false
    }

    types = {
        'm3u8' : 'application/x-mpegURL',
        'mp4' : 'video/mp4',
        'webm' : 'video/webm',
        'ogg' : 'video/ogg'
    }

    componentDidMount() {
        const player = videojs('fresco-video', {
            width: 640,
            muted: this.props.muted
        });

        this.setState({ player });

        if(this.props.autoplay) {
            player.play();
        }   
    }

    componentWillUnmount() {
        if (this.state.player) {
            this.state.player.pause();
        }
    }

    render() {
        const { video, thumbnail } = this.props;
        let { type } = this.props;

        if(!type) {
            const parts = video.split('.');
            type = this.types[parts[parts.length - 1]];
        }

        //Video.JS if an m3u8 file
        const className = `${type.indexOf(this.types['m3u8']) > -1 ? 'video-js vjs-default-skin' : ''}`;

        return (
            <div className="fresco-video-wrap">
                <video 
                    id='fresco-video' 
                    className={className}
                    autoPlay={this.props.autoplay}
                    controls={true}>
                    <source
                        src={this.props.video}
                        poster={this.props.thumbnail}
                        type={type} 
                    />
                </video>
            </div>
        );
    }
}

export default FrescoVideo;