
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import Slider from 'react-slick'
import global from '../../lib/global'
import moment from 'moment'
import isNode from 'detect-node'

/**
 * Embed Gallery Component for third parties
 */

class Embed extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentIndex: 0
        }

        if(global.isMobile(this.props.userAgent)) {
            this.device = 'mobile';
        } else {
            this.device = 'desktop';
        }

        this.fullScreen = this.fullScreen.bind(this);
        this.muteVideo = this.muteVideo.bind(this);
        this.toggleVideo = this.toggleVideo.bind(this);
    }

    componentDidMount() {
        var gallery = this.refs.gallery,
            galleryInfo = this.refs.galleryInfoWrap, 
            hovers = [
                galleryInfo, 
                this.refs['playButton']
            ];

        //Add hover listener to elements in the array
        for (var i = 0; i < hovers.length; i++) {
            hovers[i].addEventListener('mouseenter', () => {
                galleryInfo.style.opacity = '1';
            }, false);

            hovers[i].addEventListener('mouseleave', () => {
                galleryInfo.style.opacity = '0';
            }, false);
        }

        // all content including images has been loaded
        window.onload = () => {
            // post our message to the parent with height
            window.parent.postMessage(this.refs.embed.scrollHeight ,"*");
        };
    }

    /**
     * Makes image/video full screen
     */
    fullScreen(index) {
    }

    /**
     * Mutes video based on index
     */
    muteVideo(index) {
        var video = document.getElementsByTagName('video')[index],
            videos = document.getElementsByTagName('video'),
            muteButton = this.refs.muteButton;

        if(video.muted) {
            muteButton.className = "mdi mdi-volume-high";

            for (var i = 0; i < videos.length; i++) {
                videos[i].muted = false;
            }
        } else {
            muteButton.className = "mdi mdi-volume-off";

            for (var i = 0; i < videos.length; i++) {
                videos[i].muted = true;
            }
        }   
    }

    /**
     * Toggles video based on passed ondex
     */
    toggleVideo(index) {
        var slide = document.getElementsByClassName('slick-slide')[index],
            video = slide.getElementsByTagName('video')[0],
            playButton = this.refs.playButton;

        if(!video) return;

        if(video.paused) {
            video.play();
            playButton.style.opacity = '0'
        } else {
            video.pause();
            playButton.style.opacity = '1'
        }
    }

    render() {
        var gallery = this.props.gallery,   
            device = '';

        //Stop if there are no posts
        if(gallery.posts.length == 0) return;
        
        //Store sliders for slick
        var posts = [],
            settings = {
                dots: gallery.posts.length > 1 ? true : false,
                arrows: false,
                infinite: false,
                initialSlide: (this.props.start < gallery.posts.length ? this.props.start : 0),
                autoplay: this.props.cycle,
                afterChange: (index) => {
                    var videos = document.getElementsByTagName('video'),
                        slide = document.getElementsByClassName('slick-slide')[index];

                    if(!slide) return;
                    
                    var video = slide.getElementsByTagName('video')[0];

                    //First pause all videos
                    for (var i = 0; i < videos.length; i++) {
                        videos[i].pause();
                    };

                    if(video){ //If there is a video
                        video.paused ? video.play() : video.pause();
                        this.refs.muteButton.style.opacity = '1';
                    } else { //If there isn't a video
                        //Hide the mute button for non-videos
                        this.refs.muteButton.style.opacity = '0';
                    }

                    //Hide the play button
                    this.refs.playButton.style.opacity = '0';
                    //Update state with the current index
                    this.setState({
                        currentIndex: index
                    });
                }
            };
            
        //Loop through and create all post elements
        for (var i = 0; i < gallery.posts.length; i++) {
            var post = gallery.posts[i],
                avatar = post.owner ? post.owner.avatar ? post.owner.avatar : global.defaultAvatar : global.defaultAvatar,
                address = post.location ? post.location.address != null ? post.location.address : 'No location' : 'No location',
                timestampText = moment(post.time_created).format('MMM Do YYYY, h:mm:ss a'),
                image = global.formatImg(post.image, 'medium'),
                style = {
                    backgroundImage: 'url(' + image + ')'
                },
                video = '';

            //Create video element if the post has a video
            if(post.video){
                var source = post.video,
                    userAgent = this.props.userAgent;

                var isSafari = (userAgent.indexOf('Safari') != -1 && userAgent.indexOf('Chrome') == -1);

                //Check if not iPhone or iPad
                if ((!userAgent.match(/iPad/i) && !userAgent.match(/iPhone/i)) && !isSafari) {
                    //Set mp4 source instead, otherwise it'll be m3u8 for iOS devices
                    source = global.formatVideo(post.video);
                }

                video =  <video 
                            onClick={this.toggleVideo.bind(this, i)} 
                            muted={true} 
                            loop={true}
                            className="post-video" >
                                <source src={source} type="video/mp4" />
                                Your browser does not support the video tag.
                        </video>

                //Reset style because we don't need the background image anymore
                style = ''; 
            }

            posts.push(
                <div className="slick-slide" key={i} style={style}>
                    {video}
                    <table className="slick-meta">
                        <tbody>
                            <tr className="user">
                                <td>
                                    <img src={avatar} />
                                </td>

                                <td className="meta-text byline">{gallery.posts[i].byline}</td>
                            </tr>
                            <tr>
                                <td><span className="mdi mdi-map-marker"></span></td>

                                <td className="meta-text meta-location">{address}</td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="mdi mdi-clock"></span>
                                </td>

                                <td className="meta-text">{timestampText}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }

        var initialVolumeStyle = {
            opacity: 1
        };

        //Hide the volume button if the first post isn't a video
        if(gallery.posts[0].video == null) {
            initialVolumeStyle.opacity = 0;
        }

        //In an array so we can reverse order depending on user agent - `this.device`
        var internal = [
            <div 
                className="gallery-info-wrap" 
                ref="galleryInfoWrap"
                onClick={this.toggleVideo.bind(this, this.state.currentIndex)}
                key={0} >
                <div className="gallery-info">
                    <p>{gallery.caption}</p>

                    <a target="_blank" href={'https://fresconews.com/gallery/' + gallery._id}>SEE MORE ON FRESCO</a>
                </div>
            </div>,

            <Slider 
                {...settings} 
                className="gallery-slick" 
                ref="slider"
                key={1}
            >
                {posts ? posts : <div></div>}
            </Slider>
        ];

        //Render embed
        return (
            <div className={'embed ' + this.device} ref="embed">
                <span className="icon-fresco"></span>

                <div className="controls">
                    <span 
                        className="mdi mdi-volume-off"
                        ref="muteButton"
                        style={initialVolumeStyle}
                        onClick={this.muteVideo.bind(this, this.state.currentIndex)} >
                    </span>

                    {/*<span className="mdi mdi-fullscreen"></span>*/}
                </div>
                
                <span 
                    onClick={this.toggleVideo.bind(this, this.state.currentIndex)} 
                    ref="playButton"
                    className="mdi mdi-play playButton" >
                </span> 

                <div className="gallery" ref="gallery">
                    {this.device == 'desktop' ? internal : [internal[1], internal[0]]}
                </div>
            </div>
        );
    }
}

/**
 * Start = Post to start the slide at
 * Cycle = BOOL to enable/disable automatic clycling
 */
Embed.defaultProps = {
    start: 0,
    cycle: false
}

if(isNode){
    module.exports = Embed;
} else{
    ReactDOM.render(
        <Embed 
            gallery={window.__initialProps__.gallery}
            start={window.__initialProps__.start}
            cycle={window.__initialProps__.cycle}
            userAgent={window.__initialProps__.userAgent} />,
        document.getElementById('app')
    );
}