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
				<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
					<div className="meta">
						<div className="meta-description" id="story-description">
							{this.props.assignment.caption || 'No Description'}
						</div>
						
						<div className="meta-user">
							{expireButton}
						</div>
						
						<AssignmentStats 
							stats={this.props.stats}
							assignment={this.props.assignment} />
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
			expiredText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ') + moment(expirationTime).fromNow(),
			stats = this.props.stats;

		return (

			<div className="meta-list">
				<ul className="md-type-subhead">
					<li>
						<span className="mdi mdi-map-marker icon"></span>
						<span>{assignment.location && assignment.location.address || 'No Address'}</span>
					</li>
					<li>
						<span className="mdi mdi-clock icon"></span>
						<span>{expiredText}</span>
					</li>
					<li>
						<span className="mdi mdi-account icon"></span>
						<span>{assignment.outlet.title}</span>
					</li>
					<li>
						<span className="mdi mdi-image icon"></span>
						<span>{stats.photos + ' photo' + (global.isPlural(stats.photos) ? 's' : '')}</span>
					</li>
					<li>
						<span className="mdi mdi-movie icon"></span>
						<span>{stats.videos + ' video' + (global.isPlural(stats.videos) ? 's' : '')}</span>
					</li>
				</ul>
			</div>
			
		)
	}
}