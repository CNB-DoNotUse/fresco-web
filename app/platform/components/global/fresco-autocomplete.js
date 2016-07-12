import React from 'react';
import FrescoImage from './fresco-image';
import utils from 'utils'

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

    componentDidMount() {
        if(this.props.inputText) {
            this.refs.inputField.value = this.props.inputText;
        }

        //Click event for outside clicking
        $(document).click((e) => {
            if ($(e.target).parents('.autocomplete').size() == 0 && e.target !== this.refs.autocompleteWrap) {
                //Reset predictions for cleanup
                this.setState({
                    predictions: [],
                    active: false
                });
            }
        });
    }

    componentWillUnmount() {
        //Clean up click event on unmount
        $(document).unbind('click');
    }

    componentWillReceiveProps(nextProps) {
        //Check if the passed input text has changed
        if(nextProps.inputText !== null){
            if(nextProps.inputText !== this.state.inputText){
                this.refs.inputField.value = nextProps.inputText;

                //Reset predictions for cleanup
                this.setState({
                    predictions: [],
                    active: false
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
            return this.setState({
                predictions: [],
                active: false
            });
        }

        this.setState({
            active: true
        });

        var params = { input: query }

        this.autoCompleteService.getPlacePredictions(params, (predictions, status) => {
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
        var params = { address: query }

        if(this.props.bounds) {
            params.bounds = this.props.bounds;
        }

        this.geocoder.geocode(params, (predictions, status) => {
            if(status === google.maps.GeocoderStatus.OK && predictions[0]){
                this.setState({
                    predictions: predictions
                });
            } else {
                this.setState({
                    predictions: []
                })
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

                //Set prediciton to details result
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
                predictions: [],
                active: false
            });

            self.props.updateAutocompleteData({
                prediction: prediction,
                location: location,
                address: prediction.description || prediction.formatted_address
            });
        }
    }

    render() {
        var predictionsDropdown = '',
            autocompleteClass = '';

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

        autocompleteClass = 'autocomplete ' +  this.props.class

        if(this.state.active && this.props.transition) {
            autocompleteClass += ' active';
        }

        return (
            <div className={autocompleteClass} ref="autocompleteWrap">
                <div class="form-control-wrapper">
                    <input
                        ref="inputField"
                        type="text"
                        className={this.props.inputClass}
                        onChange={this.inputChanged}
                        disabled={this.props.disabled}
                        placeholder="Location" />
                    <span className="material-input"></span>
                </div>

                {predictionsDropdown}
            </div>
        )
    }
}

FrescoAutocomplete.defaultProps = {
    updateAutocompleteData: function () {},
    transition: true,
    class: '',
    inputClass: ''
}
