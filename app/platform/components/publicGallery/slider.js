import React, { PropTypes } from 'react';
import moment from 'moment';
import Slick from 'react-slick';
import get from 'lodash/get';
import utils from 'utils';
import FrescoVideo from '../global/fresco-video';

class PublicGallerySlider extends React.Component {

    beforeChange = (index) => {
        setTimeout(() => {
            if(this.refs[`video${index}`]) {
                this.refs[`video${index}`].pause();
            }
        }, 1)
    }

    afterChange = (index) => {
        setTimeout(() => {
            if(this.refs[`video${index}`]) {
                this.refs[`video${index}`].play();
            }   
        }, 1);
    }

    render() {
        const { posts = [], userAgent } = this.props;

        if (!posts.length) return <div />;

        const slickContent = posts.map((p, i) => {
            const avatar = get(p, 'owner.avatar', utils.defaultAvatar);
            const address = get(p, 'address', 'No location');
            const timestampText = moment(p.created_at).format('MMM Do YYYY, h:mm:ss a');
            const image = utils.formatImg(p.image, 'medium');
            let style = {
                backgroundImage: `url(${image})`,
            };
            if (p.stream) {
                style = '';
            }

            return (
                <div className="slick-slide" key={i} style={style}>
                    {p.stream ? 
                        <FrescoVideo
                            autoplay={i === 0}
                            video={p.stream}
                            ref={`video${i}`}
                            userAgent={userAgent}
                            hideControls
                        />
                    : null}
                    <table className="slick-meta">
                        <tbody>
                            <tr className="user">
                                <td>
                                    <img src={avatar} role="presentation" />
                                </td>
                                <td className="meta-text byline">{utils.getBylineFromPost(p)}</td>
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
            beforeChange: this.beforeChange,
            afterChange: this.afterChange
        };

        return (
            <Slick {...settings}  className="slick">
                {slickContent}
            </Slick>
        );
    }
}

PublicGallerySlider.propTypes = {
    posts: PropTypes.array,
    userAgent: PropTypes.string,
};

export default PublicGallerySlider;
