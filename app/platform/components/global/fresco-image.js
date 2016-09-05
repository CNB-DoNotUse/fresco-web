import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Stateless image that manages an image error handler
 * @description Will set a timeout to keep loading the image if it 404s
 */
class FrescoImage extends React.Component {
    missingImageUrl = `${utils.CDN}/images/missing.png`;

    state = {
        image: utils.formatImg(this.props.src, this.props.size),
        timeout: 0
    }

    static propTypes = {
        size: PropTypes.string,
        src: PropTypes.string,
        updateImage: PropTypes.func,
        className: PropTypes.string,
        style: PropTypes.object,
        refreshInterval: PropTypes.bool,
    };

    static defaultProps = {
        size: 'small',
        refreshInterval: false,
        style: {},
        updateImage: () => {}
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.src !== this.props.src) {
            this.setState({
                image: utils.formatImg(nextProps.src, nextProps.size),
                timeout: 0
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // Timeout has changed, attempt setting image back
        if (this.state.timeout > prevState.timeout
            || prevState.image !== this.state.image) {
            this.updateImage(this.state.image);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    /**
     * On the timeout event, update the state timeout in a fibonacci sequence
     * On the `componentDidUpdate` call, the regular image will be set back
     */
    onTimeout = (timeout) => {
        this.setState({
            timeout: (timeout || 1) + this.state.timeout,
        });
    }

    // Updates image and sends image up to prop
    updateImage = (src) => {
        this.image.src = src;
        this.props.updateImage(src);
    }

    /**
     * If the image fails to load, set a missing image and re-attempt to load the image
     * after the timeout
     */
    onError = () => {
        this.updateImage(this.missingImageUrl);

        if (this.props.refreshInterval) {
            this.timeoutId = setTimeout(() => {
                this.onTimeout(this.state.timeout);
            }, this.state.timeout * 1000);
        }
    }

    render() {
        return (
            <img
                className={this.props.className || 'img-cover'}
                style={this.props.style}
                role="presentation"
                ref={r => { this.image = r; }}
                onError={this.onError}
                src={this.state.image}
            />
        );
    }
}

export default FrescoImage;
