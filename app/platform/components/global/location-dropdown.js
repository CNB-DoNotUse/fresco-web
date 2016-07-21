import React, { PropTypes } from 'react';
import utils from 'utils';
import Dropdown from './dropdown';

/**
 * Location Dropdown for saved locations
 */
class LocationDropdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = { locations: [] };
    }

    componentDidMount() {
        // Load intial locations
        this.loadLocations();
    }

    locationClicked(location) {
        if (!this.props.updateMapPlace) return;

        const polygon = location.location.coordinates[0];
        const bounds = new google.maps.LatLngBounds();

        for (let coordinate of polygon) {
            const latLng = new google.maps.LatLng(coordinate[1], coordinate[0]);
            bounds.extend(latLng);
        }

        const place = {
            geometry: {
                viewport: bounds
            },
            description: location.title
        };

        // Tell dispatch map to update
        this.props.updateMapPlace(place);
    }

	/**
	 * Adds the curret prop location to the outlet locations
	 */
    addLocation(e) {
        e.stopPropagation();
        const place = this.props.mapPlace;

        // Run checks on place and title
        if (!place || !place.geometry) {
            $.snackbar({ content: utils.resolveError('ERR_UNSUPPORTED_LOCATION') });
            return;
        }

        const params = {
            title: place.formatted_address,
            // TODO: not toggleable in ui, however should be sent up as true by default
            //   - waiting on api
            // notify_fresco: this.refs['location-fresco-check'].checked,
            // notify_email: this.refs['location-email-check'].checked,
            // notify_sms: this.refs['location-sms-check'].checked,
            geo: utils.getGeoFromCoord({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            }),
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
        })
        .fail((xhr, status, err) => {
            const { responseJSON: { error: { msg = utils.resolveError(err) } } } = xhr;
            $.snackbar({ content: msg });
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

    renderLocations() {
        const { locations } = this.state;

        if (!locations.length) {
            return <div className="dropdown-body" />;
        }

        return (
            <ul className="list">
                {
                    locations.map((location, i) => {
                        const unseenCount = location.unseen_count || 0;
                        return (
                            <li
                                className="location-item"
                                key={i}
                                onClick={() => this.locationClicked(location)}
                            >
                                <a href={'/location/' + location.id}>
                                    <span className="mdi mdi-logout-variant icon" />
                                </a>
                                <span className="area">{location.title}</span>
                                <span className="count">
                                    {utils.isPlural(unseenCount) ? unseenCount + ' unseen items' : unseenCount + ' unseen item'}
                                </span>
                            </li>
                        );
                    })
                }
            </ul>
        );
    }

    render() {
        const { inList, addLocationButton } = this.props;

        let dropdownActions = [(
            <a href="/outlet/settings" key={2}>
                <span className="mdi mdi-settings"></span>
            </a>
        )];

        if (addLocationButton) {
            dropdownActions.push(
                <span className="mdi mdi-playlist-plus" onClick={(e) => this.addLocation(e)} key={1}/>
            );
        }

        return (
            <Dropdown
                inList={inList}
                title="SAVED"
                float={false}
                dropdownClass="location-dropdown"
                dropdownActions={dropdownActions}
            >
                {this.renderLocations()}
            </Dropdown>
        );
    }
}

LocationDropdown.defaultProps = {
    inList: false,
    addLocationButton: false,
};

LocationDropdown.propTypes = {
    updateMapPlace: PropTypes.func,
    mapPlace: PropTypes.object,
    addLocationButton: PropTypes.bool,
    inList: PropTypes.bool,
};

export default LocationDropdown;
