import React from 'react'
import global from '../../../lib/global'
import moment from 'moment'

/** //

Description : Column on the left of the posts grid on the assignment detail page

// **/

/**
 * Assignment sidebar parent object
 */

export default class AssignmentSidebar extends React.Component {

	render() {	

		var expireButton = '';

		if (this.props.assignment.expiration_time > Date.now()){ 
		
			expireButton = <button 
								className="btn fat tall btn-error assignment-expire"
								onClick={this.props.expireAssignment}>Expire</button>

		}

		return (
			<div className="col-sm-4 profile hidden-xs">
				<div className="container-fluid fat">
					<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
						<div className="meta">
							<div className="meta-description" id="story-description">
								{this.props.assignment.caption || 'No Description'}
							</div>
							
							<div className="meta-user">
								{expireButton}
							</div>
							
							<AssignmentStats assignment={this.props.assignment} />
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

		var assignment = this.props.assignment,
			expirationTime = new Date(this.props.assignment.expiration_time),
			expiredText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ') + moment(expirationTime).fromNow();

		var location = <li>
						<span className="mdi mdi-map-marker icon"></span>
						<span>{assignment.location && assignment.location.address || 'No Address'}</span>
					</li>
		
		var expiration = <li>
						<span className="mdi mdi-clock icon"></span>
						<span>{expiredText}</span>
					</li>

				console.log(assignment);
		
		var photos = <li>
					<span className="mdi mdi-file-image-box icon"></span>
					<span>{assignment.stats.photos + ' photo' + (global.isPlural(assignment.stats.photos) ? 's' : '')}</span>
				</li>
		
		var videos = <li>
					<span className="mdi mdi-movie icon"></span>
					<span>{assignment.stats.photos + ' video' + (global.isPlural(assignment.stats.photos) ? 's' : '')}</span>
				</li>


		var outlet = <li>
					<span className="mdi mdi-account icon"></span>
					<span>{assignment.outlet.title}</span>
				</li>
			

		return (

			<div className="meta-list">
				<ul className="md-type-subhead">
					{location}
					{expiration}
					{outlet}
					{photos}
					{videos}
				</ul>
			</div>
			
		)
	}

}