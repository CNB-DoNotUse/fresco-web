import React from 'react';
import utils from 'utils';

class Locations extends React.Component {
    constructor(props) {
        super(props);
        this.state = { locations: [] };
    }

    componentDidMount() {
        // Retreive locations
        this.loadLocations();

        const autocomplete = new google.maps.places.Autocomplete(this.refs['outlet-location-input']);

        // Bind place_changed event to locationChanged
        google.maps.event.addListener(autocomplete, 'place_changed', () => {
            this.addLocation(autocomplete.getPlace());
        });
    }

    componentDidUpdate() {
        // Need to init everytime because of the fucking checkboxes
        $.material.init();
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

        const bounds = place.geometry.viewport;
        const params = {
            title: autocomplete.value,
            // notify_fresco: this.refs['location-fresco-check'].checked,
            // notify_email: this.refs['location-email-check'].checked,
            // notify_sms: this.refs['location-sms-check'].checked,
            geo: {
                type: 'Polygon',
                coordinates: utils.generatePolygonFromBounds(bounds),
            },
        };

        $.ajax({
            method: 'post',
            url: '/api/outlet/locations/create',
            data: JSON.stringify(params),
            contentType: 'application/json',
            dataType: 'json',
        })
        .done(() => {
            // Clear field
            autocomplete.value = '';
            // Update locations
            this.loadLocations();
            $.snackbar({ content: 'Location added' });
        })
        .fail((xhr = {}, status, err) => {
            const { responseJSON: { msg = utils.resolveError(err) } } = xhr;
            $.snackbar({ content: msg });
        });
    }

	/**
	 * Removes a location, makes api request, removes from state on success cb
	 */
    removeLocation(id) {
        $.ajax({
            method: 'post',
            url: `/api/outlet/locations/${id}/delete`,
        })
        .done(() => {
            const locations = this.state.locations.filter((l) => (l.id !== id));
            $.snackbar({ content: 'Location deleted' });
            this.setState({ locations });
        })
        .fail((xhr, status, error) => {
            $.snackbar({ content: utils.resolveError(error) });
        });
    }

    /**
	 * Loads locations for the outlet
	 */
    loadLocations() {
        $.ajax({ url: '/api/outlet/locations?limit=16' })
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
	 * Updates the notification type for the passed location id
	 */
    updateLocationNotifications(locationId, notifType, e) {
        // TODO: this endpoint doesnt exist in v2
        return true;
        // const { locations } = this.state;

        // // Update notification setting in state, if update fails, loadLocations will revert the check
        // const index = locations.findIndex((l) => (l.id === locationId));
        // if (index && locations[index]) {
        //     locations[index].notifications[notifType.split('_')[1]] = e.target.checked;
        //     this.setState({ locations });
        // }

        // $.ajax({
        //     url: `/api/outlet/location/${locationId}/update`,
        //     method: 'post',
        //     data: { notifType: e.target.checked },
        // })
        // .done(() => {
        //     // Run update to get latest data and update the checkboxes
        //     this.loadLocations();
        // })
        // .fail((xhr, status, error) => {
        //     $.snackbar({ content: utils.resolveError(error) });
        // });
    }

    renderLocationList() {
        const { locations } = this.state;

        if (!locations || !locations.length) return <div className="outlet-locations-container" />;

        const locationJSX = locations.map((location, i) => {
            const unseenCount = location.unseen_count || 0;
            const notifications = location.notifications || {sms: false, email: false, fresco: false};

            return (
                <li className="location" key={i}>
                    <div className="info">
                        <a href={`/location/${location.id}`}>
                            <p className="area">{location.title}</p>

                            <span className="count">
                                {utils.isPlural(unseenCount) ? unseenCount + ' unseen items' : unseenCount + ' unseen item'}
                            </span>
                        </a>
                    </div>

                    <div className="location-options form-group-default">
                        <span onClick={() => this.removeLocation(location.id)} className="remove-location mdi mdi-delete" />

                        <div className="checkbox check-sms">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notifications.sms || false}
                                    onChange={() => this.updateLocationNotifications(location.id, 'notify_sms')}
                                />
                            </label>
                        </div>

                        <div className="checkbox check-email">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notifications.email || false}
                                    onChange={() => this.updateLocationNotifications(location.id, 'notify_email')}
                                />
                            </label>
                        </div>

                        <div className="checkbox check-fresco">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notifications.fresco || false}
                                    onChange={() => this.updateLocationNotifications(location.id, 'notify_fresco')}
                                />
                            </label>
                        </div>
                    </div>
                </li>
			);
        });

        return (
            <div className="outlet-locations-container">
                <ul className="outlet-locations">
                    {locationJSX}
                </ul>
            </div>
        );
    }

    render() {
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

                {this.renderLocationList()}

                <div className="footer">
                    <input type="text" ref="outlet-location-input" placeholder="New location" />
                    <div className="location-options">
                        <div className="checkbox check-sms">
                            <label>
                                <input ref="location-sms-check" type="checkbox" />
                            </label>
                        </div>

                        <div className="checkbox check-email">
                            <label>
                                <input ref="location-email-check" type="checkbox" />
                            </label>
                        </div>

                        <div className="checkbox check-fresco">
                            <label>
                                <input ref="location-fresco-check" type="checkbox" />
                            </label>
                        </div>
                    </div>

                    <span className="sub-title">SELECT ALL:</span>
                </div>
            </div>
        );
    }
}

export default Locations;
