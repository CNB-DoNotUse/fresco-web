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
        lat: this.props.location.lat || 0,
        lng: this.props.location.lng || 0,
        source: '',
        address: this.props.location.address || '',
        radius: this.props.location.radius || 250,
    }

    componentDidMount() {
        const { location } = this.state;

        if (location && location.lat && location.lng) {
            const geocoder = new google.maps.Geocoder();

            geocoder.geocode({ location: { ...location } }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    this.setState({ address: results[0].formatted_address });
                }
            });
        }
    }

    onChange() {
        const { address, radius, lat, lng } = this.state;
        this.props.onLocationChange({ address, radius, lat, lng });
    }

    onToggled = () => {
        this.setState({ toggled: !this.state.toggled });
    }

    onMapDataChange = ({ location: { lat, lng }, source }) => {
        this.setState({ lat, lng, source }, this.onChange);
    }

    onPlaceChange = ({ location: { lat, lng }, address }) => {
        this.setState({ lat, lng, address }, this.onChange);
    }

    onRadiusUpdate = (radius) => {
        this.setState({ radius }, this.onChange);
    }

    render() {
        const { address, lat, lng, radius } = this.state;
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

