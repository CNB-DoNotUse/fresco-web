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

	componentDidMount() {
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
				url: '/api/outlet/location/create',
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
			$.snackbar({ 
				content: 'Please enter a location in the input field on the left to add it your saved locations' 
			});
		}
	}

	/**
	 * Loads locations for the outlet
	 */
	loadLocations(){
		var self = this;

		$.ajax({
			url: '/api/outlet/location/stats',
			method: 'GET',
			success: function(response){
				if (response.err){
					return this.error(null, null, response.err);
				} else{
					//Update state
					self.setState({ locations: response.data });
				}
			},
			error: (xhr, status, error) => {
				$.snackbar({
					content: global.resolveError(error, 'We\'re unable to load your locations at the moment! Please try again in a bit.') 
				});
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

		var dropdownActions = [];

		if(this.props.addLocationButton){
			dropdownActions.push(
				<span className="mdi mdi-playlist-plus" onClick={this.addLocation} key={1}></span>
			);
		} 

		if(this.props.outlet.owner === this.props.user._id){
			dropdownActions.push(
				<a href="/outlet/settings" key={2}>
					<span className="mdi mdi-settings"></span>
				</a>
			);
		}
							
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