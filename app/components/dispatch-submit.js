import React from 'react';
import EditMap from './editing/edit-map'

/** //

Description : Submit form for an assignemnt

// **/

/**
 * Assignment Form parent component
 */

export default class DispatchSubmit extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var paymentStatus = '',
			paymentMessage = '';

		if(this.props.user.outlet && this.props.user.outlet.card){
			paymentStatus = <span className="mdi mdi-check available"></span>;
			paymentMessage = 'Payment information available';
		}
		else{
			paymentStatus = <span className="mdi mdi-close unavailable"></span>;
			paymentMessage = 'Payment information unavailable';
		}

		return (

			<div className="card panel toggle-card toggled" id="dispatch-submit">
				<div className="card-head">
					<span className="md-type-title">New Assignment</span>
					<span id="close-assignment-window" className="mdi mdi-close pull-right icon toggle-card toggler"></span>
				</div>
				<div className="card-foot center">
					<button 
						id="add-assignment-submit" 
						type="button" 
						className="btn btn-flat toggle-card toggler" 
						onClick={this.submit}
						disabled={this.props.user.outlet && this.props.user.outlet.card}>Submit</button>
				</div>
				<div className="card-body">
					<div className="form-group-default">
						<input id="add-assignment-title" type="text" className="form-control floating-label" placeholder="Title" />
						<textarea id="add-assignment-description" type="text" className="form-control floating-label" placeholder="Caption"></textarea>
					</div>
					<div className="map-group">
						<div className="form-group-default">
							<input id="add-assignment-location-input" type="text" className="form-control floating-label google-autocomplete" placeholder="Location" />
							<input id="add-assignment-radius-input" type="text" className="form-control floating-label integer" data-hint="feet" placeholder="Radius" />
						</div>
						<div className="map-container">
							<div id="add-assignment-map">MAP</div>
						</div>
					</div>
					<div className="form-group-default">
						<input 
							id="add-assignment-expiration" 
							type="text" 
							className="form-control floating-label integer" 
							data-hint="hours from now" 
							placeholder="Expiration time" />
					</div>
					<a className="payment" href="/outlet/settings">
						{paymentStatus}
						{paymentMessage}
					</a>
				</div>
			</div>
			
		);

	}

	submit() {

		var place = autocomplete.getPlace(),
			assignment = {
				title: PAGE_Dispatch.createTitle.val(),
				caption: PAGE_Dispatch.createCaption.val(),
				lat: PAGE_Dispatch.assignmentMap.marker.getPosition().lat(),
				lon: PAGE_Dispatch.assignmentMap.marker.getPosition().lng(),
				radius: parseInt(PAGE_Dispatch.createRadius.val()),
				expiration_time: parseInt(PAGE_Dispatch.createExpiration.val()),
				outlet : (PAGE_Dispatch.outlet ? PAGE_Dispatch.outlet._id : ""),
				// googlemaps: googlemaps.locality + ", " + googlemaps.administrative_area_level_1,
				googlemaps: PAGE_Dispatch.createLocation.val(),
				address: place ? place.formatted_address : null,
		};
		
		if (assignment.title === ''){
			$.snackbar({content: 'Assignment must have a title'});
			return false;
		}
		if (assignment.caption === ''){
			$.snackbar({content: 'Assignment must have a caption'});
			return false;
		}
		if (assignment.googlemaps === ''){
			$.snackbar({content: 'Assignment must have a location'});
			return false;
		}
		if (isNaN(assignment.expiration_time) || assignment.expiration_time < 1){
			$.snackbar({content: 'Expiration time must be at least 1 hour'});
			e.stopImmediatePropagation();
			return false;
		}
		if (isNaN(assignment.radius) || assignment.radius < 250)
			assignment.radius = 250;
			
		assignment.radius = feetToMiles(assignment.radius);
		assignment.expiration_time *= 3600000;
		
		PAGE_Dispatch.addAssignment(assignment, function(err, assignment){
			if (err)
				return $.snackbar({content:resolveError(err)});
			
			PAGE_Dispatch.map.marker.setMap(null);
			PAGE_Dispatch.map.circle.setMap(null);
			
			PAGE_Dispatch.map.panTo(PAGE_Dispatch.assignmentMap.marker.getPosition());
			PAGE_Dispatch.map.setZoom(PAGE_Dispatch.assignmentMap.getZoom());
		});



	}

	toggleList(toggle) {

		console.log(toggle);

	}
}	

