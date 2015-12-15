import React from 'react';
import global from '../../../lib/global'

/**
 * Stateless image that manages an image error handler
 */

export default class FrescoImage extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {

		var size = this.props.size,
			img = this.refs.image;

		img.onerror = function(){
		    
		    var timeout = parseInt(img.getAttribute('data-t') || 1),
		        lastTimeout = parseInt(img.getAttribute('data-lt') || 1);

		    img.setAttribute('data-lt', timeout);
		    img.setAttribute('data-t', timeout + lastTimeout);
		    img.setAttribute('data-src', img.getAttribute('src'));
		    img.setAttribute('src',  'https://d2j1l98c0ybckw.cloudfront.net/images/'+ size +'/missing.png');

		    setTimeout(function(){

		        img.setAttribute('src', img.getAttribute('data-src'));

		    }, timeout * 1000);

		};
	      
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

FrescoImage.defaultProps = {
	size: 'small'
}