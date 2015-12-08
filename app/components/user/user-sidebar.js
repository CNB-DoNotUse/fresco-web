import React from 'react'
import global from './../../lib/global'

/** //

Description : Column on the left of the user page

// **/

/**
 * User Sidebar parent object
 */

export default class UserSidebar extends React.Component {

	render() {	

		var user = this.props.user,
			name = user.firstname + ' ' + user.lastname,
			email = user.email,
			avatar = user.avatar || global.defaultAvatar,
			galleries = user.stats.galleries,
			photos = user.stats.photos,
			videos = user.stats.videos;

		return (

			<div className="col-sm-4 profile hidden-xs">
				<div className="container-fluid fat">
					<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
						<img 
							className="img-responsive" 
							src={avatar} />
						
						<div className="meta">
							<div className="meta-list">
								<ul className="md-type-subhead">
										<li className="ellipses">
											<span className="mdi mdi-email icon"></span>
											<a target="_top" href={'mailto:' + email}>{email}</a>
										</li>

										<li>
											<span className="mdi mdi-image-filter icon"></span>{galleries + ' galleries'}
										</li>
									
										<li>
											<span className="mdi mdi-file-image-box icon"></span>{photos + ' photos'}
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


/**
 * Story stats inside the sidebar
 */

class StoryStats extends React.Component {

	render() {

		if(!this.props.story.stats) return;

		var galleries = '',
			photos = '',
			videos = '';
		
		galleries =
			<li>
				<span className="mdi mdi-image-filter icon story-galleries"></span>
				<span>{this.props.story.stats.photos} {this.props.story.stats.photos > 1 ? 'galleries' : 'gallery'}</span>
			</li>

		photos = 
			<li>
				<span className="mdi mdi-file-image-box icon"></span>
				<span>{this.props.story.stats.photos} {this.props.story.stats.photos > 1 ? 'photos' : 'photo'}</span>
			</li>
		
		videos = 
		<li>
			<span className="mdi mdi-movie icon"></span>
			<span>{this.props.story.stats.videos} {this.props.story.stats.videos > 1 ? 'videos' : 'video'}</span>
		</li>
		

		return (

			<div className="meta-list">
				<ul className="md-type-subhead">
				{galleries}
				{photos}
				{videos}
				</ul>
			</div>
			
		)
	}

}