import React from 'react';
import BulkEdit from './bulk-edit';
import utils from 'utils';

/**
 * Gallery Bulk Select Parent Object
 * Component for bulk selecting posts
 */
class BulkSelect extends React.Component {

	constructor(props) {
		super(props);
		this.clear = this.clear.bind(this);
		this.edit = this.edit.bind(this);
		this.createGallery = this.createGallery.bind(this);
	}

	createGallery() {
 		$(".toggle-gcreate").toggleClass("toggled");
 	}

	edit() {
		if (this.props.posts.length > 1) {
			this.refs.bulkedit.show();
		}
		else {
			$.snackbar({
				content: 'Select more than one gallery to edit'
			});
		}
	}

 	clear() {
 		this.props.setSelectedPosts([]);
 	}

	render() {

		var postCount = this.props.posts.length,
			toggled = postCount > 1 ? 'toggled' : '',
			count = postCount + ' post' + (utils.isPlural(postCount) ? 's' : ''),
			thumbnails = this.props.posts.map((post, i) => {
				return <a className="thumb" key={i}>
	 						<img className="img-responsive" src={utils.formatImg(post.image, 'small')} />
	 					</a>
			});

 		return (
 			<div className={'well hover bulk ' + toggled} id="bulk-edit">
 				<div id="bulk-thumbs" className="thumbs">{thumbnails}</div>

 				<div className="row md-type-button">
 					<button onClick={this.clear} type="button" className="btn btn-flat">Clear selection
 						<span id="post-count"> ({count}) </span>
 					</button>

 					{/*<button onClick={this.purchase} type="button" className="btn btn-flat pull-right">Purchase</button>*/}

 					<button onClick={this.edit} type="button" className="btn btn-flat pull-right toggle-edit toggler">Edit</button>

 					<button onClick={this.createGallery} type="button" className="btn btn-flat pull-right toggle-gcreate toggler">Create gallery</button>
 				</div>

				<BulkEdit
					ref='bulkedit'
					posts={this.props.posts} />
 			</div>
 		);
 	}
}

BulkSelect.defaultProps = {
	posts: [],
};

export default BulkSelect;
