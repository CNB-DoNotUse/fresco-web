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
	//Add source after rendering for local files
	componentDidMount: function(){

		if(!this.props.file) return;

	
	},

	render: function(){

		//Check if we're reading from a file, and we have the file's source
		if(this.props.file && this.props.source){

			if (this.props.file.type.indexOf('video') !== -1) { //video

				return (
					<video width="100%" height="100%" data-id={this.props.post._id} controls>
						<source 
							id={this.props.file.lastModified}
							src={this.props.source}
							type='video/mp4' ref='video' />
						Your browser does not support the video tag.
					</video>
				)
			
			}
			else { //image

				return (
					<img 
						className='img-responsive'
						id={this.props.file.lastModified}
						src={this.props.source}
						ref="image" />
				)
			}	
		}
		else if(this.props.post.video){

			return (
				<video width="100%" height="100%" data-id={this.props.post._id} controls>
					<source 
						src={this.props.post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')}
						type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			)

		}
		else{

			console.log(this.props);
			
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