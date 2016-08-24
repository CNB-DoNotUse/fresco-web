import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Stateless image that manages an image error handler
 * @description Will set a timeout to keep loading the image if it 404s
 */
class FrescoImage extends React.Component {
    static propTypes = {
        size: PropTypes.string,
        image: PropTypes.string,
        updateImage: PropTypes.func,
        imageClass: PropTypes.string,
        refreshInterval: PropTypes.bool,
        imageStyle: PropTypes.object,
    };

    static defaultProps = {
        size: 'small',
        refreshInterval: false,
        updateImage: () => {},
    };

    componentDidMount() {
        this.loadImage();
    }

    componentDidUpdate(prevProps) {
        if (this.props.image !== prevProps.image) {
            this.loadImage();
        }
    }

    missingImageUrl = `${utils.CDN}/images/missing.png`;

    // async load image
    loadImage = () => {
        const { image, size, refreshInterval } = this.props;
        const formattedSrc = utils.formatImg(image, size);
        const imageObj = new Image();
        const intervalCB = () => {
            if (this.img && this.img.src === this.missingImageUrl) {
                imageObj.src = formattedSrc;
            } else {
                clearInterval(this.loadInterval);
            }
        };
        const onloadCB = () => {
            if (this.img) this.img.src = formattedSrc;
        };
        const onerrorCB = () => {
            if (this.img) this.img.src = this.missingImageUrl;
            this.props.updateImage(this.missingImageUrl);

            if (refreshInterval) {
                this.loadInterval = setInterval(intervalCB.bind(this), 2000);
            }
        };

        imageObj.onload = onloadCB.bind(this);
        imageObj.onerror = onerrorCB.bind(this);

        imageObj.src = formattedSrc;
    }

    render() {
        return (
            <div className="img img__async">
                <img
                    className={this.props.imageClass || 'img-cover'}
                    style={this.props.imageStyle || {}}
                    role="presentation"
                    ref={(r) => this.img = r}
                    src={this.missingImageUrl}
                />
            </div>
        );
    }
}

export default FrescoImage;

