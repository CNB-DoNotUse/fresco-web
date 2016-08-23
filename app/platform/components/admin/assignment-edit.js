import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import Merge from '../assignment/merge';
import MergeDropup from '../assignment/merge-dropup';
import utils from 'utils';
import { getAddressFromLatLng } from 'app/lib/location';
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
        };
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
            getAddressFromLatLng(data.location, (address) => {
                this.setState({
                    address,
                    location: data.location,
                });
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
        this.setState({ showMergeDialog: false, assignmentToMergeInto: null });
    }

    /**
     * Called when assignment-merge-menu-item is clicked
     * @param  {[type]} id ID of assignment to be merged into
     */
    onSelectMerge(assignmentToMergeInto) {
        this.setState({ assignmentToMergeInto, showMergeDialog: true });
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
            this.setState({ location: location || { lat: 40.7, lng: -74 }, address });
        } else {
            this.setState({ location: null, address: null });
        }
    }

    onApproveAssignment() {
        const { assignment } = this.props;
        const { location, address, radius } = this.state;
        const geo = location && location.hasOwnProperty('type')
            ? location
            : utils.getGeoFromCoord(location);

        const params = {
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            address: address || undefined,
            radius: this.isGlobalLocation() ? undefined : radius,
            location: this.isGlobalLocation() ? null : geo,
            // Convert to ms and current timestamp
            ends_at: this.refs['assignment-expiration'].value * 1000 * 60 * 60 + Date.now(),
        };

        this.approveAssignment(assignment.id, params);
    }

    /**
     * approveAssignment
     * gets form data then calls posts request to approve and update assignment
     *
     */
    approveAssignment(id, params) {
        if (!id || !params || this.state.loading) return;
        const { onUpdateAssignment } = this.props;
        this.setState({ loading: true });

        $.ajax({
            method: 'post',
            url: `/api/assignment/${id}/approve`,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(params),
        })
        .done(() => {
            onUpdateAssignment(id);
            $.snackbar({ content: 'Assignment approved! Click to open!', timeout: 5000 })
                .click(() => { window.open(`/assignment/${id}`); });
        })
        .fail(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Could not approve assignment!' });
        });
    }

    rejectAssignment(id) {
        if (!id) return;
        this.setState({ loading: true });
        const { onUpdateAssignment } = this.props;

        $.ajax({
            method: 'post',
            url: `/api/assignment/${id}/reject`,
        })
        .done(() => {
            $.snackbar({ content: 'Assignment Rejected!' });
            onUpdateAssignment(id);
        })
        .fail(() => {
            this.setState({ loading: false });
            $.snackbar({ content: 'Could not reject assignment!' });
        });
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


                    <div className="checkbox form-group">
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
                        onClick={() => this.onApproveAssignment()}
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

                    {!globalLocation
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
                        assignmentToMergeInto={this.state.assignmentToMergeInto}
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

