import React from 'react';
import ReactDOM from 'react-dom/server';
import utils from 'utils';
import clone from 'lodash/clone';
import find from 'lodash/find';
import mapKeys from 'lodash/mapKeys';
import isEqual from 'lodash/isEqual';
import DispatchMapCallout from './dispatch-map-callout';


/**
 * Dispatch Map component
 * @description The container for the map element in the dispatch page
 */
export default class DispatchMap extends React.Component {

    constructor(props) {
        super(props);
        let lat, lng;
        if (window.sessionStorage.dispatch) {
            lat = JSON.parse(window.sessionStorage.dispatch).lat;
            lng = JSON.parse(window.sessionStorage.dispatch).lng
        }
        this.state = {
            assignments: [],
            assignmentMapItems: {},
            users: {},
            userMarkers: {},
            activeCallout: null,
            map: null,
            newAssignmentMarker: null,
            newAssignmentCircle: null,
            isOpeningCallout: false,
            initialLocale: {
                mapCenter: { lat: lat || 40.7, lng: lng || -74 },
                mapZoom: 12,
            }
        };

        // Set up session storage for location
        if ("geolocation" in navigator) {
            // THIS IS ASYNC
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                if (this.roundTwoDec(lat) !== this.roundTwoDec(this.state.initialLocale.mapCenter.lat) ||
                    this.roundTwoDec(lng) !== this.roundTwoDec(this.state.initialLocale.mapCenter.lng)) {
                    window.sessionStorage.dispatch = JSON.stringify({ lat, lng })
                    this.setupMap(12, { lat, lng })
                }
            })
        }
    }

    roundTwoDec(num) {
        return Math.round(num * 2);
    }


    componentDidMount() {
        const { initialLocale } = this.state;
        this.setupMap(initialLocale.mapZoom, initialLocale.mapCenter);
    }

    setupMap = (zoom, center) => {
        // Set up the map object
        const map = new google.maps.Map(
            document.getElementById('map-canvas'),
            {
                zoom,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP,
                },
                streetViewControl: false,
                fullscreenControl: true,
                center,
                styles: utils.mapStyles,
            }
        );

        // Add event listeners for map life cycle
        google.maps.event.addListener(map, 'idle',() => {
            this.updateMap();
            this.saveMapLocation();
        });

        this.setState({ map });
    }

    componentWillReceiveProps(nextProps) {
        //Check if there is an active assignment or the acive assignment has `changed`
        if(!this.state.isOpeningCallout && nextProps.activeAssignment){
            //No current active assignment
            if(!this.props.activeAssignment) {
                this.focusOnAssignment(nextProps.activeAssignment);
            }
            //If there is currently an active assignment and it has changed
            else if(nextProps.activeAssignment.id !== this.props.activeAssignment.id) {
                this.focusOnAssignment(nextProps.activeAssignment);
            }
        }

        //The map center has changed on the prop, telling the map to reposition
        if(JSON.stringify(nextProps.mapPlace) !== JSON.stringify(this.props.mapPlace)){
            const place = nextProps.mapPlace;

            //Check if the place has a viewport, then use that, otherwsie use the location and a regular zoom
            if(place.geometry.viewport){
                this.state.map.fitBounds(place.geometry.viewport);
            } else{
                this.state.map.panTo(place.geometry.location);
                this.state.map.setZoom(18);
            }

            this.saveMapLocation();
        }

        //Check if the map should update forcefully from the parent
        if(nextProps.shouldMapUpdate){
            this.updateMap();
            this.props.mapShouldUpdate(false); //Send back up saying the map has been updated
        }

        //Check if view mode has changed to see if the map should needs to update the assignments
        if(nextProps.viewMode !== this.props.viewMode){
            //Clear assignments and update map
            this.clearAssignments();
            //Close callout
            this.clearCallout();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        /* Event Listeners Needed in the page */
        let selector = document.getElementById('callout-selector');

        if(selector) {
            selector.addEventListener('click', (e) => {
                window.location.assign(`/assignment/${selector.dataset.id}`);
            });
        }

        const {
            newAssignmentMarker,
            newAssignmentCircle,
            map
        } = this.state;
        const { newAssignment, updateNewAssignment } = this.props;

        if (newAssignment) {
            const prevNewAssignment = prevProps.newAssignment;

            //Check if there's already a new assignment marker and a previous new assignment
            if(newAssignmentMarker && newAssignmentCircle && prevNewAssignment){
                //Compare to make sure we don't change the marker unless its position hasn't actually changed
                if(JSON.stringify(newAssignment.location) !== JSON.stringify(prevNewAssignment.location) &&
                    JSON.stringify(newAssignment.location) !== '{"lat":0,"lng":0}' ){

                    newAssignmentMarker.setPosition(newAssignment.location);
                    newAssignmentCircle.setCenter(newAssignmentMarker.getPosition());

                    map.setCenter(newAssignmentMarker.getPosition());
                }

                //Check if circle radius has changed
                if(prevNewAssignment.radius !== newAssignment.radius){
                    newAssignmentCircle.setRadius(utils.milesToMeters(newAssignment.radius));
                }
            } else {
                //None existing, so create a new marker and circle
                //Create the marker with a null position
                const newAssignmentMarker = this.createAssignmentMarker(map);
                const newAssignmentCircle = this.createCircle(map, null, 0, 'drafted', null);
                const location = {
                    lat: newAssignmentMarker.getPosition().lat(),
                    lng: newAssignmentMarker.getPosition().lng()
                };

                //Update the maps center to reflect the new positon of the marker
                if (JSON.stringify(newAssignmentMarker.getPosition()) !== '{"lat":0,"lng":0}') {
                    map.setCenter(newAssignmentMarker.getPosition());
                }

                google.maps.event.addListener(newAssignmentMarker, 'dragend', (ev) => {
                    //Send up location to the parent
                    updateNewAssignment(
                        {
                            lat: ev.latLng.lat(),
                            lng: ev.latLng.lng()
                        },
                        null,
                        map.getZoom(),
                        'markerDrag'
                    );
                });

                //Set marker to state of map so we can manage its location
                this.setState({  newAssignmentMarker, newAssignmentCircle });

                //Update the position to the parent component
                updateNewAssignment({lat: 0, lng: 0}, null, null);
            }
        } else if(prevProps.newAssignment) {
            newAssignmentMarker.setMap(null);
            newAssignmentCircle.setMap(null);
            this.setState({
                newAssignmentMarker: null,
                newAssignmentCircle: null
            });
        }
    }

    /**
     * Saves the map's current location to local storage
     * @return {[type]} [description]
     */
    saveMapLocation = () => {
        //Save new map center to storage
        window.sessionStorage.dispatch = JSON.stringify({
            mapCenter: this.state.map.getCenter(),
            mapZoom: this.state.map.getZoom()
        });
    };

    /**
     * Clears all relevant assignment data from the map and runs an update at the end
     */
    clearAssignments = () => {
        for(let key in this.state.assignmentMapItems) {
            this.state.assignmentMapItems[key]['marker'].setMap(null);
            this.state.assignmentMapItems[key]['circle'].setMap(null);
        }

        this.setState({
            assignmentMapItems: {},
            assignments: []
        });

        this.updateMap();
    };

    /**
     * Clears callout if exists
     */
    clearCallout = () => {
        if(this.state.activeCallout) {
            this.state.activeCallout.close();
            this.setState({
                activeCallout: null
            });
        }
    };

    /**
     * Updates the map with new users/assignments
     * @description Makes ajax call for both assignments and users separately
     */
    updateMap = () => {
        //Check if we have map in state or are loading
        if(!this.state.map) return;

        //Send bounds for dispatch parent state
        this.props.updateCurrentBounds(this.state.map.getBounds());

        //Get assignments
        if(!this.loadingAssignments){
            this.loadingAssignments = true;

            this.props.findAssignments(this.state.map, {}, (assignments) => {
                this.loadingAssignments = false;

                this.updateAssignmentMarkers(assignments);
            });
        }

        // Get users
        if (!this.loadingUsers){
            this.loadingUsers = true;

            this.props.findUsers(this.state.map, (users, error) => {
                this.loadingUsers = false;
                if(!users || error) return;

                // Update the user markersk
                this.updateUserMarkers(mapKeys(users, u => u.hash));
            });
        }
    };

    /**
     * Updates all assignment markers on the map, using the previously set ones to remove any repeats
     * @param {array} newAssignments List of new assignments to update
     */
    updateAssignmentMarkers = (newAssignments) => {
        let assignments = clone(this.state.assignments);
        let markersToUpdate = [];

        //Iterate backwards, because we slice as we go
        let i = newAssignments.length;
        while (i--) {
            const assignment = newAssignments[i];

            //If it exists, remove it from the new assignments
            if(find(assignments, ['id' , assignment.id]) || !assignment.location) {
                newAssignments.splice(i, 1);
            }
            //If it doesn't, push it into the list of assignments in state, and keep it in new assignments
            else {
                assignments.push(assignment);
            }
        }

        this.setState({ assignments });

        //Add cleaned assignments to the map
        this.addAssignmentsToMap(newAssignments);
    };

    /**
     * Adds passed array of assignments to the map,
     * then sets state from concatted response from `addAssignmentToMap` on each assignment
     */
    addAssignmentsToMap = (assignments) => {
        let assignmentMapItems = {};
        let circles = [];

        //Loop and add assignments to map
        assignments.forEach((assignment) => {
            //Add to object
            assignmentMapItems[assignment.id] = this.addAssignment(assignment, false);
        });

        //Update state
        this.setState({
            assignmentMapItems: Object.assign(this.state.assignmentMapItems, assignmentMapItems)
        });
    };

    /**
     * Makes a marker with the passed assignment and adds it to the map
     * @param  {Object} assignment Assignment to add
     * @param  {Bool} draggable If it should be draggable or not
     * @return {Object} Object containing marker and circle
     */
    addAssignment = (assignment, draggable) => {
        //Lat/Lng will default to center if for a created assignment
        const { map } = this.state;
        let title = assignment.title || 'No title';
        let zIndex;
        let status;
        let position = new google.maps.LatLng(
            assignment.location.coordinates[1],
            assignment.location.coordinates[0]
        );
        let radius = assignment.radius;

        //Check if the assignment is expired
        if (new Date(assignment.ends_at).getTime() < Date.now() && assignment.rating !== 0) {
            status = 'expired';
            zIndex = 100;
        } else {
            if(assignment.rating == 0) { //Assignment is pending
                status = 'pending';
                zIndex = 200;
            } else { //Assignment has 'active' or unchecked status
                status = 'active'
                zIndex = 300;
            }
        }

        //Create the rendered circle
        const circle = this.createCircle(
            map,
            position,
            utils.milesToMeters(radius),
            status
        );

        //Create the marker
        const marker = this.createAssignmentMarker(
            map,
            position,
            title,
            status,
            zIndex,
            draggable
        );

        //Add event handler to display callout when clicekd
        google.maps.event.addListener(
            marker,
            'click',
            this.focusOnAssignment.bind(null, assignment)
        );

        return { circle, marker }
    };

    /**
     * Creates a marker from passed params
     * @return {Google.Maps.Marker} A google maps marker representign the passed params
     */
    createAssignmentMarker(map, position, title, status, zIndex, draggable) {
        //Create the marker image
        const image = {
            url: status ? utils.assignmentImage[status] : utils.assignmentImage.drafted,
            size: new google.maps.Size(108, 114),
            scaledSize: new google.maps.Size(36, 38),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(18, 19)
        };

        //Default to position or center of map
        if(!position){
            position = {lat: 0, lng: 0};
        }

        return new google.maps.Marker({
            position: position,
            map: map,
            title: title || 'No title',
            icon: image,
            zIndex: zIndex || 0,
            draggable: draggable !== undefined ? draggable : true
        });
    }

    /**
     * Adds circle to the map given a center and a radius
     * @param {dictionary} center Center of the circle
     * @param {integer} radius Circle radius in meters
     * @param {Assignment status} status active/pending/expired
     * @return {Google.Maps.Circle} A google maps circle representing the passed params
     */
    createCircle(map, center, radius, status) {
        return new google.maps.Circle({
            map: map,
            center: center || map.getCenter(),
            radius: radius || 0,
            strokeWeight: 0,
            fillColor: utils.assignmentColor[status],
            fillOpacity: 0.3
        });
    }

    /**
     * Updates all the user markers on the map. Compares the passed in
     * new users, to the current state users, if there are matching users with
     * different locations, the markers on the map will be updated. Sets state at
     * the end with updated users and markers.
     * @param {newUsers} Object The new users to update the map with. Organized by the hash id
     */
    updateUserMarkers = (newUsers) => {
        let markers = clone(this.state.userMarkers);
        let currentUsers = clone(this.state.users);

        for(let key in newUsers) {
            const user = newUsers[key];
            const prevUser = currentUsers[key];

            //If the user already exists
            if(prevUser) {
                // If the location has changed, move it, otherwise do nothing
                if(!isEqual(prevUser.geo, user.geo)) {
                    // Update the marker's position
                    const marker = markers[key];
                    markers[key].setAnimation(google.maps.Animation.DROP);
                    markers[key].setPosition(new google.maps.LatLng(user.geo.coordinates[1], user.geo.coordinates[0]));
                }
            } else { //If the user doesn't exist in the new data set

                //If the marker exists, but the user doesn't, remove the marker and delete from current set
                if (markers[key]){
                    markers[key].setMap(null);
                    delete currentUsers[key];
                }

                // Add user to map
                const marker = this.createUserMarker(this.state.map, user.geo);
                //Save marker
                markers[key] = marker;
            }
        }

        //Loop through current users and remove markers if they're not
        //in the new data set
        for (let key in currentUsers) {
            //Check if the user's aren't in the new set by the key
            if (newUsers[key] == null && markers[key]) {
                markers[key].setMap(null);
                delete markers[key];
            }
        }

        this.setState({
            userMarkers: markers,
            users: newUsers,
        });
    };

    /**
     * Makes a marker for a user
     * @return a google maps marker for a user, with the passed geo-location
     */
    createUserMarker(map, geo) {
        const image = {
            url: "/images/assignment-user@3x.png",
            size: new google.maps.Size(30, 33),
            scaledSize: new google.maps.Size(10, 11),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(5, 5.5),
        };

        return new google.maps.Marker({
            position: new google.maps.LatLng(geo.coordinates[1], geo.coordinates[0]),
            map,
            icon: image,
            zIndex: 0,
            clickable: false
        });
    }

    /**
     * Focuses on the passed assignment
     * @param  {Object} assignment     Assignment focus on. Assumes assignment has Lat / Lng
     */
    focusOnAssignment = (assignment) => {
        this.setState({ isOpeningCallout: true });

        if(assignment.location == null) {
            this.setState({ isOpeningCallout: false });
            return;
        }

        const map = this.state.map;
        const lat = assignment.location.coordinates[1];
        const lng = assignment.location.coordinates[0];

        //Close the active callout if it exists yet
        if(this.state.activeCallout) this.clearCallout();

        map.panTo({ lat, lng });

        let calloutContent = ReactDOM.renderToString(
            <DispatchMapCallout assignment={assignment} />
        );

        const callout = new google.maps.InfoWindow({
            content: calloutContent,
            position: {
                lat: lat,
                lng: lng
            }
        });

        google.maps.event.addListener(callout, 'closeclick', () => {
            this.clearCallout();
        });

        callout.open(map);

        this.setState({
            activeCallout: callout,
            isOpeningCallout: false,
        });
    };

    render() {
        return (
            <div className="map-group">
                <div className="map-container full dispatch">
                    <div id="map-canvas"></div>
                </div>
            </div>
        );
    }
}

DispatchMap.defaultProps = {
    activeAssignment: {}
}
