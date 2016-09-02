import React from 'react';
import utils from 'utils';
import moment from 'moment';

/**
 * Purchase list item inside an outlet column
 */
export default class OutletColumnPurchase extends React.Component {

    constructor(props) {
        super(props);

        this.toggleVideo = this.toggleVideo.bind(this);
        this.toggleVolume = this.toggleVolume.bind(this);
    }

    toggleVideo() {
        var video = this.refs.video,
            allVideos = document.getElementsByTagName('video');

        if(video.paused) {
            for (var i = allVideos.length - 1; i >= 0; i--) {
                if(!allVideos[i].paused)
                    allVideos[i].pause();
            }
            video.play()
        } else {
            video.pause();
        }
    }

    toggleVolume() {
        var video = this.refs.video;

        this.refs.volumeToggle.className = video.muted ? 'mdi mdi-volume-high volume-toggle' : 'mdi mdi-volume-off volume-toggle'
        video.muted = video.muted ? false : true;
    }

    render() {
        var purchase = this.props.purchase,
            post = this.props.purchase.post,
            timestampText = '',
            lastDay = Date.now() - 86400000,
            media = '',
            assignmentMeta = '';

        var name = post.owner ? post.owner.firstname + ' ' + post.owner.lastname : post.byline;
        name = name.replace('via Fresco News', '');

        if(post.video !== null) {
            var source = '';

            if(utils.isSafari(navigator.userAgent))
                source = post.video
            else
                source = utils.formatVideo(post.video);

            media = [
                        <span
                            className="mdi mdi-volume-off volume-toggle"
                            ref="volumeToggle"
                            onClick={this.toggleVolume}
                            key={0}>
                        </span>,
                        <video
                            src={source}
                            autoPlay={false}
                            controls={false}
                            loop={true}
                            muted={true}
                            onClick={this.toggleVideo}
                            ref="video"
                            key={1} >
                        </video>
                    ]
        } else {

            media = <img src={utils.formatImg(post.image, 'small')} />

        }

        if(purchase.timestamp < lastDay) {
            timestampText = moment(purchase.timestamp).format('MMMM Do, YYYY')
        } else {
            timestampText = moment(purchase.timestamp).format('h:mm A') + ' UTC';
        }

        if(purchase.assignment) {
            assignmentMeta = <div className="meta-assignment">
                                <a href={'/assignment/' + purchase.assignment._id}>
                                    <span className="mdi mdi-logout-variant"></span>

                                    <span className="title">{purchase.assignment.title}</span>
                                </a>
                            </div>
        }

        return (
            <li className="purchase">
                <div className="meta-top">
                    <a href={post.owner ? '/user/' + post.owner._id : '#'}>
                        <h3>{name}</h3>
                    </a>

                    <span>{timestampText}</span>
                </div>

                <div className="media-cell">
                    {media}
                </div>

                {assignmentMeta}
            </li>

        )
    }
}
