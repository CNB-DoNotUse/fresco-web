import React from 'react'
import PurchaseAction from '../actions/purchase-action.js'
import DownloadAction from '../actions/download-action.js'
import global from '../../../lib/global'

/** //

Description : Image of the PostDetail page, contains image/video, byline and actions

// **/

/**
 * Post Detail Image parent object
 */

export default class PostDetailImage extends React.Component {

	render() {

		var actions = [],
			postMedia = '',
			i = 0;

		//Check rank of user, if less than a CM
		if(this.props.user.rank < 1){//config.RANKS_CONTENT_MANAGER

			//Check to make sure the user has an outlet
			if(this.props.user.outlet){

				//Check if the post has been purchased
				if (this.props.purchases && this.props.purchases.indexOf(this.props.post._id) >= 0){
					actions.push(
						<DownloadAction post={this.props.post} key={i++} />
					);
				}
				//Check if the post is licensed 
				else if (this.props.post.license == 1){
					actions.push(
						<PurchaseAction post={this.props.post} didPurchase={this.props.didPurchase} key={i++} />
					);
				}
			}
		}
		//We are of a rank higher than a content manager
		else{
			
			actions.push(
				<DownloadAction post={this.props.post} key={i++} />
			);

			if (this.props.purchases && this.props.purchases.indexOf(this.props.post._id) == -1){

				actions.push(
					<PurchaseAction post={this.props.post} didPurchase={this.props.didPurchase} key={i++} />
				);
			}

		}

		if (this.props.post.video){
			postMedia = <video width="100%" height="100%" controls>
							<source src={global.formatVideo(this.props.post.video)} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
		}
		else{
		
			postMedia = <img className="img-responsive" src={global.formatImg(this.props.post.image, 'large')} />
		}


		return (

			<div className="col-xs-12 col-md-8">
				<div className="card panel">
					<div className="card-foot small">
						{actions}
						<span className="md-type-body1">{this.props.post.byline}</span>
					</div>
					<div className="card-body">{postMedia}</div>
				</div>
			</div>

		)

	}

}
