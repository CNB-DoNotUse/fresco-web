import React, { PropTypes } from 'react';
import utils from 'utils';
import api from 'app/lib/api';
import Marker from 'react-google-maps/lib/Marker';
import GMap from '../global/gmap';

class AssignmentMap extends React.Component {
    static propTypes = {
        markerData: PropTypes.array,
        mapPanTo: PropTypes.object,
        onMouseOverMarker: PropTypes.func,
        assignment: PropTypes.object,
    }

    state = {
        users: [],
    }

    componentWillReceiveProps() {
        this.getAllUsers();
        this.getActiveUsers();
    }

    getAllUsers() {
        if (!this.gmap.map || !this.gmap.map.getBounds()) return;
        const params = {
            geo: {
                type: 'Polygon',
                coordinates: utils.generatePolygonFromBounds(this.gmap.map.getBounds()),
            },
        };

        api
        .get('user/locations/find', params)
        .then(users => this.setState({ users }))
        .catch(res => res);
    }

    getActiveUsers() {
        api
        .get(`assignment/${this.props.assignment.id}/accepted`)
        .then(activeUsers => this.setState({ activeUsers }))
        .catch(res => res);
    }

    renderUserMarkers() {
        const { users } = this.state;
        if (!users || !users.length) return null;
        const image = {
            url: '/images/assignment-user@3x.png',
            size: new google.maps.Size(30, 33),
            scaledSize: new google.maps.Size(10, 11),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(5, 5.5),
        };

        return users
        .map((u, i) => (
            <Marker
                key={`users-${i}`}
                position={{ lng: u.geo.coordinates[0], lat: u.geo.coordinates[1] }}
                icon={image}
                draggable={false}
            />
        ));
    }

    renderDataMarkers() {
        const { markerData, onMouseOverMarker } = this.props;
        if (!markerData || !markerData.length) return null;

        const markerImage = m => ({
            url: m.active ? m.iconUrl.active : m.iconUrl.normal,
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
                icon={markerImage(m)}
                zIndex={m.active ? 3 : 1}
                draggable={false}
                onMouseover={() => onMouseOverMarker(m.id)}
            />
        ))
        .filter(m => !!m);
    }

    render() {
        const { assignment, mapPanTo, onMouseOverMarker } = this.props;
        const userMarkers = this.renderUserMarkers();
        const dataMarkers = this.renderDataMarkers();

        return (
            <div className="col-sm-11 col-md-10 col-sm-offset-1 col-md-offset-2">
                <GMap
                    ref={(r) => { this.gmap = r; }}
                    location={assignment.location}
                    radius={Math.round(utils.milesToFeet(assignment.radius))}
                    containerElement={<div className="assignment__map-ctr" />}
                    zoomControl={false}
                    panTo={mapPanTo}
                    zoom={13}
                    onMouseOverMarker={onMouseOverMarker}
                    markers={[].concat(userMarkers).concat(dataMarkers)}
                    rerender
                    fitBoundsOnMount
                />
            </div>
        );
    }
}

export default AssignmentMap;

