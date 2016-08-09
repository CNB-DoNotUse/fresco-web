import React, { PropTypes } from 'react';
import utils from 'utils'

/**
 * Stateless image that manages an image error handler
 * @description Will set a timeout to keep loading the image if it 404s
 */
export default class FrescoImage extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { size } = this.props;
		const { img } = this.refs;

		img.onerror = () => {
		    const timeout = parseInt(img.getAttribute('data-t') || 1);
		    const lastTimeout = parseInt(img.getAttribute('data-lt') || 1);
		    const image = `${utils.CDN}/images/${size}/missing.png`;

		    img.setAttribute('data-lt', timeout);
		    img.setAttribute('data-t', timeout + lastTimeout);
		    img.setAttribute('data-src', img.getAttribute('src'));
		    img.setAttribute('src', image);

		    setTimeout(() => {

		        img.setAttribute('src', img.getAttribute('data-src'));

		    }, timeout * 1000);

		    this.props.updateImage(image);
		}
	}

	render() {
		const { image, size } = this.props;
		const src = utils.formatImg(image, size);

		return (
			<div className="img">
				<img 
					className={this.props.imageClass || 'img-cover'}
					ref='img'
					data-src={src}
					src={src} />
			</div>
		)
	}
}

FrescoImage.propTypes = {
    size: PropTypes.string,
    image: PropTypes.string.isRequired,
    updateImage: PropTypes.func
};

FrescoImage.defaultProps = {
	size: 'small',
	updateImage: ()=>{}
}