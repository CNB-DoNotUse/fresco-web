import _ from 'lodash'
import React from 'react'
import EditPost from './edit-post.js'
import Slider from 'react-slick'

/**
 * Component for managing gallery's posts
 */

export default class GalleryEditPosts extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var k = 0;

		var posts = this.props.posts.map((post) => {
			var shouldDelete = this.props.deletePosts.indexOf(post._id) != -1;
			var deleteText = '';
			if(this.props.posts.length > 1) {
				deleteText =
					<a>
						<span
							className={"mdi mdi-close-circle icon" + (shouldDelete ? ' addback' : '')}
							onClick={this.props.toggleDelete.bind(null, post._id)} />
					</a>
			}
			return (
				<div key={++k} className={"frick-frame" + (shouldDelete ? " frick-delete" : "")}>
					<EditPost post={post} />
					<div className="frick-overlay">
						<span>
							<span className="mdi mdi-delete icon" />
							<div className="md-type-caption">This post will be deleted</div>
						</span>
					</div>
					{deleteText}
				</div>
			);

		});

		var files = [];

		for (var i = 0; i < this.props.files.length; i++){
			
			files.push(
				<div key={++k} >
					<EditPost 
						file={this.props.files[i]} 
						source={this.props.files.sources[i]} />
				</div>
			);

		}

		return (
			<div className="dialog-col col-xs-12 col-md-5">
				<Slider
					dots={true}>
					{posts}{files}
				</Slider>
			</div>
		);

	}
}

GalleryEditPosts.defaultProps = {
	deletePosts: [],
	posts: [],
	files: [],
	toggleDelete: function() {}
}
