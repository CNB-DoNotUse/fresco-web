import React from 'react';
import EditMap from '../editing/edit-map'
import FrescoAutocomplete from '../global/fresco-autocomplete.js'
import global from '../../../lib/global'

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
		this.autocompleteUpdated = this.autocompleteUpdated.bind(this);
	}


	componentWillReceiveProps(nextProps) {
		var self = this,
			successfulGeo = false;

		// Dispatch map has an eventlistener to set `lastChangeSource` 
		// This occurs when the pending assignment marker is moved.
		if(nextProps.lastChangeSource == 'markerDrag' && nextProps.newAssignment) {
			var geocoder = new google.maps.Geocoder(),
				geo = {
					lat: nextProps.newAssignment.location.lat, 
					lng: nextProps.newAssignment.location.lng
				};

			self.currentGeocode = geo;

			geocode(geo);
		}


		function geocode(geo) {
			if(JSON.stringify(geo) !== JSON.stringify(self.currentGeocode)) 
				return;

			geocoder.geocode({
				'location': geo
			}, (results, status) => {
				if(status === google.maps.GeocoderStatus.OK && results[0] !== null && !successfulGeo){
					successfulGeo = true;

					self.setState({
						autocompleteText: results[0].formatted_address
					})
				} else if(status === 'OVER_QUERY_LIMIT' && !successfulGeo) {
					setTimeout(() => {					
						//recurse in case of a rate limit
						geocode(geo);
					}, 300);
				}
			});
		}
	}

	/**
	 * Prop function called from `FrescoAutocomplete` for getting autocomplete date
	 */
	autocompleteUpdated(autocompleteData) {
		//Update the position to the parent component
		this.props.updateNewAssignment(
			autocompleteData.location,
			this.props.newAssignment ? this.props.newAssignment.radius : null,
			this.props.newAssignment ? this.props.newAssignment.zoom : null,
			'autocomplete'
		);

		var prediction = autocompleteData.prediction;

		//Update input value of autocomplete
		this.setState({
			autocompleteText: prediction.description || prediction.formatted_address
		});
	}

	/**
	 * Updates the state radius from the input event
	 */
	updateRadius(e) {
	    var radiusInMiles= global.feetToMiles(parseFloat(this.refs['radius'].value));

	    if(radiusInMiles == 'NaN') 
	    	return;

	    this.props.updateNewAssignment(
	    	this.props.newAssignment.location,
			radiusInMiles,
			this.props.newAssignment.zoom
	    );
	}

	/**
	 * Form submissions
	 */
	submitForm() {
		var assignment = {
				title: this.refs.title.value,
				caption: this.refs.caption.value,
				radius: global.feetToMiles(parseInt(this.refs.radius.value)),
				address: this.refs.autocomplete.refs.inputField.value,
				expiration_time: null,
				googlemaps: this.refs.autocomplete.refs.inputField.value,
				lon: this.props.newAssignment.location.lng, //Should be lng
				lat: this.props.newAssignment.location.lat,
				now: Date.now()
			};

		if(this.refs.expiration.value) {
			//Convert to milliseconds (from hours) and add current time
			assignment.expiration_time =  this.refs.expiration.value  * 60 * 60 * 1000 + Date.now()
		}

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
		if (!global.isValidRadius(assignment.radius)){
			$.snackbar({content: 'Please enter a radius greater than or equal to 250 feet'});
			return;
		}

		$.ajax({
			method: 'post',
			url: '/api/assignment/create',
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

					this.props.updateViewMode('pending');

					//Tell the main map to update itself, to reflect the new assignment
					this.props.mapShouldUpdate(true);

					$.snackbar({
						content: 'Your assignment has been successfully submitted and is awaiting approval!',
						timeout: 5000
					});

					//Clear all the fields
					this.refs.title.value = '';
					this.refs.caption.value = '';
					this.refs.expiration.value = '';
					this.refs.autocomplete.value = '';
				}
			}
		});
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
							<FrescoAutocomplete
								inputText={this.state.autocompleteText}
								class="form"
								inputClass="form-control floating-label"
								ref="autocomplete"
								transition={false}
								updateAutocompleteData={this.autocompleteUpdated}
								lastChangeSource={this.props.lastChangeSource} />

							<input
								ref="radius"
								type="text"
								className="form-control floating-label"
								data-hint="feet"
								onKeyUp={this.updateRadius}
								placeholder="Radius" />
						</div>

						<EditMap
							location={location}
							radius={global.milesToFeet(radius)}
							zoom={zoom}
							type='drafted'
							rerender={this.props.rerender} />
					</div>

					<div className="form-group-default">
						<input
							type="text"
							className="form-control floating-label"
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
}