import React, { PropTypes } from 'react';
import uniqueId from 'lodash/uniqueId';
import '../../../sass/platform/video.scss';
require('script!video.js/dist/video.min.js');
require('script!videojs-contrib-hls/dist/videojs-contrib-hls.min.js');

/**
 * Stateless video that sets up an HTML video, Video.JS HLS player, or VR Player depending on props
 */
class FrescoVideo extends React.Component {
    static propTypes = {
        video: PropTypes.string,
        thumbnail: PropTypes.string,
        width: PropTypes.string,
        type: PropTypes.string,
        autoplay: PropTypes.bool,
        vr: PropTypes.bool,
        muted: PropTypes.bool,
        hideControls: PropTypes.bool,
        highRes: PropTypes.bool,
    };

    static defaultProps = {
        autoplay: false,
        muted: false,
        video: '',
        vr: false,
        highRes: false,
    }

    state = {
        id: uniqueId(), //Need a unique ID because of video.js
        isStream: this.props.video.indexOf('m3u8') > -1,
    }

    componentDidMount() {
        if (this.state.isStream) {
            this.setUpPlayer();
        } else if(this.props.vr) {
            this.setUpVRPlayer();
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

    onClickVideo = () => {
        if (this.props.hideControls) {
            this.togglePlayer();
        }
    }

    setUpVRPlayer = () => {
        const { autoplay, muted } = this.props;

        //Isolate Valiant dependencies to its own file to not have to load it on non-VR pages
        require.ensure(['three', 'script!customDependencies/valiant/jquery.valiant360.min.js'], (require) => {
            global.THREE = require('three');
            require('script!customDependencies/valiant/jquery.valiant360.min.js');

            $('#fresco-video-element').Valiant360({
                hideControls: false,    // hide player controls
                keyboardControls: true, // use keyboard controls (move by arrows),
                clickAndDrag: true,
                autoplay,
                muted
            });
        }, 'valiant');
    }

    setUpPlayer = () => {
        const { highRes, muted } = this.props;

        const options = { muted };
      
        const videoJSPlayer = videojs(this.state.id, options);

        this.setState({ videoJSPlayer });

        if (highRes) {
            videoJSPlayer.on('loadedmetadata', () => {
                videoJSPlayer.tech_.hls.representations().forEach((rep, i) => {
                    if (i <= 1) rep.enabled(true);
                    else rep.enabled(false);
                });
            });
        }

        if (this.props.autoplay) videoJSPlayer.play();
    }

    play = () => {
        this.state.videoJSPlayer.play();
    }

    pause = () => {
        this.state.videoJSPlayer.pause();
    }

    togglePlayer = () => {
        const { videoJSPlayer } = this.state;
        if (videoJSPlayer.paused()) videoJSPlayer.play();
        else videoJSPlayer.pause();
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
        const {
            video,
            type,
            width,
            height,
            thumbnail,
            autoplay,
            vr,
            hideControls,
        } = this.props;
        const { id, isStream } = this.state;

        // Video.JS if an m3u8 file
        let className = `${isStream ? 'video-js' : ''} ${!hideControls ? 'vjs-default-skin' : ''}`;
        className += !width ? ' full-width' : '';

        return (
            (vr ? (
                <div className="fresco-vr-wrap" style={{width, height}}>
                    <div
                        className="fresco-vr"
                        data-video-src={this.props.video} 
                        id="fresco-video-element">
                    </div>
                </div>
            ) : ( 
                <div className="fresco-video-wrap">
                    <video
                        id={id}
                        className={className}
                        autoPlay={autoplay}
                        controls={!hideControls}
                        onClick={this.onClickVideo}
                        width={width}
                        height={height}
                    >
                        <source
                            src={video}
                            poster={thumbnail}
                            type={type || this.getType(video)}
                        />
                    </video>
                </div>
            ))
        );
    }
}

export default FrescoVideo;

