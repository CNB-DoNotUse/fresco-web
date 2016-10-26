import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Fresco mage that manages an image error handler
 * @description Will set a timeout to keep loading the image if it 404s
 * @param {Prop} loadWithPlaceholder If you'd like the image to load with a placeholder first then pass this. Applicable in cases where you need
 * a set height and you don't want your image objecto collapse if the 404s
 */
class FrescoImage extends React.Component {
    static propTypes = {
        size: PropTypes.string,
        src: PropTypes.string,
        updateImage: PropTypes.func,
        className: PropTypes.string,
        style: PropTypes.object,
        placeholderStyle: PropTypes.object,
        refreshInterval: PropTypes.bool,
        loadWithPlaceholder: PropTypes.bool,
        height: PropTypes.string,
    };

    static defaultProps = {
        size: 'small',
        refreshInterval: false,
        style: {},
        loadWithPlaceholder: false,
        placeholderStyle: {},
        updateImage: () => {},
    };

    placeholderUrl = `${utils.CDN}/images/missing.png`;

    missingUrl = `${utils.CDN}/images/missing.png`;

    state = {
        placeholderStyle: this.props.placeholderStyle,
        hidePlaceholder: false,
        timeout: 1000,
    }

    componentWillMount() {
        this.setInitialSource();
    }

    componentWillUpdate(nextProps) {
        const { src, size } = nextProps;

        if ((src !== this.props.src) || (size !== this.props.size)) {
            this.setInitialSource(src);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.loadTimeout);
    }

    setInitialSource = (src = '', size = '') => {
        const formattedSrc = (src === '')
            ? utils.formatImg(this.props.src, this.props.size)
            : utils.formatImg(src, size);
        this.setState({
            src: this.props.loadWithPlaceholder ? this.placeholderUrl : formattedSrc,
            formattedSrc,
            hidePlaceholder: false,
        });
    }

    /**
     * When our hidden image loads successfully, hide the `missing` placeholder one
     */
    onLoad = () => {
        if (this.props.loadWithPlaceholder) {
            this.setState({ hidePlaceholder: true });
        }
    }

    /**
     * On the timeout interval, either clear it, or try updating the image again to see if it'll be able to resolve
     */
    onTimeout = () => {
        //If the state is using the correct image
        if (this.state.src === this.state.formattedSrc) {
            clearTimeout(this.loadTimeout);
        } else {
            this.setState({
                src: this.state.formattedSrc,
                timeout: this.state.timeout + this.state.timeout,
            });
        }
    }

    /**
     * On image error, set the image as the placeholder and set a timeout to try again later
     */
    onError = () => {
        this.setState({ src: this.placeholderUrl });

        this.props.updateImage(this.placeholderUrl);

        if (this.props.refreshInterval) {
            this.loadTimeout = setTimeout(this.onTimeout, this.state.timeout);
        }
    }

    render() {
        let placeholderStyle = {};

        if (!this.state.hidePlaceholder) {
            placeholderStyle = Object.assign({
                backgroundImage: this.state.hidePlaceholder ? '' : `url(${this.placeholderUrl})`,
            }, this.props.placeholderStyle);
        }

        if (this.props.loadWithPlaceholder) {
            return (
                <div className="img-cover-bg" style={placeholderStyle}>
                    <img
                        className={this.props.className || 'img-cover'}
                        style={{
                            display: this.state.hidePlaceholder ? 'block' : 'none',
                            ...this.props.style,
                        }}
                        role="presentation"
                        onLoad={this.onLoad}
                        onError={this.onError}
                        src={this.state.formattedSrc}
                    />
                </div>
            );
        }

        return (
            <img
                className={this.props.className || 'img-cover'}
                style={this.props.style}
                role="presentation"
                onError={this.onError}
                src={this.state.src}
            />
        );
    }
}

export default FrescoImage;

