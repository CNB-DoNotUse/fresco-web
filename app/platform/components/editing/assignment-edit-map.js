import React from 'react'
import EditMap from './edit-map'
import utils from 'utils'

/**
    Assignment Edit Map used in assignment administration page
**/

export default class AssignmentEditMap extends React.Component {

	constructor(props){
		super(props);
		this.updateRadius = this.updateRadius.bind(this);
	}

	componentDidMount() {
	 	
	 	var autocomplete = new google.maps.places.Autocomplete(this.refs.autocomplete);

	 	google.maps.event.addListener(autocomplete, 'place_changed', () => {

	 	    if(!autocomplete.getPlace().geometry) 
	 	    	return;

	 	    var coord = autocomplete.getPlace().geometry.location,
	 	    	location = {
	 	            lat: coord.lat(),
	 	            lng: coord.lng()
	 	        };

	 	    //Send update to the parent
	 	    this.props.updateLocation(
	 	    	location, 
	 	    	this.props.radius,
	 	    	this.refs.autocomplete.value
	 	    );

	 	});

	}

	/**
	 * Updates the state radius from the input event
	 */
	updateRadius(e) {
	 
	    var feetRadius = parseInt(this.refs['radius'].value, 10);
	    
	    if(feetRadius == 'NaN') 
	    	return;

	    this.props.updateLocation(
	    	this.props.location,
			feetRadius
	    );
	}

	render() {

		var radius = this.props.radius ? Math.round(this.props.radius) : null,
			address = this.props.address;

		return ( 
			
			<div style={{height: '309px'}}>
		    	<div className="map-group">
			        <div className="form-group-default">
			            <input
			                type="text"
			                className="form-control floating-label"
			                placeholder="Enter a location"
			                defaultValue={address}
			                ref="autocomplete" />
			            <input
			                type="text"
			                className="form-control floating-label numbers"
			                data-hint="feet"
			                placeholder="Radius"
			                defaultValue={radius}
			                onKeyUp={this.updateRadius}
			                ref="radius" />
			        </div>
			        <EditMap 
			        	location={this.props.location} 
			        	radius={radius} />
		   		</div>
			</div>

		);
	}
}