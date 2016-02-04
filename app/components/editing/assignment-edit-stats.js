import React from 'react'
import global from './../../../lib/global'
import moment from 'moment'

export default class AssignmentEditStats extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var assignment = this.props.assignment,
			address = assignment.location && assignment.location.address ? assignment.location.address : 'No Address',
			timeCreated = moment(new Date(assignment.time_created)).format('MMM Do YYYY, h:mm:ss a'),
			expirationTime = new Date(this.props.assignment.expiration_time),
			expiresText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ') + moment(expirationTime).fromNow();

		return (
			<div className="col-lg-3 visible-lg edit-current">
				<div className="meta">
					<div className="meta-user">
						<div>
							<img className="img-circle img-responsive" src="/images/placeholder-assignment@2x.png" />
						</div>
						<div>
							<span className="md-type-title">{assignment.title}</span>
							<span id="assignment-edit-owner" className="md-type-body1">Posted by {assignment.outlet.title}</span>
						</div>
					</div>
					<div className="meta-description">{assignment.caption}</div>
					<div className="meta-list">
						<ul className="md-type-subhead">
							<li>
								<span className="mdi mdi-clock icon"></span>{timeCreated}
							</li>
							<li>
								<span className="mdi mdi-map-marker icon"></span>{address}
							</li>
							<li>
								<span className="mdi mdi-alert-circle icon"></span>{expiresText}
							</li>
						</ul>
					</div>
				</div>
			</div>
		)
	}
}