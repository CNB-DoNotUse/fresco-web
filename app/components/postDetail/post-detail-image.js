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

	constructor(props) {
		super(props);

		this.state = {
			purchased: this.props.purchases && this.props.purchases.indexOf(this.props.post.id) >= 0
		}

		this.contextMenu = this.contextMenu.bind(this);
		this.didPurchase = this.didPurchase.bind(this);
	}

	didPurchase() {
		this.setState({
			purchased: true
		});
	}

	/**
	 * Click event for either the image tag or the video tag
	 */
	contextMenu(e) {
		e.preventDefault();
	}

    render() {
        const { user, post, didPurchase } = this.props;
		let actions = [];
		let postMedia = '';
		let i = 0;

		var assignment = window.location.search.split('assignment=')[1];

		var downloadAction = <DownloadAction post={post} key={i++} />

		var purchaseAction = <PurchaseAction
								post={post}
								assignment={assignment}
								didPurchase={didPurchase}
								key={i++} />

        if(this.props.user.rank < global.RANKS.CONTENT_MANAGER){

			if(user.outlet && this.state.purchased){
                actions.push(downloadAction);
				//Check if the post is licensed
            } else if (user.outlet && post.license == 1){
                actions.push(purchaseAction);
			}
        } else {
            actions.push(downloadAction);

            if (!this.state.purchased){
                actions.push(purchaseAction);
            }
        }

		if (post.video){
			postMedia = <video width="100%" height="100%" controls onContextMenu={this.contextMenu}>
							<source src={global.formatVideo(post.video)} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
		}
		else{
            postMedia = <img
                            className="img-responsive"
                            onContextMenu={this.contextMenu}
                            src={global.formatImg(post.image, 'large')}
                        />
		}


		return (

			<div className="col-xs-12 col-md-8">
				<div className="card panel">
					<div className="card-foot small">
						{actions}

						<span className="md-type-body1">{post.byline}</span>
					</div>

					<div className="card-body">{postMedia}</div>
				</div>
			</div>

		)
	}
}
