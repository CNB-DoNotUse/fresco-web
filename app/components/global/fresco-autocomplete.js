import React from 'react';
import FrescoImage from './fresco-image';
import global from '../../../lib/global'

/**
 * Autocomplete component
 */

export default class FrescoAutocomplete extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            inputText: this.props.inputText,
            predictions: []
        }

        //Instantiate Google Maps services
        this.geocoder = new google.maps.Geocoder();
        this.autoCompleteService = new google.maps.places.AutocompleteService();
        this.placesService = new google.maps.places.PlacesService(document.createElement('span'));
       
        this.predictionSelected = this.predictionSelected.bind(this);
        this.inputChanged = this.inputChanged.bind(this);
        this.calculateCrossStreets = this.calculateCrossStreets.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        //Check if the passed input text has changed
        if(nextProps.inputText !== '' && nextProps.inputText !== null){
            if(nextProps.inputText !== this.state.inputText){
                this.refs.inputField.value = nextProps.inputText;
                this.refs.inputField.className = this.refs.inputField.className.replace(/\bactive\b/,'');
                
                //Reset predictions for cleanup
                this.setState({
                    predictions: []
                });
            }
        }
    }

    /**
     * Input event handler
     */
    inputChanged(e) {
        var field = this.refs.inputField,
            query = field.value;

        if(query == '' || query == null) {
            field.className = field.className.replace(/\bactive\b/,'');

            return this.setState({
                predictions: []
            });
        }

        if(field.className.indexOf('active') == -1)
            field.className += ' active';

        this.autoCompleteService.getPlacePredictions({ 
            input: query
        }, (predictions, status) => {
            if (status === google.maps.GeocoderStatus.OK && typeof(predictions) !== 'undefined') {
                this.setState({
                    predictions: predictions
                });
            } else {
                //Calculate cross streets if no suggestions from google maps
                return this.calculateCrossStreets(query);
            }
        });
    }

    /**
     * Calculates cross street in area using geocoder, called if no results from place suggestions
     */
    calculateCrossStreets(query) {
        this.geocoder.geocode({
            'address': query
        }, (predictions, status) => {
            if(status === google.maps.GeocoderStatus.OK && predictions[0]){
                this.setState({
                    predictions: predictions
                });
            }
        });
    }

    /**
     * OnClick for selecting a prediction from the list
     */
    predictionSelected(prediction) {
        var self = this;

        if(typeof(prediction.geometry) === 'undefined') {
            this.placesService.getDetails({
                reference: prediction.reference
            }, (details, status) => {
                //Inherit description from initial object
                details.description = prediction.description;
                prediction = details;
                
                updateAssignment();
            });
        } else {
            updateAssignment();
        }

        function updateAssignment() {
            var location = {
                lat: prediction.geometry.location.lat(),
                lng: prediction.geometry.location.lng()
            };

            self.setState({
                predictions: []
            });

            self.refs.inputField.className = self.refs.inputField.className.replace(/\bactive\b/,'');

            self.props.updateAutocompleteData({
                prediction: prediction,
                location: location
            });
        }
    }

    render() {
        var predictionsDropdown;

        if(this.state.predictions.length !== 0) {
            var predictions = this.state.predictions.map((prediction, i) => {
                var text = '';

                if(typeof(prediction.description) !== 'undefined') {
                    text = prediction.description;
                } else if(typeof(prediction.formatted_address) !== 'undefined') {
                    text = prediction.formatted_address;
                }

                return <li onClick={this.predictionSelected.bind(this, prediction)}
                            key={i} >
                            <p>{text}</p>
                        </li>
            });

            predictionsDropdown = <ul className="predictions">{predictions}</ul>
        }

        return (
            <div className="autocomplete">
                <input
                    ref="inputField"
                    type="text"
                    onChange={this.inputChanged}
                    className={this.props.type + ' fresco-autocomplete'}
                    placeholder="Location" />

                {predictionsDropdown}
            </div>
        )
    }
}

FrescoAutocomplete.defaultProps = {
    updateAutocompleteData: function () {},
    type: 'full'
}