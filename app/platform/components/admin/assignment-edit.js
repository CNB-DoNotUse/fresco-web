import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import AssignmentMerge from '../assignment/assignment-merge';
import AssignmentMergeDropup from '../assignment/assignment-merge-drop-up';
import utils from 'utils';
import uniqBy from 'lodash/uniqBy';
import reject from 'lodash/reject';

/**
    Assignment Edit Sidebar used in assignment administration page
**/
class AdminAssignmentEdit extends React.Component {
    constructor(props) {
        super(props);
        const { assignment } = props;
        let radius = 0;
        let location = { lat: null, lng: null };

        if (assignment && assignment.location) {
            radius = assignment.location
                && assignment.location.radius ? assignment.location.radius : 0;
            location = {
                lat: assignment.location.coordinates ? assignment.location.coordinates[1] : null,
                lng: assignment.location.coordinates ? assignment.location.coordinates[0] : null,
            };
        }

        this.state = {
            address: null,
            radius,
            location,
            nearbyAssignments: [],
            showMergeDialog: false,
            mergeAssignment: null,
        };
    }

    componentDidMount() {
        $.material.init();
    }

    componentWillReceiveProps(nextProps) {
        const { assignment } = nextProps;

        if (this.props.assignment.id !== assignment.id) {
            if (assignment.location) {
                this.setState({
                    address: null,
                    radius: assignment.location ? assignment.location.radius : 0,
                    location: {
                        lat: assignment.location.coordinates[1],
                        lng: assignment.location.coordinates[0],
                    },
                });
            }

            this.findNearbyAssignments();
            this.refs['assignment-title'].value = assignment.title;
            this.refs['assignment-description'].value = assignment.caption;
            this.refs['assignment-expiration'].value = assignment
                ? utils.hoursToExpiration(assignment.expiration_time)
                : null;

            $(this.refs['assignment-title']).removeClass('empty');
            $(this.refs['assignment-description']).removeClass('empty');
            $(this.refs['assignment-expiration']).removeClass('empty');
        }
    }

    /**
     * Updates state map location when AutocompleteMap gives new location
     */
    onPlaceChange(place) {
        this.setState({
            address: place.address,
            location: place.location,
        }, this.findNearbyAssignments);
    }

    /**
     * Updates state map location when AutocompleteMap gives new location from drag
     */
    onMapDataChange(data) {
        if (data.source === 'markerDrag') {
            const geocoder = new google.maps.Geocoder();

            geocoder.geocode({ location: {
                lat: data.location.lat,
                lng: data.location.lng,
            } },
            (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    this.setState({
                        address: results[0].formatted_address,
                        location: data.location,
                    }, this.findNearbyAssignments);
                }
            });
        }
    }

    /**
     * Called when AutocompleteMap's radius changes.
     * @param  {int} radius Radius in feet
     */
    onRadiusUpdate(radius) {
        this.setState({ radius: utils.feetToMiles(radius) });
    }

    approve() {
        const params = {
            id: this.props.assignment.id,
            now: Date.now(),
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            address: this.state.address || undefined,
            googlemaps: this.state.address || undefined,
            radius: this.state.radius,
            lat: this.state.location.lat,
            lon: this.state.location.lng,
            // Convert to ms and current timestamp
            expiration_time: this.refs['assignment-expiration'].value * 1000 * 60 * 60 + Date.now(),
        };

        this.props.approve(params);
    }

    /**
     * Finds nearby assignments
     */
    findNearbyAssignments() {
        const { location, radius } = this.state;
        const { assignment } = this.props;
        if (!location || !location.lat || !location.lng) return;
        const geo = {
            type: 'Point',
            coordinates: [location.lat, location.lng],
        };

        $.get('/api/assignment/find', {
            radius,
            geo,
            unrated: true,
            limit: 5,
        }, (data) => {
            if (data.nearby && data.global) {
                const nearbyAssignments =
                    uniqBy(reject(data.nearby.concat(data.global), { id: assignment.id }), 'id');
                this.setState({ nearbyAssignments });
            }
        });
    }

    toggleMergeDialog() {
        const { showMergeDialog } = this.state;
        if (showMergeDialog) {
            this.setState({ showMergeDialog: !showMergeDialog, mergeAssignment: null });
        } else {
            this.setState({ showMergeDialog: !showMergeDialog });
        }
    }

    /**
     * Called when assignment-merge-menu-item is clicked
     * @param  {[type]} id ID of assignment to be merged into
     */
    selectMerge(assignment) {
        this.setState({ mergeAssignment: assignment }, this.toggleMergeDialog);
    }

    render() {
        const { loading, assignment, rejectAssignment, merge } = this.props;
        const { radius, address } = this.state;
        const defaultLocation = address || (assignment.location ? assignment.location.address : '');
        const expiration_time = assignment ? utils.hoursToExpiration(assignment.expiration_time) : null;

        return (
            <div className="dialog">
                <div className="dialog-body admin-assignment-edit" style={{ visibility: 'visible' }}>
                    <input
                        type="text"
                        className="form-control floating-label titleInput"
                        placeholder="Title"
                        ref="assignment-title"
                        defaultValue={assignment.title}
                    />

                    <textarea
                        type="text"
                        className="form-control floating-label"
                        placeholder="Description"
                        ref="assignment-description"
                        defaultValue={assignment.caption}
                    />

                    <AutocompleteMap
                        defaultLocation={defaultLocation}
                        location={this.state.location}
                        radius={Math.round(utils.milesToFeet(radius))}
                        onPlaceChange={(place) => this.onPlaceChange(place)}
                        onMapDataChange={(data) => this.onMapDataChange(data)}
                        onRadiusUpdate={(r) => this.onRadiusUpdate(r)}
                        draggable
                        rerender
                        hasRadius
                    />

                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Expiration Time"
                        data-hint="hours from now"
                        ref="assignment-expiration"
                        defaultValue={expiration_time}
                    />

                    <AssignmentMergeDropup
                        nearbyAssignments={this.state.nearbyAssignments}
                        selectMerge={(a) => this.selectMerge(a)}
                    />
                </div>

                <div className="dialog-foot">
                    <button
                        type="button"
                        className="btn btn-flat assignment-approve pull-right"
                        onClick={() => this.approve()}
                        disabled={loading}
                    >
                        Approve
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat assignment-deny pull-right"
                        onClick={() => rejectAssignment(assignment.id)}
                        disabled={loading}
                    >
                        Reject
                    </button>
                </div>

                <AssignmentMerge
                    assignment={assignment}
                    mergeAssignment={this.state.mergeAssignment}
                    toggled={this.state.showMergeDialog}
                    toggle={() => this.toggleMergeDialog()}
                    merge={merge}
                />
            </div>
        );
    }
}

AdminAssignmentEdit.propTypes = {
    assignment: PropTypes.object.isRequired,
    approve: PropTypes.func.isRequired,
    rejectAssignment: PropTypes.func.isRequired,
    merge: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default AdminAssignmentEdit;

