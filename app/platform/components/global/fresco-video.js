import React, { PropTypes } from 'react';
import uniqueId from 'lodash/uniqueId';
import '../../../sass/platform/video.scss';

require('script!video.js/dist/video');
require('script!videojs-contrib-hls/dist/videojs-contrib-hls');

/**
 * Stateless video that sets up an HTML video or Video.JS player for m3u8
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

    // componentDidUpdate(prevProps) {
    //     if ((prevProps.video !== this.props.video) && this.state.isStream) {
    //         // this.state.player.src(this.props.video);
    //         this.state.player.pause();
    //         this.state.player.dispose();
    //     }
    // }

    componentWillUnmount() {
        if (this.state.player) {
            this.state.player.pause();
            this.state.player.dispose();
        }
    }

    setUpPlayer = () => {
        const options = {
            muted: this.props.muted,
        };

        if (this.props.width) options.width = this.props.width;

        const player = videojs(this.state.id, options);

        this.setState({ player });

        if (this.props.autoplay) {
            player.play();
        }
    }

    types = {
        m3u8: 'application/x-mpegURL',
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
    }

    render() {
        const { video } = this.props;
        let { type } = this.props;

        if (!type) {
            const parts = video.split('.');
            type = this.types[parts[parts.length - 1]];
        }

        // Video.JS if an m3u8 file
        let className = `${this.state.isStream ? 'video-js vjs-default-skin' : ''}`;

        className += !this.props.width ? ' full-width' : '';

        return (
            <div className="fresco-video-wrap">
                <video
                    id={this.state.id}
                    className={className}
                    autoPlay={this.props.autoplay}
                    controls
                >
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

