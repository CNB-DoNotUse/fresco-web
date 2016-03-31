import React from 'react'
import global from '../../../lib/global'
import RelatedPostImage from './post-related-image'
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
				return <RelatedPostImage post={post} />
			})

			return (
				<div className="row related hidden-xs">
					<div className="tab-control">
						<button className="btn btn-flat toggled">More from this gallery</button>
					</div>
					<div className="tabs">
						<div className="tab toggled">
							<div className="tab-inner">
								<a className="btn btn-flat" href={"/gallery/" + this.props.gallery._id}>See all</a>
								{posts}
							</div>
						</div>
					</div>
				</div>
			);

		}
		else
			return null;

	}

}
