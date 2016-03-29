import React from 'react'
import AutocompleteMap from '../global/autocomplete-map'
import Dropdown from '../global/dropdown'


export default class LocationDropdown extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			toggled: false
		}

		this.onToggled = this.onToggled.bind(this);
	}

	onToggled() {
		this.setState({
			toggled: !this.state.toggled
		});
	}

	render() {
		var dropdownBody = <AutocompleteMap
								rerender={this.state.toggled}
								onPlaceChange={this.props.onPlaceChange}
								onMapDataChange={this.props.onMapDataChange}
								onRadiusUpdate={this.props.onRadiusUpdate}
								defaultLocation={this.props.defaultLocation}
								location={this.props.location}
								radius={this.props.radius}
								units="miles" />

		return (
			<Dropdown
					inList={true}
					title="Location"
					onToggled={this.onToggled}
					dropdownClass={"location-search-dropdown"} >
				{dropdownBody}
			</Dropdown>
		);
	}
}

LocationDropdown.defaultProps = {
	onMapDataChange: function() {}
}