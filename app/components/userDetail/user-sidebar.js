import React from 'react'
import global from './../../../lib/global'

/** //

Description : Column on the left of the user page

// **/

/**
 * User Sidebar parent object
 */

export default class UserSidebar extends React.Component {

	render() {	

		var user = this.props.detailUser,
			name = user.firstname + ' ' + user.lastname,
			email = '',
			avatar = user.avatar || global.defaultAvatar,
			galleries = user.stats.galleries,
			photos = user.stats.photos,
			videos = user.stats.videos;

		console.log(user);

		if(this.props.user.rank >= global.RANKS.CONTENT_MANAGER && user.email !== null){

			email = <li className="ellipses">
						<span className="mdi mdi-email icon"></span>
						<a target="_top" href={'mailto:' + user.email}>
							{user.email}
						</a>
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