import React from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import Dropdown from '../global/dropdown';

class LocationDropdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            toggled: false
        };

        this.onToggled = this.onToggled.bind(this);
    }

    onToggled() {
        this.setState({ toggled: !this.state.toggled });
    }

    render() {
        return (
            <Dropdown
                inList
                title="Location"
                onToggled={this.onToggled}
                dropdownClass="location-search-dropdown"
            >
                <AutocompleteMap
                    rerender={this.state.toggled}
                    onPlaceChange={this.props.onPlaceChange}
                    onMapDataChange={this.props.onMapDataChange}
                    onRadiusUpdate={this.props.onRadiusUpdate}
                    address={this.props.defaultLocation}
                    location={this.props.location}
                    radius={this.props.radius}
                    units="feet"
                    hasRadius
                />
            </Dropdown>
        );
    }
}

LocationDropdown.defaultProps = {
    onMapDataChange() {},
};

export default LocationDropdown;
