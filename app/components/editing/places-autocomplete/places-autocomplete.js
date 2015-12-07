import React from 'react'

/**
* Reusable Google Maps Places Autocomplete
* @prop {function} onPlaceChange - Passes changed location to prop
* @prop {string} defaultLocation - Initial location address
* @prop {bool} disabled 
**/

export default class PlacesAutocomplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autocomplete: null
        }

        this.locationChanged = this.locationChanged.bind(this);

    }

    componentDidMount() {

        // Remove material input empty class
        $('.autocomplete-input').removeClass('empty');

        //  Bind autocomplete to input
        var location = new google.maps.places.Autocomplete(this.refs['autocomplete-input']);

        // Bind place_changed event to locationChanged
        google.maps.event.addListener( location, 'place_changed', this.locationChanged);

        // Add location to state for future use
        this.setState({
            autocomplete: location
        });
    }

    componentDidUpdate(prevProps, prevState) {
        // If prop location changed, update input
        if(prevProps.defaultLocation != this.props.defaultLocation) {
            this.refs['autocomplete-input'].value = this.props.defaultLocation || '';
        }
    }

    // Handle when autocomplete place changed
    locationChanged() {

        var location = this.state.autocomplete;
        if(!location.getPlace().geometry) return;

        var coord = location.getPlace().geometry.location;
        var place = location.getPlace();

        // Pass location back up
        this.props.onPlaceChange({
            place: place.name,
            location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            place_id: place.place_id
        });
    }

    render() {
        return (
            <input
                type="text"
                className="form-control floating-label google-autocomplete autocomplete-input"
                placeholder="Location"
                ref="autocomplete-input"
                defaultValue={this.props.defaultLocation}
                disabled={this.props.disabled} />
        );
    }
}

PlacesAutocomplete.defaultProps = {
    defaultLocation: null,
    onPlaceChange: function() {},
    disabled: false
}