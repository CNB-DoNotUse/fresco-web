var React = require('react');
	ReactDOM = require('react-dom'),
	PurchaseAction = require('./actions/purchase-action'),
	DownloadAction = require('./actions/download-action');

/** //

Description : Image of the PostDetail page, contains byline and actions

// **/

/**
 * PostDetailImage parent object
 */

var PostDetailImage = React.createClass({

	displayName: 'PostDetailImage',

	render: function() {

		console.log(this.props);

		var actions = [],
			postMedia = ''
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
						<PurchaseAction post={this.props.post} key={i++} />
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
					<PurchaseAction post={this.props.post} key={i++} />
				);
			}

		}

		if (this.props.post.video){
			postMedia = <video width="100%" height="100%" controls>
							<source src={formatVideo(this.props.post.video)} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
		}
		else{
		
			postMedia = <img className="img-responsive" src={formatImg(this.props.post.image, 'large')} />
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

});


module.exports = PostDetailImage;