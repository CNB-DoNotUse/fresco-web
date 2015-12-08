import React from 'react'
import PlacesAutocomplete from '../editing/places-autocomplete'
import EditMap from '../editing/edit-map'
export default class AutocompleteMap extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var radiusInput = '';
		if(this.props.radius) {
			radiusInput = 
			            <input
			                type="text"
			                className="form-control floating-label numbers"
			                data-hint="feet"
			                placeholder="Radius"
			                defaultValue={this.props.radius}
			                onKeyUp={this.updateRadius}
			                ref="radius" />
		}

		return (
			<div className="map-group">
				<PlacesAutocomplete
					defaultLocation={this.props.defaultLocation}
					onPlaceChange={this.props.onPlaceChange}
					disabled={this.props.disabled} />
	            <input
	                type="text"
	                className="form-control floating-label numbers"
	                data-hint="feet"
	                placeholder="Radius"
	                defaultValue={this.props.radius}
	                onKeyUp={this.props.updateRadius}
	                ref="radius" />
				<div className="form-group-default">
					<EditMap 
						location={this.props.location}
						rerender={true} />
				</div>
			</div>
		);
	}
}

AutocompleteMap.defaultProps = {
	defaultLocation: '',
	location: null,
	radius: null,
	updateRadius: function() {},
	onPlaceChange: function() {}
}