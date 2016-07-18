import React, { PropTypes } from 'react';
import utils from 'utils';
import EditStats from './edit-stats';
import EditOutlet from './edit-outlet';
import AutocompleteMap from '../global/autocomplete-map';

class AssignmentEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getStateFromProps(props);
    }

    /**
     * Updates state map location when AutocompleteMap gives new location
     */
    onPlaceChange(place) {
        this.setState({ address: place.address, location: place.location });
    }

    /**
     * Listener if the google map's data changes i.e. marker moves
     */
    onMapDataChange(data) {
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
        };
    }

    revert() {
        this.refs.title.value = this.props.assignment.title;
        this.refs.caption.value = this.props.assignment.caption;
        // Set state back to original props
        this.setState(this.getStateFromProps(this.props));
    }

    clear() {
        this.refs.title.value = '';
        this.refs.caption.value = '';
        this.refs.expiration.value = '';
        this.setState({
            address: null,
            radius: null,
            location: null,
        });
    }

    updateRadius(radius) {
        this.setState({ radius });
    }

	/**
	 * Saves the assignment from the current values in the form
	 */
    save() {
        const params = {
            id: this.props.assignment.id,
            title: this.refs.title.value,
            caption: this.refs.caption.value,
            radius: utils.feetToMiles(this.state.radius),
            location: utils.getGeoFromCoord(this.state.location),
            address: this.state.address,
            outlet: this.state.outlet ? this.state.outlet.id : null,
            now: Date.now(),
            // Convert to milliseconds
            expiration_time: this.refs.expiration.value * 60 * 60 * 1000 + Date.now(),
        };

        if (!params.outlet) {
            return $.snackbar({ content: 'An assignment must have an owner!' });
        }
        if (utils.isEmptyString(params.title)){
            return $.snackbar({ content: 'An assignment must have a title!' });
        }
        if (utils.isEmptyString(params.caption)){
            return $.snackbar({ content: 'An assignment must have a caption!' });
        }
        if (params.address === ''){
            return $.snackbar({ content: 'An assignment must have a location1' });
        }
        if (!utils.isValidRadius(params.radius)){
            return $.snackbar({ content: 'Radius must be at least 250ft!' });
        }
        if (isNaN(params.expiration_time) || params.expiration_time == 0){
            return $.snackbar({ content: 'Expiration time must be a number greater than 0!' });
        }

        return $.post('/api/assignment/update', params, (response) => {
            if(response.err) {
                $.snackbar({ content: 'Could not save assignment!' });
            } else {
                $.snackbar({ content: 'Assignment saved!' });
                this.props.setAssignment(response.data);
                this.props.toggle();
            }
        });
    }

    /**
     * Reverts fields to original state
     */
    cancel() {
        this.revert();
        this.props.toggle();
    }

    render() {
        const { user, toggled, stats, assignment, outlet, updateOutlet } = this.props;
        const toggledText = toggled ? ' toggled' : '';

        return (
            <div>
                <div className={'dim toggle-edit ' + toggledText} />
                <div className={'edit panel panel-default toggle-edit' + toggledText}>
                    <EditStats
                        stats={stats}
                        assignment={assignment}
                        outlet={outlet}
                    />

                    <div className="col-xs-12 col-lg-9 edit-new dialog">
                        <div className="dialog-head">
                            <span className="md-type-title">Edit assignment</span>
                            <span
                                className="mdi mdi-close pull-right icon toggle-edit toggler"
                                onClick={() => this.cancel()}
                            />
                        </div>

                        <div className="dialog-foot">
                            <button
                                id="story-edit-revert"
                                type="button"
                                className="btn btn-flat"
                                onClick={() => this.revert()}
                            >
                                Revert changes
                            </button>
                            <button
                                id="story-edit-clear"
                                type="button"
                                className="btn btn-flat"
                                onClick={() => this.clear()}
                            >
                                Clear all
                            </button>
                            <button
                                id="story-edit-save"
                                type="button"
                                className="btn btn-flat pull-right"
                                onClick={() => this.save()}
                            >
                                Save
                            </button>
                            <button
                                id="story-edit-discard"
                                type="button"
                                className="btn btn-flat pull-right toggle-edit toggler"
                                onClick={() => this.cancel()}
                            >
                                Discard
                            </button>
                        </div>

                        <div className="dialog-body">
                            <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                                <div className="dialog-row">
                                    <input
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Title"
                                        title="Title"
                                        ref="title"
                                        defaultValue={assignment.title}
                                    />
                                </div>

                                <div className="dialog-row">
                                    <textarea
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                        title="Caption"
                                        ref="caption"
                                        defaultValue={assignment.caption}
                                    />
                                </div>

                                {
                                    (user.rank >= utils.RANKS.CONTENT_MANAGER)
                                        ? <EditOutlet outlet={outlet} updateOutlet={(o) => updateOutlet(o)} />
                                        : ''
                                }

                            </div>
                            <div className="dialog-col col-xs-12 col-md-5">
                                <div className="dialog-row map-group">
                                    <AutocompleteMap
                                        defaultLocation={this.state.address}
                                        location={this.state.location}
                                        radius={this.state.radius}
                                        onRadiusUpdate={(r) => this.updateRadius(r)}
                                        onPlaceChange={(p) => this.onPlaceChange(p)}
                                        onMapDataChange={(d) => this.onMapDataChange(d)}
                                        draggable
                                        rerender
                                        hasRadius
                                    />
                                </div>

                                <div className="dialog-row">
                                    <div className="form-group-default">
                                        <input
                                            ref="expiration"
                                            type="text"
                                            className="form-control floating-label"
                                            data-hint="hours from now"
                                            placeholder="Expiration time"
                                            defaultValue={utils.hoursToExpiration(assignment.expiration_time)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		);
    }
}

AssignmentEdit.defaultProps = {
    toggled: false,
};

AssignmentEdit.propTypes = {
    user: PropTypes.object,
    toggled: PropTypes.bool,
    stats: PropTypes.object,
    assignment: PropTypes.object,
    togglet: PropTypes.func,
};

export default AssignmentEdit;

