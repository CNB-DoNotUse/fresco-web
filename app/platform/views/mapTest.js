import React from 'react';
import ReactDOM from 'react-dom';
import GoogleMap from 'app/platform/components/googleMap';
import Marker from 'app/platform/components/googleMap/marker';

ReactDOM.render(
    <GoogleMap>
        <Marker position={{ lng: -74.1, lat: 40.8 }} />
        <Marker />
    </GoogleMap>,
    document.getElementById('app')
);
