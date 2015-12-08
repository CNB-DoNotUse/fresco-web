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
		this.updateRadius = this.updateRadius.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {

		var self = this;

		//Update the autocomplete field when the marker is finished dragging on the main map
		if(this.props.shouldUpdatePlace && this.props.newAssignment && this.props.newAssignment.location){

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
			this.props.updateNewAssignment(
				location, 
				this.props.newAssignment ? this.props.newAssignment.radius : null, 
				this.props.newAssignment ? this.props.newAssignment.zoom : null
			);

			this.setState({ 
				place: autocomplete.getPlace() 
			});

		});

	}

	/**
	 * Updates the state radius from the input event
	 */
	updateRadius(e) {
	 
	    var feetRadius = parseFloat(this.refs['radius'].value);
	    
	    if(feetRadius == 'NaN') 
	    	return;

	    this.props.updateNewAssignment(
	    	this.props.newAssignment.location,
			feetRadius,
			this.props.newAssignment.zoom
	    );
	}	

	render() {

		var paymentStatus = '',
			paymentMessage = '',
			editMap = '',
			location = this.props.newAssignment ? this.props.newAssignment.location : null,
			radius =  this.props.newAssignment ? this.props.newAssignment.radius : null,
			zoom =  this.props.newAssignment ? this.props.newAssignment.zoom : null;

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
					
					<span 
						onClick={this.props.toggleSubmissionCard.bind(null, false)} 
						className="mdi mdi-close pull-right icon toggle-card toggler"></span>
				</div>
				<div className="card-foot center">
					<button 
						id="add-assignment-submit" 
						type="button" 
						className="btn btn-flat toggle-card toggler" 
						onClick={this.submitForm}
						disabled={!this.props.user.outlet && !this.props.user.outlet.card}>Submit</button>
				</div>
				<div className="card-body">
					<div className="form-group-default">
						<input ref="title" type="text" className="form-control floating-label" placeholder="Title" />
						
						<textarea ref="caption" type="text" className="form-control floating-label" placeholder="Caption" />
					</div>
					
					<div className="map-group">
						<div className="form-group-default">
							<input 
								ref="autocomplete" 
								type="text" 
								className="form-control floating-label" 
								placeholder="Location" />
							
							<input 
								ref="radius" 
								type="text" 
								className="form-control floating-label integer" 
								data-hint="feet" 
								onKeyUp={this.updateRadius}
								placeholder="Radius" />
						</div>
						
						<EditMap 
							location={location} 
							radius={radius}
							zoom={zoom}
							type='drafted'
							rerender={this.props.rerender} />
					</div>
					
					<div className="form-group-default">
						<input 
							type="text" 
							className="form-control floating-label integer" 
							data-hint="hours from now" 
							ref="expiration"
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

		if(!this.props.newAssignment) return;

		var assignment = {
				title: this.refs.title.value,
				caption: this.refs.caption.value,
				radius: global.feetToMiles(parseInt(this.refs.radius.value)),
				expiration_time: this.refs.expiration.value * 60 * 60 * 1000, //Convert to milliseconds,
				address: this.state.place ? this.refs.autocomplete.value : null,
				lon: this.props.newAssignment.location.lng, //Should be lng
				lat: this.props.newAssignment.location.lat
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
			$.snackbar({content: 'Please enter a radius greater than or equal to 250 feet'});
			return;
		}
		
		$.ajax({
			method: 'post',
			url: '/scripts/assignment/create',
			data: JSON.stringify(assignment),
			contentType: 'application/json',
			success: (result) => {

				if (result.err){
					$.snackbar({content: 'There was an error submitting your assignment!'});
					return;
				}
				else{

					//Hide the assignment card
					this.props.toggleSubmissionCard(false, null);

					//Tell the main map to update itself, to reflect the new assignment
					this.props.mapShouldUpdate(true);

					$.snackbar({content: 'Your assignment has been successfully submitted and is awaiting approval!'});

					//Clear all the fields
					this.refs.title.value = '';
					this.refs.caption.value = '';
					this.refs.expiration.value = '';
					this.refs.autocomplete.value = '';
				}
			}
		});
		
		
		
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

