import React from 'react'
import AutocompleteMap from '../global/autocomplete-map'
import Dropdown from '../global/dropdown'


export default class LocationDropdown extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			toggled: false
		}

	}

	render() {
		var dropdownBody = <AutocompleteMap
								rerender={true}
								onMapDataChange={this.props.onMapDataChange}
								location={this.props.location}
								radius={this.props.radius}
								units="miles" />

		return (
			<Dropdown inList={true} title="Location" dropdownClass={"location-search-dropdown"}>
				{dropdownBody}
			</Dropdown>
		);
	}
}

LocationDropdown.defaultProps = {
	onMapDataChange: function() {}
}