import React from 'react'
import utils from 'utils'


/** //

Description : Column on the right of the detail post showing all the post's info

// **/

/**
 * PostInfo parent object
 */

export default class PostInfo extends React.Component {

	render() {
		//Init needed vars to make list
        const { post, gallery, user } = this.props;
		let userIcon = '';
		let twitter = '';
	    let	curator = '';
		let timeString = utils.formatTime(post.created_at, true);
		let verifiedBy = '';
		let verifyClass = '';
		let userName = '';

        //Define verifier text based on approvals
        if (post.rating >= 2) {
            verifiedBy = 'Verified';
            verifyClass = "mdi icon verified mdi-checkbox-marked-circle";

            if (user.permissions.includes('update-other-content') && post.curator) {
                 verifiedBy += ` by ${post.curator.full_name}`;
            }
        } else {
            verifiedBy = 'Not yet verified';
            verifyClass = 'mdi mdi-alert-circle icon';
        }

        //Check to show user icon
        if(post.owner){
            userName = post.owner.full_name || post.owner.username;

            userIcon = (
                <div>
                    <img
                        className="img-circle img-responsive"
                        src={(post.owner && post.owner.avatar)
                            ? post.owner.avatar
                            : 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png'}
                        />
                    </div>
            );
        }

		// Check to show twitter item
		if (gallery.external_source === 'twitter'){
            twitter = (
                <li>
                    <span className="mdi mdi-twitter icon"></span>
                    <a href={gallery.external_url} target="_blank">See original</a>
                </li>
            );
		}

		// Check to show curator item
		if (gallery.curator && this.props.user.permissions.includes('update-other-content')) {
            curator = (
                <li>
                    <span className="mdi mdi-account icon"></span>
                    {this.props.gallery.curator.full_name}
                </li>
            );
        }

		return (
			<div className="col-xs-12 col-md-4 meta">
				<div className="row">
					<div className="col-xs-12 col-sm-7 col-md-12">
						<div className="meta-user">
							{userIcon}

							<div>
								<a href={ post.owner ? "/user/" + post.owner.id : ""}>
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
								{(post.location && post.location.address) ? post.location.address : 'No Location'}
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
