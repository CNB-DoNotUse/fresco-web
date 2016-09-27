import React, { PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import moment from 'moment';
// import App from './app.js';
import Slick from 'react-slick';
import get from 'lodash/get';
import utils from 'utils';
import FrescoVideo from '../global/fresco-video';

const Slider = ({ posts = [], userAgent }) => {
    if (!posts.length) return <div />;

    const slickContent = posts.map((p, i) => {
        const avatar = get(p, 'owner.avatar', utils.defaultAvatar);
        const address = get(p, 'location.address', 'No location');
        const timestampText = moment(p.created_at).format('MMM Do YYYY, h:mm:ss a');
        const image = utils.formatImg(p.image, 'medium');
        let style = {
            backgroundImage: `url(${image})`,
        };
        let video;

        if (p.stream) {
            style = '';

            if (!userAgent.match(/iPad/i) && !userAgent.match(/iPhone/i)) {
                video = (
                    <FrescoVideo
                        autoplay={i === 0}
                        video={utils.streamToMp4(p.stream)}
                    />
                );
            } else {
                video = <FrescoVideo autoplay={i === 0} video={p.stream} />;
            }
        }

        return (
            <div className="slick-slide" key={i} style={style}>
                {video}
                <table className="slick-meta">
                    <tbody>
                        <tr className="user">
                            <td>
                                <img src={avatar} role="presentation" />
                            </td>
                            <td className="meta-text byline">{p.byline}</td>
                        </tr>
                        <tr>
                            <td><span className="mdi mdi-map-marker" /></td>
                            <td className="meta-text">{address}</td>
                        </tr>
                        <tr>
                            <td><span className="mdi mdi-clock" /></td>
                            <td className="meta-text">{timestampText}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    });

    const settings = {
        dots: posts.length > 1,
        arrows: true,
        infinite: false,
    };

    return (
        <Slick {...settings} className="slick">
            {slickContent}
        </Slick>
    );
};

Slider.propTypes = {
    posts: PropTypes.array,
    userAgent: PropTypes.string,
};

export default Slider;
