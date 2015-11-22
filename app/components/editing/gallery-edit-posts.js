import React from 'react'
import EditPost from './edit-post.js'

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

		this.replaceState({	
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

			return <EditPost key={k++} post={post} />

		});

		var files = [];

		for (var i = 0; i < this.state.files.length; i++){
			
			files.push(<EditPost key={k++} file={this.state.files[i]} source={this.state.files.sources[i]} />);

		}

		return (
			<div className="dialog-col col-xs-12 col-md-5">
				<div ref='galleryEditPosts' id="gallery-edit-images">{posts}{files}</div>
			</div>
		);

	}
}
