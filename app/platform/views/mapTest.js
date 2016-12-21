import React from 'react';
import ReactDOM from 'react-dom';
import GoogleMap from 'app/platform/components/googleMap';
import Marker from 'app/platform/components/googleMap/marker';
import CenterMarker from 'app/platform/components/googleMap/centerMarker';

ReactDOM.render(
    <GoogleMap>
        <CenterMarker />
    </GoogleMap>,
    document.getElementById('app')
);
