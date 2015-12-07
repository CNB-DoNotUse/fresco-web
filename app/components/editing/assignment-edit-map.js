import React from 'react'
import EditMap from './edit-map'
import global from './../../../lib/global'

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
	 
	    var feetRadius = parseFloat(this.refs['radius'].value);
	    
	    if(feetRadius == 'NaN') 
	    	return;

	    this.props.updateLocation(
	    	this.props.location,
			global.feetToMiles(feetRadius)
	    );
	}

	render() {

		var radius = this.props.radius ? Math.ceil(global.milesToFeet(this.props.radius)) : null,
			address = this.props.address;

		return ( 
			
			<div style={{height: '309px'}}>
		    	<div className="map-group">
			        <div className="form-group-default">
			            <input
			                type="text"
			                className="form-control floating-label"
			                placeholder="Location"
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