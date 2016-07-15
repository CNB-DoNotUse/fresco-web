import React from 'react';
import EditMap from '../editing/edit-map'
import FrescoAutocomplete from '../global/fresco-autocomplete.js'
import utils from 'utils'


/**
 * Assignment Form parent component
 * @description Submit form for an assignemnt
 */
export default class DispatchSubmit extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			place: null,
			global: false
		}

		this.geocoder = new google.maps.Geocoder();
		this.submitForm = this.submitForm.bind(this);
		this.updateRadius = this.updateRadius.bind(this);
		this.autocompleteUpdated = this.autocompleteUpdated.bind(this);
		this.editMapChanged = this.editMapChanged.bind(this);
	}

	componentDidMount() {
	 	$.material.init();     
	}

	componentWillReceiveProps(nextProps) {
		let successfulGeo = false;
		const self = this;

		// Dispatch map has an eventlistener to set `lastChangeSource` 
		// This occurs when the pending assignment marker is moved.
		if(nextProps.lastChangeSource == 'markerDrag' && nextProps.newAssignment) {
			const geo = {
				lat: nextProps.newAssignment.location.lat, 
				lng: nextProps.newAssignment.location.lng
			};

			this.currentGeocode = geo;

			geocode(geo);
		}


		function geocode(geo) {
			if(JSON.stringify(geo) !== JSON.stringify(self.currentGeocode)) 
				return;

			self.geocoder.geocode({
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

	editMapChanged(data) {
		//Update the position to the parent component
		this.props.updateNewAssignment(data.location, 0, 0, 'markerDrag');
	}

	onGlobalChange() {
		this.setState({ global : !this.state.global });
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

		//Update input value of autocomplete
		this.setState({
			autocompleteText: autocompleteData.address
		});
	}

	/**
	 * Updates the state radius from the input event
	 */
	updateRadius(e) {
	    const radiusInMiles = utils.feetToMiles(parseFloat(this.refs['radius'].value));

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
		const { newAssignment } = this.props;
		const { global } = this.state;
		const { 
			title, 
			caption, 
			radius, 
			inputField,
			autocomplete,
			expiration
		} = this.refs;

		let assignment = {
			title: title.value,
			caption: caption.value,
			starts_at: Date.now(),
			//Convert to milliseconds (from hours) and add current time
			ends_at: expiration.value  * 60 * 60 * 1000 + Date.now()
		};

		if(!global) {
			_.assign(assignment, {
				radius: utils.feetToMiles(parseInt(radius.value)),
				address: autocomplete.refs.inputField.value,
				location: {
					type: 'Point',
					coordinates: [
						this.props.newAssignment.location.lng,
						this.props.newAssignment.location.lat
					]
				}
			});
		} else {
			assignment.global = true;
		}

		/* Run regular Checks */
		if (utils.isEmptyString(assignment.title)){
			return $.snackbar({content: 'Your assignment must have a title!'});
		} else if (utils.isEmptyString(assignment.caption)){
			return $.snackbar({content: 'Your assignment must have a caption!'});
		} else if (isNaN(expiration.value) || expiration.value < 1){
			return $.snackbar({content: 'Your assignment\'s expiration time must be at least 1 hour!'});
		}

		/* Run check only if it's not global */
		if(!global) {
			if (utils.isEmptyString(assignment.address)){
				return $.snackbar({content: 'Your assignment must have a location!'});
			} else if (!utils.isValidRadius(assignment.radius)){
				return $.snackbar({content: 'Please enter a radius greater than or equal to 250 feet'});
			}
		}	

		$.ajax({
			method: 'post',
			url: '/api/assignment/create',
			data: JSON.stringify(assignment),
			contentType: 'application/json',
			success: (result) => {
				if (result.err){
					return $.snackbar({content: 'There was an error submitting your assignment!'});
				} else{
					//Hide the assignment card
					this.props.toggleSubmissionCard(false, null);

					//Update view mode for all components
					this.props.updateViewMode('pending');

					//Tell the main map to update itself, to reflect the new assignment
					this.props.mapShouldUpdate(true);

					$.snackbar({
						content: 'Your assignment has been successfully submitted and is awaiting approval!',
						timeout: 5000
					});

					//Clear all the fields
					title.value = '';
					caption.value = '';
					expiration.value = '';
					autocomplete.value = '';
				}
			}
		});
	}

	render() {
		const { 
			newAssignment,
			user,
			bounds,
			toggleSubmissionCard,
			displaySubmissionCard,
			updateCurrentBounds,
			lastChangeSource,
			rerender
		} = this.props;

		const {
			global,
			autocompleteText
		} = this.state;

		const paymentAvailable = this.props.user.outlet && this.props.user.outlet.card;
		
		let radius = newAssignment ? newAssignment.radius : null;
		let zoom = newAssignment ? newAssignment.zoom : null;
		let mapGroup = '';

		if(!global) {
			mapGroup = (
				<div className="map-group">
					<div className="form-group-default">
						<FrescoAutocomplete
							inputText={this.state.autocompleteText}
							class="form"
							inputClass="form-control floating-label"
							ref="autocomplete"
							transition={false}
							bounds={bounds}
							updateAutocompleteData={this.autocompleteUpdated}
							lastChangeSource={lastChangeSource} />

						<input
							ref="radius"
							type="text"
							className="form-control floating-label"
							data-hint="feet"
							onKeyUp={this.updateRadius}
							placeholder="Radius" />
					</div>

					<EditMap
						location={newAssignment ? newAssignment.location : null}
						radius={utils.milesToFeet(radius)}
						zoom={zoom}
						type='drafted'
						onDataChange={this.editMapChanged}
						draggable={true}
						updateCurrentBounds={updateCurrentBounds}
						rerender={rerender} />
				</div>
			);
		}

		return (
			<div 
				className={'card panel toggle-card ' + (displaySubmissionCard ? '' : 'toggled')}
				id="dispatch-submit"
			>
				<div className="card-head">
					<span className="md-type-title">New Assignment</span>

					<span
						onClick={toggleSubmissionCard.bind(null, false)}
						className="mdi mdi-close pull-right icon toggle-card toggler"></span>
				</div>
				
				<div className="card-foot center">
					<button
						id="add-assignment-submit"
						type="button"
						className="btn btn-flat toggle-card toggler"
						onClick={this.submitForm}
						disabled={!user.outlet && !user.outlet.card}>Submit</button>
				</div>
				
				<div className="card-body">
					<div className="form-group-default">
						<input 
							ref="title" 
							type="text" 
							className="form-control floating-label" 
							placeholder="Title" 
						/>

						<textarea 
							ref="caption" 
							type="text" 
							className="form-control floating-label" 
							placeholder="Caption" 
						/>
					</div>

					{mapGroup}

					<div className="form-group-default">
						<input
							type="text"
							className="form-control floating-label"
							data-hint="hours from now"
							ref="expiration"
							placeholder="Expiration time" />

						<div className="checkbox check-global form-group">
							<label>
								<input
									type="checkbox" 
									checked={this.state.global}
									onChange={this.onGlobalChange.bind(this)} />
								Global
							</label>
						</div>
					</div>

					<a className="payment" href="/outlet/settings">
						<span 
							className={'mdi mdi-check ' + ( paymentAvailable ? 'available' : 'un-available')}>
						</span>
						{paymentAvailable ? 'Payment information available' : 'Payment information unavailable'}
					</a>
				</div>
			</div>

		);

	}
}