import React, { PropTypes } from 'react';
import FrescoAutocomplete from '../global/fresco-autocomplete.js';
import GMap from './gmap';

class AutocompleteMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = { bounds: null };
        this.updateRadius = this.updateRadius.bind(this);
        this.updateCurrentBounds = this.updateCurrentBounds.bind(this);
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
    updateRadius() {
        const radius = parseFloat(this.refs.radius.value.replace(/^0-9/g, ''));
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
                <input
                    type="text"
                    className="form-control floating-label numbers"
                    style={{ marginBottom: '10px' }}
                    data-hint={unit}
                    placeholder="Radius"
                    defaultValue={Math.round(radius)}
                    onChange={this.updateRadius}
                    ref="radius"
                />
            );
        }

        return (
            <div className="map-group autocomplete-map form-group-default">
                <FrescoAutocomplete
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
                    location={location}
                    radius={radius}
                    rerender={rerender}
                    draggable={draggable}
                    updateCurrentBounds={this.updateCurrentBounds}
                    onDataChange={onMapDataChange}
                />
            </div>
        );
    }
}

AutocompleteMap.defaultProps = {
    address: '',
    unit: 'Feet',
    location: null,
    radius: 250,
    hasRadius: false,
    rerender: false,
    draggable: false,
    updateRadius() {},
    onPlaceChange() {},
    onRadiusUpdate() {},
};

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

export default AutocompleteMap;
