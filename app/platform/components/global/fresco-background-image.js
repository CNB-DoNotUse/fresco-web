import React, { PropTypes } from 'react';
import FrescoImage from './fresco-image';
import utils from 'utils';

/**
 * Stateless image that manages an image error handler
 */
class FrescoBackgroundImage extends React.Component {
    static propTypes = {
        size: PropTypes.string,
        image: PropTypes.string,
    };

    static defaultProps = {
        size: 'small',
        image: '',
    };

    state = {
        image: utils.formatImg(this.props.image, this.props.size),
    };

    updateImage = (image) => {
        this.setState({ image });
    }

    render() {
        return (
            <div
                className="frs-background-image"
                style={{ backgroundImage: `url(${this.state.image})` }}
            >
                <div className="img">
                    <FrescoImage
                        src={this.props.image}
                        size={this.props.size}
                        updateImage={this.updateImage}
                    />
                </div>
            </div>
        );
    }
}

export default FrescoBackgroundImage;

