import React from 'react'

/** //

Description : Related posts at the bottom of the PostDetail view

// **/

/**
 * PostRelated parent object
 * @description Contains set of all other posts in the parent gallery
 */

export default class PostRelated extends React.Component {

	render() {

		if (this.props.gallery.posts && this.props.gallery.posts.length > 1){

			var posts = this.props.gallery.posts.map((post, i) => {

				return <img 
							className="img-link" 
							src={formatImg(post.image, 'small')} 
							key={i} />

			})

			return (
				<div className="row related hidden-xs">
					<div className="tab-control">
						<button className="btn btn-flat toggled">More from this gallery</button>
					</div>
					<div className="tabs">
						<div className="tab toggled">{posts}</div>
					</div>
				</div>
			);

		}
		else
			return null;

	}

}