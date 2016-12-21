import React, { PropTypes } from 'react';
import isEqual from 'lodash/isEqual';
import utils from 'utils';
import api from 'app/lib/api';
import GoogleMap from '../googleMap';
import CenterMarker from '../googleMap/centerMarker';
import Circle from '../googleMap/circle';
import Marker from '../googleMap/marker';

/**
 * AssignmentMap
 * Map component for assignment detail page
 *
 * @extends {React}
 */
class AssignmentMap extends React.Component {
    static propTypes = {
        markerData: PropTypes.array,
        panTo: PropTypes.object,
        onMouseOverMarker: PropTypes.func,
        onMouseOutMarker: PropTypes.func,
        assignment: PropTypes.object,
    }

    hasFitBounds = false;

    shouldComponentUpdate(nextProps) {
        if (!isEqual(this.props.assignment.location, nextProps.assignment.location)) {
            return true;
        }

        if (this.props.markerData !== nextProps.markerData) return true;

        if (!isEqual(this.props.panTo, nextProps.panTo)) {
            return true;
        }

        return false;
    }

    componentDidUpdate() {
        if (!this.hasFitBounds) this.fitCircleBounds();
    }

    fitCircleBounds() {
        if (this.googleMap.map && this.mapCircle.circle) {
            this.hasFitBounds = true;
            this.googleMap.map.fitBounds(this.mapCircle.circle.getBounds());
        }
    }

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
            />
        ))
        .filter(m => !!m);
    }

    render() {
        const { assignment, panTo } = this.props;
        const { location: { coordinates } } = assignment;
        const dataMarkersNew = this.renderDataMarkers();
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
                        >
                            <CenterMarker />
                            <Circle
                                ref={(r) => { this.mapCircle = r; }}
                                radius={circleRadius}
                            />
                            {dataMarkersNew}
                        </GoogleMap>
                    </div>
                </div>
            </div>
        );
    }
}

export default AssignmentMap;

