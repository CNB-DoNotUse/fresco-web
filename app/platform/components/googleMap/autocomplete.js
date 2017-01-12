import React, { PropTypes } from 'react';
import { getAddressFromLatLng } from 'app/lib/location';
import LocationAutocomplete from '../global/location-autocomplete.js';
import GoogleMap from '../googleMap';

class AutocompleteMap extends React.Component {
    state = { bounds: null };

    componentDidUpdate() {
        if (this.props.radius && this.props.hasRadius) {
            this.refs.radius.value = Math.round(this.props.radius);
        }
    }

    /**
     * Updates prop radius function
     */
    onChangeRadius() {
        const radius = parseFloat(this.refs.radius.value.replace(/^0-9/g, ''));
        // Check if a number
        if (!isNaN(radius)) {
            this.props.onRadiusUpdate(radius);
        }
    }

    onMapDataChange = ({ location, source }) => {
        getAddressFromLatLng(location)
        .then((address) => {
            this.props.onMapDataChange({ location, source, address });
        });
    }

    /**
     * Updates states bounds for other components
     */
    updateCurrentBounds = (bounds) => {
        this.setState({ bounds });
    }

    render() {
        const {
            hasRadius,
            radius,
            unit,
            address,
            disabled,
            onPlaceChange,
            location,
            rerender,
            draggable,
            onClearLocation,
        } = this.props;

        return (
            <div className="map-group autocomplete-map form-group-default">
                <div className="map-container">
                    <GoogleMap
                        address={address}
                        location={location}
                        radius={radius}
                        rerender={rerender}
                        draggable={draggable}
                        updateCurrentBounds={this.updateCurrentBounds}
                        onDataChange={this.onMapDataChange}
                    />
                </div>
            </div>
        );
    }
}

export default AutocompleteMap;
