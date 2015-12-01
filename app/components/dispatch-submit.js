import React from 'react';
import EditMap from './editing/edit-map'
import global from './../../lib/global'

/** //

Description : Submit form for an assignemnt

// **/

/**
 * Assignment Form parent component
 */

export default class DispatchSubmit extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			place: null
		}
		this.submitForm = this.submitForm.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {

		var self = this;

		//Update the autocomplete field when the marker is finished dragging on the main map
		if(this.props.updatePlace && this.props.newAssignment){

			var geocoder = new google.maps.Geocoder();

			geocoder.geocode({'location': {
				lat: this.props.newAssignment.location.lat,
				lng: this.props.newAssignment.location.lng
			}}, function(results, status){
				
				if(status === google.maps.GeocoderStatus.OK && results[0]) 
					self.refs.autocomplete.value = results[0].formatted_address;

			});
		}
	}

	componentDidMount() {

		//Set up autocomplete listener
		var autocomplete = new google.maps.places.Autocomplete(this.refs.autocomplete);
				
		google.maps.event.addListener(autocomplete, 'place_changed', () => {

			var place = autocomplete.getPlace(),
				location = {
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng()
				};

			//Update the position to the parent component
			this.props.updatenewAssignment(location, null);

			this.setState({ 
				place: autocomplete.getPlace() 
			});

		});
	 	

	}

	render() {

		var paymentStatus = '',
			paymentMessage = '',
			editMap = '',
			location = this.props.newAssignment ? this.props.newAssignment.location : null,
			radius =  this.props.newAssignment ? this.props.newAssignment.radius : null;


		if(this.props.user.outlet && this.props.user.outlet.card){
			paymentStatus = <span className="mdi mdi-check available"></span>;
			paymentMessage = 'Payment information available';
		}
		else{
			paymentStatus = <span className="mdi mdi-close unavailable"></span>;
			paymentMessage = 'Payment information unavailable';
		}

		return (

			<div className="card panel toggle-card" id="dispatch-submit">
				<div className="card-head">
					<span className="md-type-title">New Assignment</span>
					<span id="close-assignment-window" className="mdi mdi-close pull-right icon toggle-card toggler"></span>
				</div>
				<div className="card-foot center">
					<button 
						id="add-assignment-submit" 
						type="button" 
						className="btn btn-flat toggle-card toggler" 
						onClick={this.submitForm}
						disabled={this.props.user.outlet && this.props.user.outlet.card}>Submit</button>
				</div>
				<div className="card-body">
					<div className="form-group-default">
						<input ref="title" type="text" className="form-control floating-label" placeholder="Title" />
						<textarea ref="caption" type="text" className="form-control floating-label" placeholder="Caption"></textarea>
					</div>
					<div className="map-group">
						<div className="form-group-default">
							<input ref="autocomplete" type="text" className="form-control floating-label" placeholder="Location" />
							<input ref="radius" type="text" className="form-control floating-label integer" data-hint="feet" placeholder="Radius" />
						</div>
						<EditMap 
							location={location} 
							radius={location} />
					</div>
					<div className="form-group-default">
						<input 
							id="add-assignment-expiration" 
							type="text" 
							className="form-control floating-label integer" 
							data-hint="hours from now" 
							ref="expirationTime"
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

	submitForm() {

		var place = this.state.place || null,     
			assignment = {
				title: this.refs.title.value,
				caption: this.refs.caption.value,
				radius: global.feetToMiles(parseInt(this.refs.radius.value)),
				expiration_time: parseInt(this.refs.expirationTime.value) * 3600000,
				address: 'Address',
				location: {
					type: 'point',
					coordinates: [
						this.props.newAssignment.location.lng,
						this.props.newAssignment.location.lat
					]
				}
			};

		/* Run Checks */

		if (global.isEmptyString(assignment.title)){
			$.snackbar({content: 'Your assignment must have a title!'});
			return;
		}
		if (global.isEmptyString(assignment.caption)){
			$.snackbar({content: 'Your assignment must have a caption!'});
			return ;
		}
		if (global.isEmptyString(assignment.googlemaps)){
			$.snackbar({content: 'Your assignment must have a location!'});
			return;
		}
		if (isNaN(assignment.expiration_time) || assignment.expiration_time < 1){
			$.snackbar({content: 'Your assignment\'s expiration time must be at least 1 hour!'});
			return;
		}
		if (!global.isValidRadius(assignment.radius)){ //0.0473485 IS 250 FEET IN MILES
			$.snackbar({content: 'Please enter a radius greater than 250 feet'});
			return;
		}
		
		$.ajax({
			url: "/scripts/assignment/create",
			contentType: 'application/json',
			data: JSON.stringify(assignment),
			method: 'POST',
			success: function(result){

				// if (result.err) return callback(result.err, null);
				
				// result.data.posts.filter(function(a){return a.approvals > 0;});
				
				// return callback(null, result.data);

			},
			error: function(xhr, status, error){
				// return callback(error, null);
			}
		})
		
		
		// PAGE_Dispatch.addAssignment(assignment, function(err, assignment){
		// 	if (err)
		// 		return $.snackbar({content:resolveError(err)});
			
		// 	PAGE_Dispatch.map.marker.setMap(null);
		// 	PAGE_Dispatch.map.circle.setMap(null);
			
		// 	PAGE_Dispatch.map.panTo(PAGE_Dispatch.assignmentMap.marker.getPosition());
		// 	PAGE_Dispatch.map.setZoom(PAGE_Dispatch.assignmentMap.getZoom());
		// });

	}

	toggleList(toggle) {

		console.log(toggle);

	}
}	

