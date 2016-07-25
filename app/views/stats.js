import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import global from '../../lib/global'
import _ from 'lodash'

/**
 * Outlet Settings page
 */

class Stats extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            "counts" : {
                "day" : null,
                "week" : null,
                "week2" : null,
                "month" : null,
                "year" : null,
                "total" : null
            }
        }

        this.downloadStats = this.downloadStats.bind(this);
        this.calculateUsers = this.calculateUsers.bind(this);
        this.polygonChanged = this.polygonChanged.bind(this);
        this.placeChanged = this.placeChanged.bind(this);
        this.kmlClicked = this.kmlClicked.bind(this);
        this.kmlFileInputChange = this.kmlFileInputChange.bind(this);
    }

    componentDidMount() {
        const mapOptions = {
            center: {lat: 40.731080, lng: -73.999365},
            zoom: 9,
            mapTypeControl: false,
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: true,
            styles: global.mapStyles
        };

        //Instantiate google maps object
        const map = new google.maps.Map(
            document.getElementById('stat-map'),
            mapOptions
        );

        const autocomplete = new google.maps.places.Autocomplete(this.refs['stats-autocomplete']);

        // Bind place_changed event to placeChanged
        google.maps.event.addListener( autocomplete, 'place_changed', this.placeChanged);

        //Define intitial coords
        const polyCoords = [
            {lat: 40.91525559999999, lng: -73.7002721},
            {lat: 40.4960439 , lng: -73.7002721},
            {lat: 40.496043, lng: -74.2557349}
        ];

        //Create polygon
        const polygon = new google.maps.Polygon({
            map: map,
            paths: polyCoords,
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

        this.setState({ polygon, map, autocomplete });
    }

    //Downloads submission stats by redirectring to API endpoint
    downloadStats() {
        $.snackbar({content: 'Downloading...'});

        window.location.replace("/api/stats/submissions");
    }

    //Click event for button that invokes file picker
    kmlClicked() {
        this.refs.kmlFileInput.click();
    }

    /**
     * File input listener
     * @description Takes inputed file and parses as KML for a location polygon
     */
    kmlFileInputChange() {
        const file = this.refs.kmlFileInput.files[0];
        const reader = new FileReader();
        const { map, polygon } = this.state;
        const self = this;

        //Check if a KML file
        if(file.name.indexOf('kml') == -1) {
            return $.snackbar({content: 'Please upload a KML file!'});
        }

        reader.onload = () => {
            //Parse KML file
            const kml = new DOMParser().parseFromString(reader.result, "text/xml");
            let pointArray = '';

            try {
                pointArray = kml
                .getElementsByTagName("Polygon")[0]
                .getElementsByTagName("outerBoundaryIs")[0]
                .getElementsByTagName("coordinates")[0]
                .innerHTML.split(" ");
            } catch(e) {
                return $.snackbar({content: 'There was an error reading this file!'});
            }

            //Map into coordinates array by parsing string
            const coordinates = pointArray.map((str) => {
                return [
                    str.substring(0, str.indexOf(',')),
                    str.substring(str.indexOf(',') + 1, str.length)
                ]
            });

            handleCoordinates(coordinates);
        };

        reader.readAsText(file);

        //Take coordinates and send to rest of component to update
        function handleCoordinates(coordinates) {
            let bounds = new google.maps.LatLngBounds();
            const latLngArray = coordinates.map((latLng) => {
                latLng = new google.maps.LatLng(latLng[1], latLng[0]);
                //Extend bounds each time
                bounds.extend(latLng);  
                return latLng;
            });

            self.calculateUsers(coordinates);
            polygon.setPaths(latLngArray);
            //Update map to bounds of polygon
            map.fitBounds(bounds);
        }
    }

    /**
     * Event handler for autocomplete
     */
    placeChanged(event) {
        const place = this.state.autocomplete.getPlace();
        const { map, polygon } = this.state;

        //Run checks on place and title
        if (!place || !place.geometry || !place.geometry.viewport){
            return $.snackbar({content: global.resolveError('ERR_UNSUPPORTED_LOCATION')});
        } else if(!this.refs['stats-autocomplete'].value){
            return $.snackbar({content: 'Please enter a valid location title'});
        }

        let bounds = place.geometry.viewport;
        let locationPolygon = global.generatePolygonFromBounds(bounds)[0];
        let latLngArray = [
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng()),
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng()),
            new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getNorthEast().lng()),
            new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getSouthWest().lng()),
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng()),
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng())
        ];

        this.calculateUsers(locationPolygon);
        map.fitBounds(bounds);
        polygon.setPaths(latLngArray);
    }

    /**
     * Event handler from google maps polygon
     */
    polygonChanged(event) {
        const vertices = this.state.polygon.getPath();
        let locations = [];

         // Iterate over the vertices.
        for (let i =0; i < vertices.getLength(); i++) {
            const coord = vertices.getAt(i);

            locations.push([coord.lng(), coord.lat()]);
        }

        //Close-off end of polygon
        const firstCoordinate = vertices.getAt(0);
        locations.push([firstCoordinate.lng(), firstCoordinate.lat()]);

        this.calculateUsers(locations);
    }

    /**
     * Calculates users from passed polygon
     */
    calculateUsers(locations) {
        const self = this;
        const day = 86400000;
        const timeKeys = Object.keys(this.state.counts);
        const times = [
            Date.now() - day, //day
            Date.now() - (day * 7), //one week
            Date.now() - (day * 14), //two weeks
            Date.now() - (day * 31), //one month
            Date.now() - (day * 365), //year
            null
        ];

        let query = '';
        let counts = _.clone(this.state.counts)

        for (let i = 0; i < locations.length; i++) {
            if(i > 0) query += '&';
            query += 'coordinates[]=' + locations[i][0] + ',' + locations[i][1];
        }

        for (let i = 0; i < timeKeys.length; i++) {
            let newQuery = query;

            if(times[i] !== null){
                newQuery += '&since=' + times[i];
            }

            $.ajax({
                url: '/api/stats/user?' + newQuery,
                key: timeKeys[i],
                type: 'GET',
                success: function(response, status, xhr) {
                    //Do nothing, because of bad response
                    if(!response.data || response.err){
                        $.snackbar({content: global.resolveError(response.err)});
                    } else {
                        counts[this.key] = response.data.count;

                        self.setState({ counts });
                    }
                },
                error: (xhr, status, error) => {
                    return $.snackbar({ content: global.resolveError(error) });
                }
            });
        }
    }

    render() {
        const { counts } = this.state;

        return (
            <App user={this.props.user}>
                <TopBar
                    title={this.props.title} />

                <div className="container-fluid stats">
                    <div className="map-wrap">
                        <h3>Drag the polygon to calculate the number of users in an area or use the autocomplete.</h3>

                        <input type="text" ref="stats-autocomplete" placeholder="Enter a location" />

                        <button 
                            className="btn btn-flat pull-right mt12 mr16 kml" 
                            onClick={this.kmlClicked}>Upload a KML file
                        </button>

                        <input 
                            onChange={this.kmlFileInputChange} 
                            type="file"
                            accept="text/kml" 
                            ref="kmlFileInput" />

                        <div id="stat-map" className="map"></div>
                    </div>

                    <div className="info-wrap">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Time Joined</td> 
                                    <td>Active (location in the last 24 hours)</td>
                                    <td>Total Users</td>
                                </tr>
                                <tr>
                                    <td>Last day</td>
                                    <td>{counts.day ? counts.day.active : null}</td>
                                    <td>{counts.day ? counts.day.total : null}</td>
                                </tr>
                                <tr>
                                    <td>Last week</td> 
                                    <td>{counts.week ? counts.week.active : null}</td>
                                    <td>{counts.week ? counts.week.total : null}</td>
                                </tr>
                                <tr>
                                    <td>Last two weeks</td>
                                    <td>{counts.week2 ? counts.week2.active : null}</td>
                                    <td>{counts.week2 ? counts.week2.total : null}</td>
                                </tr>
                                <tr>
                                    <td>Last month</td>
                                    <td>{counts.month ? counts.month.active : null}</td>
                                    <td>{counts.month ? counts.month.total : null}</td>
                                </tr>
                                <tr>
                                    <td>Last year</td>
                                    <td>{counts.year ? counts.year.active : null}</td>
                                    <td>{counts.year ? counts.year.total : null}</td>
                                </tr>
                                <tr>
                                    <td>Total</td>
                                    <td>{counts.year ? counts.year.active : null}</td>
                                    <td>{counts.year ? counts.year.total : null}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="buttons">
                        <button className="btn btn-flat pull-right mt12 mr16" onClick={this.downloadStats}>
                            Download Submissions (.csv)
                        </button>
                    </div>
                </div>
            </App>
        )
    }
}

ReactDOM.render(
  <Stats
    user={window.__initialProps__.user}
    title={window.__initialProps__.title} />,
    document.getElementById('app')
);
