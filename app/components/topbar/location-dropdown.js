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
								rerender={this.state.toggled}
								onMapDataChange={this.props.onMapDataChange}
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