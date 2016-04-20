import React from 'react'
import PlacesAutocomplete from '../editing/places-autocomplete'
import FrescoAutocomplete from '../global/fresco-autocomplete.js'
import EditMap from '../editing/edit-map'

export default class AutocompleteMap extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			bounds: null
		}

		this.updateRadius = this.updateRadius.bind(this);
		this.updateCurrentBounds = this.updateCurrentBounds.bind(this);
	}


	componentDidUpdate(prevProps, prevState) {
		if(this.props.radius && this.props.hasRadius) {
			this.refs.radius.value = Math.round(this.props.radius);
		}
	}
	
	/**
	 * Updates prop radius function
	 */
	updateRadius() {
		var radius = parseFloat(this.refs.radius.value.replace(/^0-9/g, ''));
		//Check if a number
		if(!isNaN(radius)){
			this.props.onRadiusUpdate(radius);
		}
	}

	/**
	 * Updates states bounds for other components
	 */
	updateCurrentBounds(map) {
		this.setState({
			bounds: map.getBounds()
		})
	}


	render() {
		var radiusInput = '';

		if(this.props.hasRadius) {
			radiusInput = <input
				            type="text"
				            className="form-control floating-label numbers"
				            style={{marginTop: '30px'}}
				            data-hint={this.props.unit}
				            placeholder="Radius"
				            defaultValue={Math.round(this.props.radius)}
				            onChange={this.updateRadius}
				            ref="radius" 
				        />
		}

		return (
			<div className="map-group autocomplete-map">
				<FrescoAutocomplete
					inputText={this.props.defaultLocation}
					disabled={this.props.disabled}
					bounds={this.state.bounds}
					class="form"
					inputClass="form-control floating-label"
					ref="autocomplete"
					transition={false}
					updateAutocompleteData={this.props.onPlaceChange} />
	            
	            {radiusInput}
				
				<div className="form-group-default" style={{marginTop: '24px'}}>
					<EditMap 
						location={this.props.location}
						radius={this.props.radius}
						rerender={this.props.rerender}
						draggable={this.props.draggable}
						updateCurrentBounds={this.updateCurrentBounds}
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
	hasRadius: false,
	rerender: false,
	draggable: false,
	updateRadius: function() {},
	onPlaceChange: function() {},
	onRadiusUpdate: function() {}
}