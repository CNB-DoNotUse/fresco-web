import React, { PropTypes } from 'react';
import utils from 'utils';

class Circle extends React.Component {
    static propTypes = {
        radius: PropTypes.number,
        type: PropTypes.string,
        map: PropTypes.object,
        mapCenter: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
    };

    static defaultProps = {
        type: 'active',
    };

    componentDidMount() {
        this.renderCircle();
    }

    componentDidUpdate(prevProps) {
        if ((this.props.map !== prevProps.map)) {
            this.renderCircle();
        }

        if (this.props.mapCenter !== prevProps.mapCenter) {
            this.circle.setCenter(this.props.mapCenter);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.radius !== nextProps.radius) {
            this.circle.setRadius(nextProps.radius || 0);
        }
    }

    renderCircle() {
        const {
            map,
            mapCenter,
            radius,
            type,
        } = this.props;

        const center = new google.maps.LatLng(mapCenter.lat, mapCenter.lng);

        const config = {
            map,
            center,
            radius: utils.feetToMeters(radius) || 0,
            fillColor: utils.assignmentColor[type],
            fillOpacity: 0.26,
            strokeWeight: 0,
            draggable: false,
        };

        this.circle = new google.maps.Circle(config);
    }

    render() {
        return null;
    }
}

export default Circle;

