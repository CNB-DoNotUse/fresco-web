import React from 'react'
import global from '../../../lib/global'


/** //

Description : Column on the right of the detail post showing all the post's info

// **/

/**
 * PostInfo parent object
 */

export default class PostInfo extends React.Component {
	
	render() {
		//Init needed vars to make list
		var post = this.props.post,
			gallery = this.props.gallery,
			userIcon = '',
			twitter = '',
			curator = '',
			timeString = global.formatTime(this.props.post.time_created, true),
			verifiedBy = '',
			verifyClass = '',
			userName = '';

		//Define username based on post meta
		if(post.meta.twitter)
	 		userName = post.meta.twitter.user_name;
	 	else if(post.owner)
	 		userName = post.owner.firstname + ' ' + post.owner.lastname;

	 	//Define verifier text based on approvals
		if(this.props.post.approvals) {
			verifiedBy = 'Verified';
			verifyClass = "mdi icon verified mdi-checkbox-marked-circle";

			if(this.props.user.rank >= global.RANKS.CONTENT_MANAGER && this.props.verifier) {
				 verifiedBy += ' by ' + this.props.verifier;
			}

		} else {
			verifiedBy = 'Not yet verified';
			verifyClass = 'mdi mdi-alert-circle icon';
		}

		//Check to show user icon
		if(this.props.post.owner){
			userIcon = <div>
							<img 
								className="img-circle img-responsive" 
								src={post.owner && post.owner.avatar ? post.owner.avatar : 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png'} />
						</div>
		}

		//Check to show twitter item
		if (post.meta.twitter && post.meta.twitter.url){
			var twitter = 	<li>
								<span className="mdi mdi-twitter icon"></span>
								<a href={ post.meta.twitter.url } target="_blank">See original</a>
							</li>
		}

		//Check to show curator item
		if (gallery.curator && this.props.user.rank > 1) {
			var curator = <li>
							<span className="mdi mdi-account icon"></span>
							{this.props.gallery.curator.firstname + ' ' + this.props.gallery.curator.lastname}
						</li>
		}

		return (

			<div className="col-xs-12 col-md-4 meta">
				<div className="row">
					<div className="col-xs-12 col-sm-7 col-md-12">
						<div className="meta-user">
							{userIcon}
							<div>
								<a href={ post.owner ? "/user/" + post.owner._id : ""}>
									<span className="md-type-title">{userName}</span>
								</a>
								
								<span className="md-type-body1">{this.props.post.affiliation}</span>
							</div>
						</div>
						<div className="meta-description">{this.props.gallery.caption}</div>
					</div>
					<div className="col-xs-12 col-sm-5 col-md-12 meta-list">
						<ul className="md-type-subhead">
							<li>
								<span className="mdi mdi-clock icon"></span>
								{timeString}
							</li>
							
							<li>
								<span className="mdi mdi-map-marker icon"></span>
								{post.location ? post.location.address ? post.location.address : 'No Location' : 'No Location'}
							</li>
							
							{twitter}

							<li>
								<span className={verifyClass}></span>
								{verifiedBy}
							</li>
						
							{curator}
						</ul>
					</div>
				</div>
			</div>

		);
	}

}

PostInfo.defaultProps = {
	verifier: ''
}