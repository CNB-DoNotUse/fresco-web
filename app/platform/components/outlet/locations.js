import React from 'react';
import utils from 'utils';
import every from 'lodash/every';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Component for managing outlet locations in the outlet settings page
 */
class Locations extends React.Component {

    state = { locations: [] }

    componentDidMount() {
        // Retreive locations
        this.loadLocations();

        //Set up autocomplete
        const autocomplete = new google.maps.places.Autocomplete(this.refs['outlet-location-input']);
        // Bind place_changed event to locationChanged
        google.maps.event.addListener(autocomplete, 'place_changed', () => {
            this.addLocation(autocomplete.getPlace());
        });
    }

    componentDidUpdate(prevProps, prevState) {
        // Need to init everytime because of the checkboxes
        $.material.init();
    }

    /**
     * Loads locations for the outlet
     */
    loadLocations() {
        //Set up session storage for location
        if(!window.sessionStorage.locations){
            window.sessionStorage.locations = JSON.stringify({
                since: Date.now()
            });
        }

        const locations = JSON.parse(window.sessionStorage.locations);

        $.ajax({
            url: '/api/outlet/locations',
            data: {
                limit: 100
                // since: locations.since //TODO
            }
        })
        .done((res) => {
            this.setState({ locations: res });
        })
        .fail((xhr, status, error) => {
            $.snackbar({
                content: utils.resolveError(error,  'We\'re unable to load your locations at the moment! Please try again in a bit.')
            });
        });
    }

    /**
     * Adds a location to the outlet's saved locations
     * @param {object} place Google Autocomplete place
     */
    addLocation(place) {
        const autocomplete = this.refs['outlet-location-input'];

        // Run checks on place and title
        if (!place || !place.geometry || !place.geometry.viewport) {
            $.snackbar({ content: utils.resolveError('ERR_UNSUPPORTED_LOCATION') });
            return;
        } else if (!autocomplete.value) {
            $.snackbar({ content: 'Please enter a valid location title' });
        }

        const params = {
            title: autocomplete.value,
            geo: {
                type: 'Polygon',
                coordinates: utils.generatePolygonFromBounds(place.geometry.viewport),
            }
        };

        $.ajax({
            method: 'post',
            url: '/api/outlet/locations/create',
            data: JSON.stringify(params),
            contentType: 'application/json',
            dataType: 'json',
        })
        .done(() => {
            // Update locations
            this.loadLocations();

            $.snackbar({ content: `Your outlet is now tracking ${autocomplete.value}!` });

            // Clear field
            autocomplete.value = '';
        })
        .fail((xhr = {}, status, err) => {
            const { responseJSON: { msg = utils.resolveError(err) } } = xhr;

            $.snackbar({ content: msg });
        });
    }

	/**
	 * Removes a location, makes API request, removes from state on success cb
     * @param {String} id ID of the outlet location
	 */
    removeLocation = (id) => (e) => {
        $.ajax({
            method: 'post',
            url: `/api/outlet/locations/${id}/delete`,
        })
        .done(() => {
            this.setState({
                locations : this.state.locations.filter((l) => (l.id !== id))
            });

            $.snackbar({ content: 'Location deleted!' });
        })
        .fail((xhr, status, error) => {
            $.snackbar({ content: 'We were unable to delete this locaiton. Please try again in a bit!' });
        });
    }

	/**
	 * Updates the notification type for the passed location id
     * @param {Object} location The location object being updated
     * @param {String} notifType [description]
	 */
    updateLocation = (notif, location = null, index = null) => (e) => {
        const singleLocation = (location !== null && index !== null);
        const url = `/api/outlet/locations/${singleLocation ? location.id : this.state.locations.map(l => l.id).join(',')}/settings/update`;

        let oldLocations = cloneDeep(this.state.locations);
        let locations = cloneDeep(this.state.locations);

        if(singleLocation) {
            locations[index]['settings'][notif] = e.target.checked;
        } else {
            locations.forEach((location) => {
                location['settings'][notif] = e.target.checked;
            });
        }

        //Set new locations, failure will set back to original state
        this.setState({ locations });

        $.ajax({
            url,
            method: 'post',
            data: { [notif]: e.target.checked },
        })
        .fail((xhr, status, error) => {
            //Set back due to failure
            this.setState({
                locations: oldLocations
            });

            $.snackbar({ content: 'We\'re unable to update your locations at the moment! Please try again in a bit.' });
        });
    }

    renderLocationList(locations) {
        if (!locations.length) {
            return <div className="outlet-locations-container" />;
        }

        return (
            <div className="outlet-locations-container">
                <ul className="outlet-locations">
                    {locations.map((location, i) => {
                        return (
                            <LocationItem
                                key={i}
                                index={i}
                                updateLocation={this.updateLocation}
                                removeLocation={this.removeLocation}
                                location={location} />
                        );
                    })}
                </ul>
            </div>
        );
    }

    render() {
        const { locations } = this.state;

        return (
            <div className="card settings-outlet-locations">
                <div className="header">
                    <span className="title">SAVED LOCATIONS</span>

                    <div className="labels">
                        <span>NOTIFICATIONS:</span>
                        <span>SMS</span>
                        <span>EMAIL</span>
                        <span>FRESCO</span>
                    </div>
                </div>

                {this.renderLocationList(locations)}

                <div className="footer">
                    <input
                        type="text"
                        ref="outlet-location-input"
                        placeholder="New location"
                    />

                    <div className="location-options">
                        <div className="checkbox check-sms">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={every(locations, 'settings.send_sms')}
                                    onChange={this.updateLocation('send_sms')} />
                            </label>
                        </div>

                        <div className="checkbox check-email">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={every(locations, 'settings.send_email')}
                                    onChange={this.updateLocation('send_email')} />
                            </label>
                        </div>

                        <div className="checkbox check-fresco">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={every(locations, 'settings.send_fresco')}
                                    onChange={this.updateLocation('send_fresco')} />
                            </label>
                        </div>
                    </div>

                    <span className="sub-title">SELECT ALL:</span>
                </div>
            </div>
        );
    }
}

/**
 * Location Item inside the parent <ul>
 */
const LocationItem = ({ location, updateLocation, removeLocation, index }) => {
    const unseen = location.unseen_count || 0;

    return (
        <li className="location">
            <div className="info">
                <a href={`/location/${location.id}`}>
                    <p className="area">{location.title}</p>

                    <span className="count">
                        {`${unseen} unseen ${utils.isPlural(unseen) ?  'items' : 'item'}`}
                    </span>
                </a>
            </div>

            <div className="location-options form-group-default">
                <span
                    onClick={removeLocation(location.id)}
                    className="remove-location mdi mdi-delete"
                />

                <div className="checkbox check-sms">
                    <label>
                        <input
                            type="checkbox"
                            checked={location.settings.send_sms}
                            onChange={updateLocation('send_sms', location, index)}
                        />
                    </label>
                </div>

                <div className="checkbox check-email">
                    <label>
                        <input
                            type="checkbox"
                            checked={location.settings.send_email}
                            onChange={updateLocation('send_email', location, index)}
                        />
                    </label>
                </div>

                <div className="checkbox check-fresco">
                    <label>
                        <input
                            type="checkbox"
                            checked={location.settings.send_fresco}
                            onChange={updateLocation('send_fresco', location, index)}
                        />
                    </label>
                </div>
            </div>
        </li>
    );
}

export default Locations;
