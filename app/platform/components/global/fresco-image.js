import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Stateless image that manages an image error handler
 * @description Will set a timeout to keep loading the image if it 404s
 */
class FrescoImage extends React.Component {
    componentDidMount() {
        const { img } = this.refs;

        img.onerror = () => {
            const timeout = parseInt(img.getAttribute('data-t') || 1, 10);
            const lastTimeout = parseInt(img.getAttribute('data-lt') || 1, 10);
            const image = `${utils.CDN}/images/missing.png`;

            img.setAttribute('data-lt', timeout);
            img.setAttribute('data-t', timeout + lastTimeout);
            img.setAttribute('data-src', img.getAttribute('src'));
            img.setAttribute('src', image);

            setTimeout(() => {
                img.setAttribute('src', img.getAttribute('data-src'));
            }, timeout * 1000);

            this.props.updateImage(image);
        };
    }

    render() {
        const { image, size } = this.props;
        const src = utils.formatImg(image, size);

        return (
            <div className="img">
                <img
                    className={this.props.imageClass || 'img-cover'}
                    role="presentation"
                    ref="img"
                    data-src={src}
                    src={src}
                />
            </div>
        );
    }
}

FrescoImage.propTypes = {
    size: PropTypes.string,
    image: PropTypes.string,
    updateImage: PropTypes.func,
    imageClass: PropTypes.string,
};

FrescoImage.defaultProps = {
    size: 'small',
    updateImage: () => {},
};

export default FrescoImage;

