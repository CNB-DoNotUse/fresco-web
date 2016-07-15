import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import AssignmentMerge from './assignment-merge';
import AssignmentMergeDropup from './assignment-merge-drop-up';
import utils from 'utils';
import uniqBy from 'lodash/uniqBy';
import reject from 'lodash/reject';

/**
    Assignment Edit Sidebar used in assignment administration page
**/
class AssignmentEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentDidMount() {
        $.material.init();
        this.findNearbyAssignments();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.assignment.id !== nextProps.assignment.id) {
            this.setState(this.getStateFromProps(nextProps));
            this.resetForm(nextProps.assignment);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.location !== prevState.location) {
            this.findNearbyAssignments();
        }
    }

    /**
     * Updates state map location when AutocompleteMap gives new location
     */
    onPlaceChange(place) {
        this.setState({ address: place.address, location: place.location });
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
                    });
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

    onCloseMerge() {
        this.setState({ showMergeDialog: false, mergeIntoAssignment: null });
    }

    /**
     * Called when assignment-merge-menu-item is clicked
     * @param  {[type]} id ID of assignment to be merged into
     */
    onSelectMerge(assignment) {
        this.setState({ mergeIntoAssignment: assignment, showMergeDialog: true });
    }

    onMergeAssignment(id) {
        this.onCloseMerge();
        this.props.onUpdateAssignment(id);
    }

    getStateFromProps(props) {
        const { assignment } = props;
        const radius = assignment.radius || 0;
        let location = { lat: 40.7, lng: -74 };

        if (assignment && assignment.location) {
            location = {
                lat: assignment.location.coordinates ? assignment.location.coordinates[1] : null,
                lng: assignment.location.coordinates ? assignment.location.coordinates[0] : null,
            };
        }

        return {
            address: assignment.address,
            radius,
            location,
            nearbyAssignments: [],
            showMergeDialog: false,
            mergeIntoAssignment: null,
        };
    }

    resetForm(assignment) {
        this.refs['assignment-title'].value = assignment.title;
        this.refs['assignment-description'].value = assignment.caption;
        this.refs['assignment-expiration'].value = assignment
            ? utils.hoursToExpiration(assignment.ends_at)
            : null;

        $(this.refs['assignment-title']).removeClass('empty');
        $(this.refs['assignment-description']).removeClass('empty');
        $(this.refs['assignment-expiration']).removeClass('empty');
    }

    approveAssignment() {
        const id = this.props.assignment.id;
        const data = {
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            address: this.state.address || undefined,
            radius: this.state.radius,
            location: utils.getGeoFromCoord(this.state.location),
            // Convert to ms and current timestamp
            ends_at: this.refs['assignment-expiration'].value * 1000 * 60 * 60 + Date.now(),
        };

        if (!id) return;
        this.setState({ loading: true });

        $.ajax({
            method: 'POST',
            url: `/api/assignment/${id}/approve`,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
        })
        .done(() => {
            this.props.onUpdateAssignment(id);
            this.setState({ loading: false });
            $.snackbar({ content: 'Assignment Approved!' });
        })
        .fail(() => {
            $.snackbar({ content: 'Could not approve assignment!' });
        });
    }

    rejectAssignment(id) {
        if (!id) return;
        this.setState({ loading: true });

        $.ajax({
            type: 'POST',
            url: `/api/assignment/${id}/reject`,
        })
        .done(() => {
            $.snackbar({ content: 'Assignment Rejected!' });
            this.props.onUpdateAssignment(id);
            this.setState({ loading: false });
        })
        .fail(() => {
            $.snackbar({ content: 'Could not reject assignment!' });
        });
    }

    /**
     * Finds nearby assignments
     */
    findNearbyAssignments() {
        const { location } = this.state;
        const { assignment } = this.props;
        if (!location || !location.lat || !location.lng) return;

        $.get('/api/assignment/find', {
            radius: 1,
            geo: utils.getGeoFromCoord(location),
            limit: 5,
        }, (data) => {
            if (data.nearby && data.global) {
                this.setState({
                    nearbyAssignments: uniqBy(
                        reject(data.nearby.concat(data.global), { id: assignment.id }),
                        'id'
                    ),
                });
            }
        });
    }

    render() {
        const { loading, assignment } = this.props;
        const {
            radius,
            address,
            nearbyAssignments,
            location,
            showMergeDialog,
        } = this.state;
        const defaultLocation = address || '';
        const expirationTime = assignment ? utils.hoursToExpiration(assignment.ends_at) : null;

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
                        location={location}
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
                        defaultValue={expirationTime}
                    />

                    <AssignmentMergeDropup
                        nearbyAssignments={nearbyAssignments}
                        onSelectMerge={(a) => this.onSelectMerge(a)}
                    />
                </div>

                <div className="dialog-foot">
                    <button
                        type="button"
                        className="btn btn-flat assignment-approve pull-right"
                        onClick={() => this.approveAssignment()}
                        disabled={loading}
                    >
                        Approve
                    </button>
                    <button
                        type="button"
                        className="btn btn-flat assignment-deny pull-right"
                        onClick={() => this.rejectAssignment(assignment.id)}
                        disabled={loading}
                    >
                        Reject
                    </button>
                </div>

                {showMergeDialog
                    ? <AssignmentMerge
                        assignment={assignment}
                        mergeIntoAssignment={this.state.mergeIntoAssignment}
                        onClose={() => this.onCloseMerge()}
                        onMergeAssignment={(id) => this.onMergeAssignment(id)}
                    />
                    : ''
                }
            </div>
        );
    }
}

AssignmentEdit.propTypes = {
    assignment: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    onUpdateAssignment: PropTypes.func.isRequired,
};

export default AssignmentEdit;

