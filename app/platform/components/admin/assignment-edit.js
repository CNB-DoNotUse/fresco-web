import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import Merge from '../assignment/merge';
import MergeDropup from '../assignment/merge-dropup';
import utils from 'utils';
import isEmpty from 'lodash/isEmpty';

/**
 * AssignmentEdit
 * Reject and Approve/Update assignments
 *
 * @extends React.Component
 */
class AssignmentEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentDidMount() {
        $.material.init();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.assignment.id !== nextProps.assignment.id) {
            this.setState(this.getStateFromProps(nextProps));
            this.resetForm(nextProps.assignment);
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

    /**
     * onMergeAssignment - closes merge dialog, calls onUpdateAssignment
     *
     * @param {Number} id Id of inactive assignment being merged into active assignment
     */
    onMergeAssignment(id) {
        this.onCloseMerge();
        this.props.onUpdateAssignment(id);
    }

    /**
     * onChangeGlobal - called on global checkbox change
     * When global is checked, location and address set to null
     * When not checked, location and adress are set to original/default vals
     */
    onChangeGlobal() {
        if (this.isGlobalLocation()) {
            const { assignment: { location, address } } = this.props;
            this.setState({ location, address });
        } else {
            this.setState({ location: null, address: null });
        }
    }

    /**
     * getStateFromProps
     *
     * @param {Object} props Component props
     * @returns {Object} State object derived from component props
     */
    getStateFromProps(props) {
        const { assignment } = props;
        const radius = assignment.radius || 0;

        return {
            address: assignment.address,
            radius,
            location: assignment.location,
            showMergeDialog: false,
            mergeIntoAssignment: null,
            loading: false,
        };
    }

    isGlobalLocation() {
        return !this.state.location || isEmpty(this.state.location);
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

    /**
     * approveAssignment
     * gets form data then calls posts request to approve and update assignment
     *
     */
    approveAssignment() {
        const id = this.props.assignment.id;
        const data = {
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            address: this.state.address || undefined,
            radius: this.isGlobalLocation() ? undefined : this.state.radius,
            location: this.isGlobalLocation() ? null : utils.getGeoFromCoord(this.state.location),
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
        })
        .always(() => {
            this.setState({ loading: false });
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
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        const { assignment } = this.props;
        const {
            radius,
            address,
            location,
            showMergeDialog,
            loading,
        } = this.state;
        const expirationTime = assignment ? utils.hoursToExpiration(assignment.ends_at) : null;
        const globalLocation = this.isGlobalLocation();

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


                    <div className="checkbox check-global form-group">
                        <label>
                            <input
                                type="checkbox"
                                onChange={() => this.onChangeGlobal()}
                                checked={globalLocation}
                            />
                            Global
                        </label>
                    </div>

                    {globalLocation
                        ? ''
                        : <AutocompleteMap
                            address={address || ''}
                            location={location}
                            radius={Math.round(utils.milesToFeet(radius))}
                            onPlaceChange={(place) => this.onPlaceChange(place)}
                            onMapDataChange={(data) => this.onMapDataChange(data)}
                            onRadiusUpdate={(r) => this.onRadiusUpdate(r)}
                            draggable
                            rerender
                            hasRadius
                        />
                    }

                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Expiration Time"
                        data-hint="hours from now"
                        ref="assignment-expiration"
                        defaultValue={expirationTime}
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

                    {
                        !globalLocation
                            ? <MergeDropup
                                assignmentId={assignment.id}
                                location={location}
                                onSelectMerge={(a) => this.onSelectMerge(a)}
                            />
                            : ''
                    }
                </div>

                {showMergeDialog
                    ? <Merge
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
    onUpdateAssignment: PropTypes.func.isRequired,
};

export default AssignmentEdit;

