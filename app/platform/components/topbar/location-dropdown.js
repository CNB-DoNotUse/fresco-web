import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import Dropdown from '../global/dropdown';

class LocationDropdown extends React.Component {
    static propTypes = {
        onLocationChange: PropTypes.func.isRequired,
        location: PropTypes.object,
    }

    state = {
        toggled: false,
        coordinates: this.props.location.coordinates || {},
        source: '',
        address: this.props.location.address || '',
        radius: this.props.location.radius || 0,
    }

    componentDidMount() {
        const { location } = this.state;

        if (location.lat && location.lng) {
            const geocoder = new google.maps.Geocoder();

            geocoder.geocode({ location: { ...location } }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    this.setState({ address: results[0].formatted_address });
                }
            });
        }
    }

    componentDidUpdate() {
        const { address, radius, coordinates } = this.state;
        this.props.onLocationChange({ address, radius, coordinates });
    }

    onToggled = () => {
        this.setState({ toggled: !this.state.toggled });
    }

    onMapDataChange = ({ coordinates, source }) => {
        this.setState({ coordinates, source });
    }

    onPlaceChange = ({ address, coordinates }) => {
        this.setState({ address, coordinates });
    }

    onRadiusUpdate = (radius) => {
        this.setState({ radius });
    }

    render() {
        const { address, coordinates, radius } = this.state;
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
                    location={coordinates}
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

