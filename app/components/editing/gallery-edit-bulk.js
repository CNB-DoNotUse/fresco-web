import React from 'react'
import global from '../../../lib/global'

/** //

Description : Component for bulk selecting posts 

// **/

/**
 * Gallery Bulk Edit Parent Object
 */

export default class GalleryEditBulk extends React.Component {

	constructor(props) {
		super(props);
		this.clear = this.clear.bind(this);
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
 					
 					{/*<button onClick={this.edit} type="button" className="btn btn-flat pull-right toggle-edit toggler">Edit</button>*/}
 					
 					<button onClick={this.createGallery} type="button" className="btn btn-flat pull-right toggle-gcreate toggler">Create gallery</button>
 				</div>
 			</div>
 		);
 	}

 	createGallery() {

 		$(".toggle-gcreate").toggleClass("toggled");

 	}

 	clear() {

 		this.props.setSelectedPosts([]);

 	}

}

GalleryEditBulk.defaultProps = { 
	posts: []
}