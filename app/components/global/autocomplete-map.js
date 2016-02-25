import React from 'react'
import PlacesAutocomplete from '../editing/places-autocomplete'
import EditMap from '../editing/edit-map'

export default class AutocompleteMap extends React.Component {

	constructor(props) {
		super(props);

		this.updateRadius = this.updateRadius.bind(this);
	}

	/**
	 * Updates prop radius function
	 */
	updateRadius() {
		var radius = parseFloat(this.refs.radius.value);
		//Check if a number
		if(!isNaN(radius)){
			this.props.onRadiusUpdate(radius);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.props.radius && this.props.hasRadius) {
			this.refs.radius.value = Math.round(this.props.radius);
		}
	}

	render() {
		var radiusInput = '';

		if(this.props.radius && this.props.hasRadius) {
			radiusInput = 
			            <input
			                type="text"
			                className="form-control floating-label numbers"
			                style={{marginTop: '15px'}}
			                data-hint={this.props.unit}
			                placeholder="Radius"
			                defaultValue={Math.round(this.props.radius)}
			                onKeyUp={this.updateRadius}
			                ref="radius" />
		}

		return (
			<div className="map-group autocomplete-map">
				<PlacesAutocomplete
					defaultLocation={this.props.defaultLocation}
					currentLocation={this.props.location}
					onPlaceChange={this.props.onPlaceChange}
					disabled={this.props.disabled} />
	            
	            {radiusInput}
				
				<div className="form-group-default" style={{marginTop: '24px'}}>
					<EditMap 
						location={this.props.location}
						radius={this.props.radius}
						rerender={this.props.rerender}
						draggable={this.props.draggable}
						onDataChange={this.props.onMapDataChange} />
				</div>
			</div>
		);
	}
}

AutocompleteMap.defaultProps = {
	defaultLocation: null,
	unit: "Feet",
	location: null,
	radius: 250,
	hasRadius: true,
	rerender: false,
	draggable: false,
	updateRadius: function() {},
	onPlaceChange: function() {},
	onRadiusUpdate: function() {}
}