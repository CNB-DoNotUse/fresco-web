import React from 'react'
import PlacesAutocomplete from '../editing/places-autocomplete'
import EditMap from '../editing/edit-map'

export default class AutocompleteMap extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			location: this.props.location,
			radius: this.props.radius
		}

		this.onPlaceChange = this.onPlaceChange.bind(this);
		this.updateRadius = this.updateRadius.bind(this);
	}

	/**
	 * Listener for when autocomplete is changed
	 * @param  {dictionary} place Google Map's Place
	 */
	onPlaceChange(place) {
		this.props.onPlaceChange(place);

		this.setState({
			location: place.location
		});
	}

	updateRadius() {
		var radius = parseFloat(this.refs.radius.value);
		
		//Check if a number
		if(!isNaN(radius)){
			this.setState({
				radius: radius
			});

			this.props.onRadiusUpdate(radius);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		//Check if equal
		if (JSON.stringify(prevProps.location) != JSON.stringify(this.props.location)) {
			this.setState({
				location: this.props.location,
				radius: this.props.radius
			});
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
			                defaultValue={this.props.radius}
			                onKeyUp={this.updateRadius}
			                ref="radius" />
		}

		return (
			<div className="map-group">
				<PlacesAutocomplete
					defaultLocation={this.props.defaultLocation}
					currentLocation={this.state.location}
					onPlaceChange={this.onPlaceChange}
					disabled={this.props.disabled} />
	            {radiusInput}
				<div className="form-group-default" style={{marginTop: '24px'}}>
					<EditMap 
						location={this.state.location}
						radius={this.state.radius}
						rerender={this.props.rerender}
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
	updateRadius: function() {},
	onPlaceChange: function() {},
	onRadiusUpdate: function() {}
}