import React, { PropTypes } from 'react';
import AutocompleteMap from '../googleMap/autocompleteMap';
import Dropdown from '../global/dropdown';

/**
 * LocationDropdown - Class for selecting location in topbar with autocompleteMap cmp
 *
 * @extends {React}
 */
class LocationDropdown extends React.Component {
    static propTypes = {
        onChangeLocation: PropTypes.func.isRequired,
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

    /**
     * onChange
     * Called whenever the cmp receives new location data via its autocompleteMap callbacks
     * Location data is then propagated to parent cmp via onChangeLocation cb
     *
     * @param {Object} data new location data
     */
    onChange(data) {
        const { onChangeLocation, location } = this.props;
        onChangeLocation(Object.assign({}, { radius: 250 }, location, data));
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

    onClearLocation = () => {
        this.onChange({ address: null, lat: null, lng: null })
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
                    onClearLocation={this.onClearLocation}
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

