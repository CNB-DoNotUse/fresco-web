import React from 'react';
import FrescoImage from './fresco-image';
import utils from 'utils'

/**
 * Stateless image that manages an image error handler
 */

export default class FrescoBackgroundImage extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			image: utils.formatImg(this.props.image, this.props.size)
		}

		this.updateImage = this.updateImage.bind(this);
	}

	updateImage(image) {
		this.setState({ image });
	}

	render() {
		return (
			<div
				className="frs-background-image"
				style={{
					backgroundImage: 'url(' + this.state.image + ')'
				}}>

				<FrescoImage
					image={this.props.image}
					size={this.props.size}
					updateImage={this.updateImage} />
			</div>
		)
	}
}

FrescoBackgroundImage.defaultProps = {
	size: 'small',
	image: ''
}
