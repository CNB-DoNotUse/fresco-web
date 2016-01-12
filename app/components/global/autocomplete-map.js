import React from 'react'
import PlacesAutocomplete from '../editing/places-autocomplete'
import EditMap from '../editing/edit-map'

export default class AutocompleteMap extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			location: null,
			radius: this.props.radius
		}

		this.onPlaceChange = this.onPlaceChange.bind(this);
		this.updateRadius = this.updateRadius.bind(this);
	}

	onPlaceChange(place) {

		this.props.onPlaceChange(place);

		this.setState({
			location: place.location
		});
	}

	updateRadius() {
		var radius = parseFloat(this.refs.radius.value);
		if(radius == 'NaN') { return }
		this.setState({
			radius: radius
		});
	}

	componentDidUpdate(prevProps, prevState) {
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
			                className="form-control floating-label numbers m-t-15 "
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
	onPlaceChange: function() {}
}