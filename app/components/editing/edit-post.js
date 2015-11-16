var React = require('react'),
	ReactDOM = require('react-dom');

/**
 * Single Edit-Post Element
 * @description Post element that is wrapped inside container slick usually
 */

var EditPost = React.createClass({

	displayName: 'EditPost',

	getDefaultProps: function(){

		return{
			post: {}
		}

	},

	render: function(){

		if(!this.props.post) return;

		if(this.props.post.video){

			return (
				<video width="100%" height="100%" data-id={this.props.post._id} controls>
					<source 
						src={this.props.post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')}
						type="video/mp4" />
					Your browser does not support the video tag.\
				</video>
			)

		}
		else{

			return (
				<img 
					className='img-responsive'
					src={formatImg(this.props.post.image, 'medium')}
					data-id={this.props.post._id} />
			)

		}
	}

});

module.exports = EditPost;