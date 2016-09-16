import React from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import isEqual from 'lodash/isEqual';
import 'app/sass/platform/stats';
import App from './app';
import TopBar from '../components/topbar';
import LocationAutocomplete from '../components/global/location-autocomplete.js';
import KMLInput from '../components/stats/kml-input';

/**
 * Admin Stats Page
 */
class Stats extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            count: props.count,
            coordinates: [],
            autocompleteText: ''
        }

        this.calculateUsers = this.calculateUsers.bind(this);
        this.configureMap = this.configureMap.bind(this);
        this.updateMap = this.updateMap.bind(this);
        this.updatePolygon = this.updatePolygon.bind(this);
        this.polygonChanged = this.polygonChanged.bind(this);
    }

    componentDidMount() {
        this.configureMap();
    }

    componentDidUpdate(prevProps, prevState) {
        if(!isEqual(prevState.coordinates, this.state.coordinates)) {
            this.calculateUsers();
        }
    }

    /**
     * Configures map and polygon
     */
    configureMap() {
        const mapOptions = {
            center: {lat: 40.731080, lng: -73.999365},
            zoom: 9,
            mapTypeControl: false,
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: true,
            styles: utils.mapStyles
        };

        //Instantiate google maps object
        const map = new google.maps.Map(this.refs['stat-map'], mapOptions);

        //Define intitial coords
        const paths = [
            {lat: 40.9152555, lng: -73.7002721},
            {lat: 40.4960439 , lng: -73.7002721},
            {lat: 40.496043, lng: -74.2557349}
        ];

        //Create polygon
        const polygon = new google.maps.Polygon({
            map,
            paths,
            strokeColor: '#0047bb',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#0047bb',
            fillOpacity: 0.35,
            draggable: true,
            editable: true,
            geodesic: true
        });

        google.maps.event.addListener(polygon, 'mouseup', this.polygonChanged);

        this.setState({ polygon, map });
    }

    updatePolygon(paths = []) {
        this.state.polygon.setPaths(paths);
    }

    updateMap(bounds = {}) {
        this.state.map.fitBounds(bounds);
    }

    updateCoordinates(coordinates = []) {
        this.setState({ coordinates });
    }

    /**
     * Event handler for autocomplete
     * @description Takes autocomplete data and sets polygon to state, then calculates new users
     */
    updateAutocompleteData(autocompleteData) {
        const prediction = autocompleteData.prediction;

        //Run checks on prediction and title
        if (!prediction || !prediction.geometry || !prediction.geometry.viewport){
            return $.snackbar({content: utils.resolveError('ERR_UNSUPPORTED_LOCATION')});
        }

        let bounds = prediction.geometry.viewport;
        let locationPolygon = utils.generatePolygonFromBounds(bounds)[0];
        let latLngArray = [
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng()),
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng()),
            new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getNorthEast().lng()),
            new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getSouthWest().lng()),
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng()),
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng())
        ];

        this.updateMap(bounds);
        this.updatePolygon(latLngArray);
        this.setState({
            coordinates: locationPolygon,
            autocompleteText: autocompleteData.address
        });
    }

    /**
     * Event handler from google maps polygon path change
     */
    polygonChanged(event) {
        const vertices = this.state.polygon.getPath();
        let coordinates = [];

        //Iterate over the vertices.
        for (let i =0; i < vertices.getLength(); i++) {
            const coord = vertices.getAt(i);

            coordinates.push([coord.lng(), coord.lat()]);
        }

        //Close-off end of polygon
        coordinates.push([vertices.getAt(0).lng(), vertices.getAt(0).lat()]);

        this.setState({ coordinates });
    }

    /**
     * Calculates users from coordinates ins tate
     */
    calculateUsers() {
        const data = {
            since: Date.now() - 86400000,
            geo: {
                type: 'Polygon',
                coordinates: [this.state.coordinates],
            },
        };

        api
        .get('user/locations/report', data)
        .then((res) => {
            this.setState({ count: res });
        })
        .catch(() => {
            this.setState({ count: this.props.count });
        });
    }

    render() {
        const { count } = this.state;

        return (
            <App user={this.props.user}>
                <TopBar
                    title={this.props.title} />

                <div className="container-fluid stats">
                    <div className="map-wrap">
                        <h3>You can use the polygon, autocomplete, or KML importer
                        to calculate the number of active users in an area.</h3>

                        <LocationAutocomplete
                            inputText={this.state.autocompleteText}
                            class="form"
                            inputClass="form-control floating-label"
                            ref="autocomplete"
                            transition={false}
                            updateAutocompleteData={(a) => this.updateAutocompleteData(a)} />

                        <KMLInput
                            updateCoordinates={() => this.updateCoordinates()}
                            updatePolygon={this.updatePolygon}
                            updateMap={this.updateMap} />

                        <div ref="stat-map" className="map"></div>
                    </div>

                    <div className="info-wrap">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Active in the last 24 hours</td>
                                    <td>Total Users</td>
                                </tr>
                                <tr>
                                    <td>{count.active}</td>
                                    <td>{count.total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="buttons">
                        <DownloadSubmissions />
                    </div>
                </div>
            </App>
        )
    }
}

Stats.defaultProps = {
    count: { active: 0, total: 0}
}


/**
 * Download submissions button
 */
class DownloadSubmissions extends React.Component {
    //Download submission stats through CSV middleware
    download() {
        $.snackbar({content: 'Downloading...'});
        window.location.replace("/scripts/report?u=/post/submissions/report");
    }

    render() {
        return(
            <button
                className="btn btn-flat pull-right mt12 mr16"
                onClick={this.download}>
                Download Submissions (.csv)
            </button>
        )
    }
}

ReactDOM.render(
  <Stats
    user={window.__initialProps__.user}
    title={window.__initialProps__.title} />,
    document.getElementById('app')
);
