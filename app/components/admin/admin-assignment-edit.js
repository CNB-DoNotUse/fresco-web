import global from '../../../lib/global';
import React from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import AssignmentMerge from '../assignment/assignment-merge';

/**
    Assignment Edit Sidebar used in assignment administration page
**/
export default class AdminAssignmentEdit extends React.Component {
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
            mergeDialogToggled: false,
            assignmentToMergeInto: null,
        };

        this.pending = false;
        this.onPlaceChange = this.onPlaceChange.bind(this);
        this.onRadiusUpdate = this.onRadiusUpdate.bind(this);
        this.onMapDataChange = this.onMapDataChange.bind(this);
        this.findNearbyAssignments = this.findNearbyAssignments.bind(this);
        this.toggleMergeDialog = this.toggleMergeDialog.bind(this);
        this.approve = this.approve.bind(this);
        this.reject = this.reject.bind(this);
        this.selectMerge = this.selectMerge.bind(this);
        // this.merge = this.merge.bind(this);
    }

    componentDidMount() {
        $.material.init();
    }

    componentWillReceiveProps(nextProps) {
        const assignment = nextProps.assignment;
        if (this.props.assignment.id != assignment.id) {
            this.setState({
                address: null,
                radius: assignment.location ? assignment.location.radius : 0,
                location: {
                    lat: assignment.location.coordinates[1],
                    lng: assignment.location.coordinates[0],
                },
            });

            // this.findNearbyAssignments();
            this.refs['assignment-title'].value = assignment.title;
            this.refs['assignment-description'].value = assignment.caption;
            this.refs['assignment-expiration'].value = assignment ? global.hoursToExpiration(assignment.expiration_time) : null;

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
        });
    }

    /**
     * Updates state map location when AutocompleteMap gives new location from drag
     */
    onMapDataChange(data) {
        if(data.source == 'markerDrag') {
            const geocoder = new google.maps.Geocoder();

            geocoder.geocode({'location': {
                lat: data.location.lat,
                lng: data.location.lng,
            }}, (results, status) => {

                if(status === google.maps.GeocoderStatus.OK && results[0]) {
                    this.setState({
                        address: results[0].formatted_address,
                        location: data.location
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
        this.setState({
            radius: global.feetToMiles(radius)
        });
    }

    /**
     * Finds nearby assignments
     */
    findNearbyAssignments(data) {
        if(!this.props.assignment || !this.props.assignment.caption || !this.props.assignment.location || !this.props.assignment.location) return;

        let assignment = this.props.assignment;

        $.get('/api/assignment/find', {
            active: true,
            radius: assignment.location.radius,
            unpack: false,
            lat: assignment.location.coordinates[1],
            lon: assignment.location.coordinates[0]
        }, (assignments) => {
            this.setState({
                nearbyAssignments: assignments.data.slice(0, 5)
            });
        });
    }

    approve() {
        this.pending = true;

        $.post('/api/assignment/approve',
        {
            id: this.props.assignment.id,
            now: Date.now(),
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            address: this.state.address || undefined,
            googlemaps: this.state.address || undefined,
            radius: this.state.radius,
            lat: this.state.location.lat,
            lon: this.state.location.lng,
            expiration_time: this.refs['assignment-expiration'].value * 1000 * 60 * 60 + Date.now() //Convert to ms and current timestamp
        }, (data) => {
            this.pending = false;
            if(data.err) {
                $.snackbar({
                    content: 'Could not approve assignment!'
                });
            } else {
                this.props.updateAssignment(this.props.assignment.id);
                $.snackbar({
                    content: 'Assignment Approved!'
                });
            }
        });

    }

    reject() {
        this.pending = true;
        $.post('/api/assignment/deny', {
            id: this.props.assignment.id
        }, (data) => {
            this.pending = false;
            this.props.updateAssignment(this.props.assignment.id);
            if(data.err) {
                $.snackbar({
                    content: 'Could not reject assignment!'
                });
            } else {
                $.snackbar({
                    content: 'Assignment Rejected!'
                });
            }
        })
    }

    toggleMergeDialog() {
        let changedState = {
            mergeDialogToggled: !this.state.mergeDialogToggled
        };

        if(this.state.mergeDialogToggled) {
            changedState.assignmentToMergeInto = null;
        }

        this.setState(changedState);
    }

    /**
     * Called when assignment-merge-menu-item is clicked
     * @param  {[type]} id ID of assignment to be merged into
     */
    selectMerge(id) {
        $.get('/api/assignment/get', {id: id}, (assignment) => {
            if(assignment.err) return $.snackbar({ content: 'Error retrieving assignment to merge' });
            this.setState({
                assignmentToMergeInto: assignment.data
            });
            this.toggleMergeDialog();
        });
    }

    /**
     * Merges assignment into existing assignment
     * @param  {Object} data
     * @param  {String} data.title
     * @param  {String} data.caption
     * @param  {String} data.assignmentToMergeInto
     * @param  {String} data.assignmentToDelete
     */
    merge(data) {
        $.post('/api/assignment/merge', data, (resp) => {
            this.toggleMergeDialog();
            this.props.updateAssignment(data.assignmentToDelete);
            $.snackbar({ content: 'Assignment successfully merged!' });
        });
    }

    render() {

        var radius = Math.round(global.milesToFeet(this.state.radius)),
            address = this.state.address ? this.state.address : this.props.assignment.location ? this.props.assignment.location.address : '',
            expiration_time = this.props.assignment ? global.hoursToExpiration(this.props.assignment.expiration_time) : null;
        /**
         *  Merge button
                    <AssignmentMergeDropup
                        nearbyAssignments={this.state.nearbyAssignments}
                        selectMerge={this.selectMerge} />
         */

        return (
            <div className="dialog">
                <div className="dialog-body admin-assignment-edit" style={{visibility: 'visible'}}>
                    <input
                        type="text"
                        className="form-control floating-label titleInput"
                        placeholder="Title"
                        ref="assignment-title"
                        defaultValue={this.props.assignment.title} />

                    <textarea
                        type="text"
                        className="form-control floating-label"
                        placeholder="Description"
                        ref="assignment-description"
                        defaultValue={this.props.assignment.caption}></textarea>

                    <AutocompleteMap
                        defaultLocation={address}
                        location={this.state.location}
                        radius={radius}
                        onPlaceChange={this.onPlaceChange}
                        onMapDataChange={this.onMapDataChange}
                        onRadiusUpdate={this.onRadiusUpdate}
                        draggable={true}
                        rerender={true}
                        hasRadius={true} />

                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Expiration Time"
                        data-hint="hours from now"
                        ref="assignment-expiration"
                        style={{marginTop: '30px'}}
                        defaultValue={expiration_time} />
                </div>

                <div className="dialog-foot">
                    <button type="button" className="btn btn-flat assignment-approve pull-right" onClick={this.approve} disabled={this.isPending}> Approve</button>
                    <button type="button" className="btn btn-flat assignment-deny pull-right" onClick={this.reject} disabled={this.isPending}> Reject</button>
                </div>

                <AssignmentMerge
                    assignment={this.props.assignment}
                    assignmentToMergeInto={this.state.assignmentToMergeInto}
                    toggled={this.state.mergeDialogToggled}
                    toggle={this.toggleMergeDialog}
                    merge={this.merge}
                />
            </div>
        );
    }

}

