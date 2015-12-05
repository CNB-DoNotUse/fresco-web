import React from 'react'
import EditPost from './edit-post.js'
import Slider from 'react-slick'

/**
 * Component for managing gallery's posts
 */

export default class GalleryEditPosts extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			posts: this.props.posts,
			files: []
		}
	}

	componentWillReceiveProps(nextProps) {

		this.setState({	
			posts: nextProps.posts,
			files: nextProps.files ? nextProps.files : []
		});

	}

	componentDidMount() {
		$(this.refs.galleryEditPosts).frick();
	}

	componentDidUpdate() {
		$(this.refs.galleryEditPosts).frick();
	}

	render() {

		var k = 0;

		var posts = this.state.posts.map((post) => {

			return <div key={k++}>
						<EditPost post={post} />
					</div>

		});

		var files = [];

		for (var i = 0; i < this.state.files.length; i++){
			
			files.push(
				<div key={k++} >
					<EditPost 
						file={this.state.files[i]} 
						source={this.state.files.sources[i]} />
				</div>
			);

		}

		//			<div className="dialog-col col-xs-12 col-md-5">

		return (
			<Slider 
				className="dialog-col col-xs-12 col-md-5"
				dots={true}>
				{posts}{files}
			</Slider>
		);

	}
}
