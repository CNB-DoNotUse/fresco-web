import React, { PropTypes } from 'react';
import uniqueId from 'lodash/uniqueId';
import '../../../sass/platform/video.scss';

require('script!video.js/dist/video');
require('script!videojs-contrib-hls/dist/videojs-contrib-hls');

/**
 * Stateless video that sets up an HTML video or Video.JS videoJSPlayer for m3u8
 */
class FrescoVideo extends React.Component {
    static propTypes = {
        video: PropTypes.string,
        thumbnail: PropTypes.string,
        className: PropTypes.string,
        width: PropTypes.string,
        type: PropTypes.string,
        style: PropTypes.object,
        autoplay: PropTypes.bool,
        muted: PropTypes.bool,
        hideControls: PropTypes.bool,
    };

    static defaultProps = {
        autoplay: false,
        muted: false,
        video: '',
    }

    state = {
        id: uniqueId(),
        isStream: this.props.video.indexOf('m3u8') > -1,
    }

    componentDidMount() {
        if (this.state.isStream) {
            this.setUpPlayer();
        }
    }

    componentDidUpdate(prevProps) {
        const { video } = this.props;
        const { videoJSPlayer } = this.state;

        if ((prevProps.video !== video) && videoJSPlayer) {
            videoJSPlayer.src({
                src: video,
                type: this.getType(video),
            });
        }
    }

    componentWillUnmount() {
        if (this.state.videoJSPlayer) {
            this.state.videoJSPlayer.pause();
            this.state.videoJSPlayer.dispose();
        }
    }

    toggleVideo = () => {
        const { videoJSPlayer } = this.state;
        if (videoJSPlayer.paused()) 
            videoJSPlayer.play();
        else 
            videoJSPlayer.pause();
    }

    pause = () => {
        this.state.videoJSPlayer.pause();
    }

    play = () => {
        this.state.videoJSPlayer.play();   
    }

    setUpPlayer = () => {
        const options = {
            muted: this.props.muted,
        };

        if (this.props.width) options.width = this.props.width;

        const videoJSPlayer = videojs(this.state.id, options);

        this.setState({ videoJSPlayer });

        if (this.props.autoplay) {
            videoJSPlayer.play();
        }
    }

    getType(video) {
        const parts = video.split('.');
        return this.types[parts[parts.length - 1]];
    }

    types = {
        m3u8: 'application/x-mpegURL',
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
    }

    render() {
        const { video, type, width, thumbnail, autoplay, hideControls } = this.props;
        const { id, isStream } = this.state;

        // Video.JS if an m3u8 file
        let className = `${isStream ? 'video-js' : ''} ${!hideControls ? 'vjs-default-skin' : ''}`;
        className += !width ? ' full-width' : '';

        return (
            <div className="fresco-video-wrap">
                <video
                    id={id}
                    className={className}
                    autoPlay={autoplay}
                    controls={!hideControls}
                    onClick={this.toggleVideo}
                >
                    <source
                        src={video}
                        poster={thumbnail}
                        type={type || this.getType(video)}
                    />
                </video>
            </div>
        );
    }
}

export default FrescoVideo;

