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
                "year" : null
            }
        }

        this.calculateUsers = this.calculateUsers.bind(this);
        this.polygonChanged = this.polygonChanged.bind(this);
        this.placeChanged = this.placeChanged.bind(this);
    }

    componentDidMount() {
        var mapOptions = {
            center: {lat: 40.731080, lng: -73.999365},
            zoom: 9,
            mapTypeControl: false,
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: true,
            styles: global.mapStyles
        };

        //Instantiate google maps object
        var map = new google.maps.Map(
            document.getElementById('stat-map'),
            mapOptions
        );

        var autocomplete = new google.maps.places.Autocomplete(this.refs['stats-autocomplete']);

        // Bind place_changed event to placeChanged
        google.maps.event.addListener( autocomplete, 'place_changed', this.placeChanged);

        //Define intitial coords
        var polyCoords = [
            {lat: 40.91525559999999, lng: -73.7002721},
            {lat: 40.4960439 , lng: -73.7002721},
            {lat: 40.496043, lng: -74.2557349} 
        ];

        //Create polygon
        var polygon = new google.maps.Polygon({
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

        this.setState({
            polygon: polygon,
            map: map,
            autocomplete: autocomplete
        });
    }

    /**
     * Event handler for autocomplete
     */
    placeChanged(event) {
        var place = this.state.autocomplete.getPlace();

        //Run checks on place and title
        if (!place || !place.geometry || !place.geometry.viewport){
            return $.snackbar({content: global.resolveError('ERR_UNSUPPORTED_LOCATION')});
        } else if(!this.refs['stats-autocomplete'].value){
            return $.snackbar({content: 'Please enter a valid location title'});
        }

        var bounds = place.geometry.viewport,
            locationPolygon = global.generatePolygonFromBounds(bounds)[0],
            latLngArray = [
                new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng()),
                new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng()),
                new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getNorthEast().lng()),
                new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getSouthWest().lng()),
                new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng()),
                new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng())
            ];

        this.calculateUsers(locationPolygon);

        this.state.map.fitBounds(bounds);
        this.state.polygon.setPaths(latLngArray);
    }

    /**
     * Event handler from google maps polygon
     */
    polygonChanged(event) {
        var vertices = this.state.polygon.getPath(),
            locations = [];

         // Iterate over the vertices.
        for (var i =0; i < vertices.getLength(); i++) {
            var coord = vertices.getAt(i);

            locations.push([coord.lng(), coord.lat()]);
        }

        //Close-off end of polygon
        var coord = vertices.getAt(0);
        locations.push([coord.lng(), coord.lat()]);

        this.calculateUsers(locations);
    }

    /**
     * Calculates users from passed polygon
     */
    calculateUsers(locations) {
        var query = '';

        for (var i = 0; i < locations.length; i++) {
            if(i > 0) query += '&';
            query += 'coordinates[]=' + locations[i][0] + ',' + locations[i][1];
        }

        var day = 86400000,
            times = [
                Date.now() - day, //day
                Date.now() - (day * 7), //one week
                Date.now() - (day * 14), //two weeks
                Date.now() - (day * 31), //one month
                Date.now() - (day * 365) //year
            ],
            timeKeys = Object.keys(this.state.counts);

        for (var i = 0; i < timeKeys.length; i++) {
            var key = timeKeys[i],
                self = this,
                newQuery = query + '&since=' + times[i];

            $.ajax({
                url: '/api/stats/user?' + newQuery,
                key: key,
                type: 'GET',
                success: function(response, status, xhr) {
                    //Do nothing, because of bad response
                    if(!response.data || response.err)
                        $.snackbar({content: global.resolveError(response.err)});
                    else {

                        var counts = _.clone(self.state.counts);

                        counts[this.key] = response.data.count;

                        self.setState({ counts : counts } );
                    }
                },
                error: (xhr, status, error) => {
                    $.snackbar({content: global.resolveError(error)});
                }
            });
        }
    }

    render() {

        var counts = this.state.counts;

        return (
            <App user={this.props.user}>
                <TopBar
                    title={this.props.title} />
                
                <div className="container-fluid stats">

                    <div className="map-wrap">
                        <h3>Drag the polygon to calculate the number of users in an area or use the autocomplete.</h3>

                        <input type="text" ref="stats-autocomplete" placeholder="Enter a location" />

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
                            </tbody>
                        </table>
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