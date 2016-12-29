import React, { PropTypes } from 'react';
import Marker from './marker';
import utils from 'utils';

const CenterMarker = ({
    onDragend,
    type = 'active',
    map,
    mapCenter,
    draggable = false,
}) => {
    const markerImage = {
        url: utils.assignmentImage[type],
        size: new google.maps.Size(108, 114),
        scaledSize: new google.maps.Size(36, 38),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(18, 19),
        crossOnDrag: false,
    };
    return (
        <Marker
            zIndex={3}
            position={mapCenter}
            map={map}
            mapCenter={mapCenter}
            icon={markerImage}
            draggable={draggable}
        />
    );
};

CenterMarker.propTypes = {
    onDragend: PropTypes.func,
    type: PropTypes.string,
    map: PropTypes.object,
    mapCenter: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
    }),
    draggable: PropTypes.bool,
};

export default CenterMarker;

