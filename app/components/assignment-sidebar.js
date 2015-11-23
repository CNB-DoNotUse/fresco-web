import React from 'react'

/** //

Description : Column on the left of the posts grid on the assignment detail page

// **/

/**
 * Assignment sidebar parent object
 */

export default class AssignmentSidebar extends React.Component {

	render() {	

		return (
			<div className="col-sm-4 profile hidden-xs">
				<div className="container-fluid fat">
					<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
						<div className="meta">
							<div className="meta-description" id="story-description">
								{this.props.story.caption || 'No Description'}
							</div>
							<AssignmentStats story={this.props.story} />
						</div>
					</div>
				</div>
			</div>

		);
	}

}


/**
 * AssignmentStats stats inside the sidebar
 */

class AssignmentStats extends React.Component {

	render() {

		if(!this.props.story.stats) return;

		var location = '',
			expiration = '',
			photos = '',
			videos = '';

		location = <li>
						<span class="mdi mdi-map-marker icon"></span>
						<span>{assignment.location && assignment.location.googlemaps ? assignment.location.googlemaps : 'No Location'}</span>
					</li>
		
		expiration = <li>
						<span class="mdi mdi-clock icon"></span>
						<span>Expired x days ago</span>
					</li>
		
		photos = <li>
					<span className="mdi mdi-file-image-box icon"></span>
					<span>{this.props.assignment.stats.photos} {this.props.assignment.stats.photos > 1 ? 'photos' : 'photo'}</span>
				</li>
		
		videos = <li>
					<span className="mdi mdi-movie icon"></span>
					<span>{this.props.assignment.stats.videos} {this.props.assignment.stats.videos > 1 ? 'videos' : 'video'}</span>
				</li>
		

		return (

			<div className="meta-list">
				<ul className="md-type-subhead">
					{location}
					{expiration}
					{photos}
					{videos}
				</ul>
			</div>
			
		)
	}

}