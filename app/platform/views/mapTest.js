import React from 'react';
import ReactDOM from 'react-dom';
import GoogleMap from 'app/platform/components/googleMap';
import Marker from 'app/platform/components/googleMap/marker';
import CenterMarker from 'app/platform/components/googleMap/centerMarker';

ReactDOM.render(
    <GoogleMap>
        <Marker position={{ lng: -74.1, lat: 40.8 }} />
        <Marker />
        <CenterMarker />
    </GoogleMap>,
    document.getElementById('app')
);
