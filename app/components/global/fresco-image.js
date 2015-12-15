import React from 'react';
import global from '../../../lib/global'



/**
 * Stateless image
 */

export default class FrescoImage extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {

		global.attachOnImageLoadError(this.refs.image, this.props.size);
	      
	}

	render() {
		return (
			<div className="img">
				<img 
					className="img-cover"
					ref='image'
					data-src={global.formatImg(this.props.image, this.props.size)}
					src={global.formatImg(this.props.image, this.props.size)} />
			</div>
		)
	}
}