import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import Dropdown from '../global/dropdown';

class LocationDropdown extends React.Component {
    static propTypes = {
        onLocationChange: PropTypes.func.isRequired,
        location: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
            radius: PropTypes.number,
            address: PropTypes.string,
        }).isRequired,
    }

    state = {
        toggled: false,
    }

    onChange(data) {
        const { onLocationChange, location } = this.props;
        onLocationChange(Object.assign({}, { radius: 250}, location, data));
    }

    onToggled = () => {
        this.setState({ toggled: !this.state.toggled });
    }

    onMapDataChange = ({ location: { lat, lng }, address }) => {
        this.onChange({ lat, lng, address });
    }

    onPlaceChange = ({ location: { lat, lng }, address }) => {
        this.onChange({ lat, lng, address });
    }

    onRadiusUpdate = (radius) => {
        this.onChange({ radius });
    }

    render() {
        const { location: { address, lat, lng, radius } } = this.props;
        return (
            <Dropdown
                inList
                title="Location"
                onToggled={this.onToggled}
                dropdownClass="location-search-dropdown"
            >
                <AutocompleteMap
                    onPlaceChange={this.onPlaceChange}
                    onMapDataChange={this.onMapDataChange}
                    onRadiusUpdate={this.onRadiusUpdate}
                    address={address}
                    location={{ lat, lng }}
                    radius={radius}
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

