import React, { PropTypes } from 'react';
import LocationAutocomplete from '../global/location-autocomplete.js';
import TextField from 'material-ui/TextField';
import GMap from './gmap';

class AutocompleteMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = { bounds: null };
    }

    componentDidMount() {
        $.material.init();
    }

    componentDidUpdate() {
        if (this.props.radius && this.props.hasRadius) {
            this.refs.radius.value = Math.round(this.props.radius);
        }
    }

    /**
     * Updates prop radius function
     */
    onChangeRadius(e) {
        const radius = parseFloat(e.value.replace(/^0-9/g, ''));
        // Check if a number
        if (!isNaN(radius)) {
            this.props.onRadiusUpdate(radius);
        }
    }

	/**
	 * Updates states bounds for other components
	 */
    updateCurrentBounds(bounds) {
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
            onMapDataChange,
        } = this.props;
        let radiusInput = '';

        if (hasRadius) {
            radiusInput = (
                <TextField
                    hintText="Radius"
                    floatingLabelText="Radius"
                    defaultValue={Math.round(radius)}
                    onChange={(e) => this.onChangeRadius(e)}
                    className="mui-text-field mui-text-field--first"
                    style={{ marginBottom: '10px' }}
                    fullWidth
                />
            );
        }

        return (
            <div className="map-group autocomplete-map form-group-default">
                <LocationAutocomplete
                    inputText={address}
                    disabled={disabled}
                    bounds={this.state.bounds}
                    class="form"
                    inputClass="form-control floating-label"
                    ref="autocomplete"
                    transition={false}
                    updateAutocompleteData={onPlaceChange}
                />

                {radiusInput}

                <GMap
                    address={address}
                    location={location}
                    radius={radius}
                    rerender={rerender}
                    draggable={draggable}
                    updateCurrentBounds={(b) => this.updateCurrentBounds(b)}
                    onDataChange={onMapDataChange}
                />
            </div>
        );
    }
}

AutocompleteMap.propTypes = {
    radius: PropTypes.number,
    unit: PropTypes.string,
    hasRadius: PropTypes.bool,
    disabled: PropTypes.bool,
    onRadiusUpdate: PropTypes.func,
    address: PropTypes.string,
    onPlaceChange: PropTypes.func,
    location: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
    rerender: PropTypes.bool,
    draggable: PropTypes.bool,
    onMapDataChange: PropTypes.func,
};

AutocompleteMap.defaultProps = {
    address: '',
    unit: 'Feet',
    location: null,
    radius: 250,
    hasRadius: false,
    rerender: false,
    draggable: false,
    onPlaceChange() {},
    onRadiusUpdate() {},
};

export default AutocompleteMap;
