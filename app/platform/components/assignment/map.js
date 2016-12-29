import React, { PropTypes } from 'react';
import isEqual from 'lodash/isEqual';
import utils from 'utils';
import api from 'app/lib/api';
import GoogleMap from '../googleMap';
import CenterMarker from '../googleMap/centerMarker';
import Circle from '../googleMap/circle';
import Marker from '../googleMap/marker';
import MarkerGroup from '../googleMap/markerGroup';

/**
 * AssignmentMap
 * Map component for assignment detail page
 *
 * @extends {React}
 */
class AssignmentMap extends React.Component {
    static propTypes = {
        markerData: PropTypes.arrayOf(PropTypes.shape({
            position: PropTypes.shape({
                lat: PropTypes.number,
                lng: PropTypes.number,
            }),
            iconUrl: PropTypes.shape({
                active: PropTypes.string,
                normal: PropTypes.string,
            }),
            id: PropTypes.string,
            active: PropTypes.bool,
        })),
        panTo: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
        onMouseOverMarker: PropTypes.func,
        onMouseOutMarker: PropTypes.func,
        assignment: PropTypes.object,
    }

    fetchedAcceptedUsers = false;
    fetchedAllUser = false;
    hasFitBounds = false;

    state = {
        users: [],
        acceptedUsers: [],
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!isEqual(this.props.assignment.location, nextProps.assignment.location)) {
            return true;
        }

        if (this.props.markerData !== nextProps.markerData) return true;

        if (!isEqual(this.props.panTo, nextProps.panTo)) {
            return true;
        }

        if (!isEqual(this.state.users, nextState.users)) {
            return true;
        }

        if (!isEqual(this.state.acceptedUsers, nextState.acceptedUsers)) {
            return true;
        }

        return false;
    }

    componentDidUpdate() {
        if (!this.hasFitBounds) this.fitCircleBounds();
    }

    onTilesLoaded = () => {
        if (!this.fetchedAllUsers) {
            this.fetchedAllUsers = true;
            this.fetchAllUsers();
        }
        if (!this.fetchedAcceptedUsers) {
            this.fetchedAcceptedUsers = true;
            this.fetchAcceptedUsers();
        }
    }

    fitCircleBounds() {
        if (this.googleMap.map && this.mapCircle.circle) {
            this.hasFitBounds = true;
            this.googleMap.map.fitBounds(this.mapCircle.circle.getBounds());
        }
    }

    /**
     * Fetches the locations of all users inside the current bounds of the map
     *
     */
    fetchAllUsers() {
        if (!this.googleMap.map) return;
        const params = {
            geo: {
                type: 'Polygon',
                coordinates: utils.generatePolygonFromBounds(this.googleMap.map.getBounds()),
            },
        };

        api
        .get('user/locations/find', params)
        .then(users => this.setState({ users }))
        .catch(res => res);
    }

    /**
     * Fetches locations of the users that have accepted this assignment
     *
     */
    fetchAcceptedUsers() {
        api
        .get('user/locations/find', { assignment_id: this.props.assignment.id })
        .then(acceptedUsers => this.setState({ acceptedUsers }))
        .catch(res => res);
    }

    /**
     * Renders user location markers
     * Shows blue markers for regular users
     * Shows green marker for users that have accepted assignment
     *
     * @returns {JSX} MarkerGroup component for user location markers
     */
    renderUserLocMarkers() {
        const { users, acceptedUsers } = this.state;
        if (!users || !users.length) return null;
        const userIcon = {
            url: '/images/assignment-user@3x.png',
            size: new google.maps.Size(30, 33),
            scaledSize: new google.maps.Size(10, 11),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(5, 5.5),
        };
        const acceptedIcon = {
            url: '/images/assignment-user-accepted@3x.png',
            size: new google.maps.Size(30, 33),
            scaledSize: new google.maps.Size(10, 11),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(5, 5.5),
        };

        const getMarkerIcon = (user) => {
            if (acceptedUsers.some(a => isEqual(a.geo, user.geo))) return acceptedIcon;
            return userIcon;
        };

        const markerData = users.map(u => ({
            position: { lng: u.geo.coordinates[0], lat: u.geo.coordinates[1] },
            icon: getMarkerIcon(u),
        }));

        return (
            <MarkerGroup
                markerData={markerData}
                draggable={false}
            />
        );
    }

    /**
     * Renders markers for each assignment photo or video
     * Marker shows type of content and location
     *
     * @returns {Array} Array of Marker cmps
     */
    renderDataMarkers() {
        const { markerData, onMouseOverMarker, onMouseOutMarker } = this.props;
        if (!markerData || !markerData.length) return null;

        const markerImage = (m, active) => ({
            url: active ? m.iconUrl.active : m.iconUrl.normal,
            size: new google.maps.Size(108, 114),
            scaledSize: new google.maps.Size(36, 38),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(18, 19),
        });

        return markerData
        .map((m, i) => (
            <Marker
                key={`marker-${i}`}
                position={m.position}
                icon={markerImage(m, false)}
                pannedIcon={markerImage(m, true)}
                panned={m.active}
                onMouseover={() => onMouseOverMarker(m.id)}
                onMouseout={() => onMouseOutMarker(m.id)}
                zIndex={m.active ? 4 : 2}
            />
        ))
        .filter(m => !!m);
    }

    render() {
        const { assignment, panTo } = this.props;
        const { location: { coordinates } } = assignment;
        const initialLocation = { lng: coordinates[0], lat: coordinates[1] };
        const circleRadius = Math.round(utils.milesToFeet(assignment.radius));

        return (
            <div className="row">
                <div className="col-sm-11 col-md-10 col-sm-offset-1">
                    <div className="assignment__map-ctr">
                        <GoogleMap
                            ref={(r) => { this.googleMap = r; }}
                            initialLocation={initialLocation}
                            zoom={13}
                            draggable={false}
                            panTo={panTo}
                            onTilesloaded={this.onTilesLoaded}
                        >
                            <CenterMarker />
                            <Circle
                                ref={(r) => { this.mapCircle = r; }}
                                radius={circleRadius}
                            />
                            {this.renderDataMarkers()}
                            {this.renderUserLocMarkers()}
                        </GoogleMap>
                    </div>
                </div>
            </div>
        );
    }
}

export default AssignmentMap;

