import React, { PropTypes } from 'react';
import utils from 'utils';
import GoogleMap from './index';
import Circle from './circle';

class RadiusMap extends React.Component {
    static propTypes = {
        radius: PropTypes.number,
        type: PropTypes.string,
        location: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }).isRequired,
        fitBoundsOnMount: PropTypes.bool,
    }

    static defaultProps = {
        radius: null,
        fitBoundsOnMount: false,
    }

    hasFitBounds = false;

    componentDidUpdate(prevProps) {
        const { radius, fitBoundsOnMount } = this.props;

        const fitBounds = fitBoundsOnMount && !this.hasFitBounds && radius;
        const radiusChanged = prevProps.radius !== radius;
        if (fitBounds || radiusChanged) {
            this.hasFitBounds = true;
            this.googleMap.map.fitBounds(this.googleCircle.circle.getBounds());
        }
    }

    renderRadiusCircle() {
        const { radius, type, location } = this.props;
        const circleOptions = {
            radius: utils.feetToMeters(radius) || 0,
            fillColor: utils.assignmentColor[type],
            fillOpacity: 0.26,
            strokeWeight: 0,
            draggable: false,
        };

        return (
            <Circle
                ref={(c) => { this.googleCircle = c; }}
                center={location}
                {...circleOptions}
            />
        );
    }

    render() {
        return (
            <GoogleMap
                ref={(r) => { this.googleMap = r; }}
                {...this.props}
            >
                {this.renderRadiusCircle()}
            </GoogleMap>
        );
    }
}

export default RadiusMap;

