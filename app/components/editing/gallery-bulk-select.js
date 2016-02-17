import React from 'react'
import BulkEdit from './bulk-edit'
import global from '../../../lib/global'

/** //

Description : Component for bulk selecting posts

// **/

/**
 * Gallery Bulk Edit Parent Object
 */

export default class GalleryBulkSelect extends React.Component {

	constructor(props) {
		super(props);
		this.clear = this.clear.bind(this);
		this.edit = this.edit.bind(this);
		this.createGallery = this.createGallery.bind(this);
	}

	render() {

		var postCount = this.props.posts.length,
			toggled = postCount > 0 ? 'toggled' : '',
			count = postCount + ' post' + (global.isPlural(postCount) ? 's' : ''),
			thumbnails = this.props.posts.map((post, i) => {
				return <a className="thumb" key={i}>
	 						<img className="img-responsive" src={global.formatImg(post.image, 'small')} />
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

 	createGallery() {

 		$(".toggle-gcreate").toggleClass("toggled");

 	}

	edit() {
		this.refs.bulkedit.show();

	}

 	clear() {

 		this.props.setSelectedPosts([]);

 	}

}

GalleryBulkSelect.defaultProps = {
	posts: []
}
