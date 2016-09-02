import React, { PropTypes } from 'react';
import utils from 'utils';
import moment from 'moment';

/**
 * Purchase list item inside an outlet column
 */
export default class OutletColumnPurchase extends React.Component {
    static propTypes = {
        purchase: PropTypes.object,
    }

    toggleVideo = () => {
        const video = this.video;
        const allVideos = document.getElementsByTagName('video');

        if (video.paused) {
            allVideos.forEach(v => {
                if (!v.paused) v.pause();
            });
            video.play();
        } else {
            video.pause();
        }
    }

    toggleVolume = () => {
        const video = this.video;

        this.volumeToggle.className = video.muted
            ? 'mdi mdi-volume-high volume-toggle'
            : 'mdi mdi-volume-off volume-toggle';
        video.muted = !video.muted;
    }

    render() {
        const purchase = this.props.purchase;
        const post = purchase.post;
        const lastDay = Date.now() - 86400000;
        let assignmentMeta = '';
        let media = '';
        let timestampText = '';

        let name = post.owner
            ? post.owner.full_name
            : post.byline;
        name = name.replace('via Fresco News', '');

        if (post.video !== null) {
            let source = '';

            if (utils.isSafari(navigator.userAgent)) source = post.video;
            else source = utils.formatVideo(post.video);

            media = [
                <span
                    ref={r => this.volumeToggle = r}
                    className="mdi mdi-volume-off volume-toggle"
                    onClick={this.toggleVolume}
                    key={0}
                />,
                <video
                    ref={r => this.video = r}
                    src={source}
                    autoPlay={false}
                    controls={false}
                    onClick={this.toggleVideo}
                    key={1}
                    loop
                    muted
                />,
            ];
        } else {
            media = <img src={utils.formatImg(post.image, 'small')} />;
        }

        if (purchase.timestamp < lastDay) {
            timestampText = moment(purchase.timestamp).format('MMMM Do, YYYY')
        } else {
            timestampText = moment(purchase.timestamp).format('h:mm A') + ' UTC';
        }

        if (purchase.assignment) {
            assignmentMeta = (
                <div className="meta-assignment">
                    <a href={'/assignment/' + purchase.assignment._id}>
                        <span className="mdi mdi-logout-variant" />

                        <span className="title">{purchase.assignment.title}</span>
                    </a>
                </div>
            );
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
        );
    }
}

