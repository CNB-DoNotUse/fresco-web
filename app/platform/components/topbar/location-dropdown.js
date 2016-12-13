import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import Dropdown from '../global/dropdown';

class LocationDropdown extends React.Component {
    static propTypes = {
        onPlaceChange: PropTypes.func,
        onMapDataChange: PropTypes.func,
        onRadiusUpdate: PropTypes.func,
        address: PropTypes.string,
        location: PropTypes.object,
        radius: PropTypes.number,
    }

    static defaultProps = {
        onMapDataChange() {},
    }

    state = { toggled: false }

    onToggled = () => {
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
                    onPlaceChange={this.props.onPlaceChange}
                    onMapDataChange={this.props.onMapDataChange}
                    onRadiusUpdate={this.props.onRadiusUpdate}
                    address={this.props.address}
                    location={this.props.location}
                    radius={this.props.radius}
                    units="feet"
                    rerender
                    draggable
                    hasRadius
                />
            </Dropdown>
        );
    }
}

export default LocationDropdown;

