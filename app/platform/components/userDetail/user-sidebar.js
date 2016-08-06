import React from 'react'
import utils from 'utils'

/** //

Description : Column on the left of the user page

// **/

/**
 * User Sidebar parent object
 */

export default class UserSidebar extends React.Component {

	render() {	

		const user = this.props.detailUser;
		const name = user.firstname + ' ' + user.lastname;
		const avatar = user.avatar || utils.defaultAvatar;
		const galleries = user.stats.galleries;
		const photos = user.stats.photos;
		const videos = user.stats.videos;
		let email = '';
		let stripe = '';

		if(this.props.user.permissions.includes('get-all-purchases')){
			if(user.email !== null)
				email = <li className="ellipses">
							<span className="mdi mdi-email icon"></span>
							<a target="_top" href={'mailto:' + user.email}>
								{user.email}
							</a>
						</li> 	

			if(user.stripe !== null)
				stripe = <li className="ellipses">
							<span className="mdi mdi-bank icon"></span>
							<a target="_top" href={'https://dashboard.stripe.com/' + user.stripe}>Stripe</a>
						</li> 	
		}

		return (

			<div className="col-sm-4 profile hidden-xs">
				<div className="container-fluid fat">
					<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
						<img 
							className="img-responsive img-avatar" 
							src={avatar} />
						
						<div className="meta">
							<div className="meta-list">
								<ul className="md-type-subhead">
										{email}

										{stripe}

										<li>
											<span className="mdi mdi-image-multiple icon"></span>{galleries + ' galleries'}
										</li>
									
										<li>
											<span className="mdi mdi-image icon"></span>{photos + ' photos'}
										</li>
									
										<li>
											<span className="mdi mdi-movie icon"></span>{videos + ' videos'}
										</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

		);
	}
}