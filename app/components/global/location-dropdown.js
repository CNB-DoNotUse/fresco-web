import React from 'react'
import global from '../../../lib/global'
import Dropdown from './dropdown'

/**
 * Location Dropdown for saved locations
 */

export default class LocationDropdown extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			locations: []
		}

		this.addLocation = this.addLocation.bind(this);
	}

	componentWillMount() {
		//Load intial locations
	    this.loadLocations();  
	}

	/**
	 * Adds the curret prop location to the outlet locations
	 */
	addLocation() {
		if(this.props.mapPlace){
			
			var autocomplete = document.getElementById('dispatch-location-input'),
				place = this.props.mapPlace,
				self = this;

			//Run checks on place and title
			if (!place || !place.geometry || !place.geometry.viewport){
				return $.snackbar({content: global.resolveError('ERR_UNSUPPORTED_LOCATION')});
			} else if(!autocomplete.value){
				$.snackbar({content: 'Please enter a valid location title'});
			}
			
			var bounds = place.geometry.viewport,
				params = {
					title: autocomplete.value,
					polygon: global.generatePolygonFromBounds(bounds)
				};
			
			$.ajax({
				url: '/scripts/outlet/location/create',
				method: 'post',
				contentType: 'application/json',
				data: JSON.stringify(params),
				success: function(response){

					if (response.err) 
						return this.error(null, null, response.err);

					$.snackbar({ content : params.title + ' has been successfully added to your saved locations.'})

					//Update locations
					self.loadLocations();

				},
				error: (xhr, status, error)=> {
					$.snackbar({ content: global.resolveError(error) });
				}
			});
			

		} else{
			$.snackbar({ content: 'Please enter a location in the input field on the left to add it your saved locations'})
		}
	}

	
	/**
	 * Loads locations for the outlet
	 */
	loadLocations(){

		//`since` is the last time they've seen the locations page,
		//eitehr grabbed from location storage, or defaults to the current timestamp
		var self = this,
			since = window.sessionStorage.location_since ? JSON.parse(window.sessionStorage.location_since) : {};

		$.ajax({
			url: '/api/outlet/location/list',
			method: 'GET',
			success: function(response){

				if (response.err || !response.data)
					return this.error(null, null, response.err);
				
				//Loop through and add all the `since` data from the response
				response.data.forEach(function(location){
					if (!since[location._id])
						since[location._id] = Date.now();
				});

				//Update state
				self.setState({ locations: response.data });
			},
			error: (xhr, status, error) => {
				// $.snackbar({content: global.resolveError(error), ''});
			}
		});
	}
	
	render() {

		var locations = this.state.locations.map((location, i) => {

			var unseenCount = location.unseen_count || 0;

			unseenCount = global.isPlural(unseenCount) ? unseenCount + ' unseen items' : unseenCount + ' unseen item';
			
			return ( 
				<li className="location-item" key={i}>
					<a href={"/location/" + location._id}>
							<span className="area">{location.title}</span>
							<span className="count">{unseenCount}</span>
					</a>
				</li> 
			);

		});

		var addLocationButton;

		if(this.props.addLocationButton){
			addLocationButton = <span className="mdi mdi-playlist-plus" onClick={this.addLocation}></span>
		} 

		var dropdownActions = [
			<a href="/outlet/settings">
				<span className="mdi mdi-settings"></span>
			</a>,
			addLocationButton
		];
							
		if(locations.length == 0){

			var dropdownBody = <div className="dropdown-body">
							   		<h3 className="empty-title">There are currently no saved locations for your outlet!</h3>
							   	</div>
			
		} else{
			var dropdownBody = <div className="dropdown-body">
									<ul className="list">
										{locations}
									</ul>
								</div>
		}

		return (
			<Dropdown 
				inList={true} 
				title={"SAVED"} 
				dropdownClass={"location-dropdown"} 
				dropdownActions={dropdownActions}>
				{dropdownBody}
			</Dropdown>
		);
					
	}
}

Dropdown.defaultProps = {
	inList: false,
	addLocationButton: false
}