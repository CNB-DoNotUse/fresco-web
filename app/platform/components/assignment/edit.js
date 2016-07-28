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

        geocoder.geocode({
            location: {
                lat: data.location.lat,
                lng: data.location.lng,
            },
        },
        (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                this.setState({
                    address: results[0].formatted_address,
                    location: data.location,
                });
            }
        });
    }

    onChangeEndsAt(e) {
        this.setState({
            ends_at: e.target.value * 60 * 60 * 1000 + Date.now(),
        });
    }

    getStateFromProps(props) {
        const { assignment } = props;
        const radius = assignment.radius || 0;

        if (!assignment) return { loading: false };

        return {
            address: assignment.address,
            caption: assignment.caption,
            ends_at: assignment.ends_at,
            loading: false,
            location: assignment.location,
            radius,
            title: assignment.title,
        };
    }

    revert() {
        // Set state back to original props
        this.setState(this.getStateFromProps(this.props));
    }

    clear() {
        this.setState({
            address: null,
            caption: null,
            ends_at: null,
            location: null,
            title: null,
            radius: null,
        });
    }

    /**
     * Reverts fields to original state
     */
    cancel() {
        this.revert();
        this.props.onToggle();
    }

	/**
	 * Saves the assignment from the current values in the form
	 */
    save() {
        const { assignment, setAssignment, onToggle } = this.props;
        const { title, caption, radius, location, address, outlet, ends_at } = this.state;
        const params = {
            address,
            caption,
            radius: utils.feetToMiles(radius),
            location: utils.getGeoFromCoord(location),
            outlet: outlet ? outlet.id : null,
            now: Date.now(),
            title,
            ends_at,
        };

        if (!assignment || !assignment.id) return;

        // TODO: move to method
        if (!params.outlet) {
            $.snackbar({ content: 'An assignment must have an owner!' });
            return;
        }
        if (utils.isEmptyString(params.title)) {
            $.snackbar({ content: 'An assignment must have a title!' });
            return;
        }
        if (utils.isEmptyString(params.caption)) {
            $.snackbar({ content: 'An assignment must have a caption!' });
            return;
        }
        if (params.address === '') {
            $.snackbar({ content: 'An assignment must have a location1' });
            return;
        }
        if (!utils.isValidRadius(params.radius)) {
            $.snackbar({ content: 'Radius must be at least 250ft!' });
            return;
        }
        if (isNaN(params.ends_at) || params.ends_at === 0) {
            $.snackbar({ content: 'Expiration time must be a number greater than 0!' });
            return;
        }

        $.ajax({
            url: `api/assignment/${assignment.id}/update`,
            method: 'post',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done((res) => {
            $.snackbar({ content: 'Assignment saved!' });
            setAssignment(res);
            onToggle();
        })
        .fail(() => {
            $.snackbar({ content: 'Could not save assignment!' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    renderHeader() {
        return (
            <div className="dialog-head">
                <span className="md-type-title">Edit assignment</span>
                <span
                    className="mdi mdi-close pull-right icon toggle-edit toggler"
                    onClick={() => this.cancel()}
                />
            </div>
        );
    }

    renderBody() {
        const { title, caption, outlet, address, location, radius, ends_at } = this.state;
        const { user, updateOutlet } = this.props;

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <div className="dialog-row">
                        <input
                            type="text"
                            className="form-control floating-label"
                            placeholder="Title"
                            title="Title"
                            ref="title"
                            value={title}
                            onChange={(e) => this.setState({ title: e.target.value })}
                        />
                    </div>

                    <div className="dialog-row">
                        <textarea
                            type="text"
                            className="form-control floating-label"
                            placeholder="Caption"
                            title="Caption"
                            value={caption}
                            onChange={(e) => this.setState({ caption: e.target.value })}
                        />
                    </div>

                    {(user.rank >= utils.RANKS.CONTENT_MANAGER)
                        ? <EditOutlet outlet={outlet} updateOutlet={(o) => updateOutlet(o)} />
                        : ''
                    }

                </div>
                <div className="dialog-col col-xs-12 col-md-5">
                    <div className="dialog-row map-group">
                        <AutocompleteMap
                            address={address}
                            location={location}
                            radius={radius}
                            onRadiusUpdate={(r) => this.setState({ radius: r })}
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
                                type="text"
                                className="form-control floating-label"
                                data-hint="hours from now"
                                placeholder="Expiration time"
                                value={utils.hoursToExpiration(ends_at)}
                                onChange={(e) => this.onChangeEndsAt(e)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderFooter() {
        return (
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
        );
    }

    render() {
        const { stats, assignment, outlet } = this.props;

        return (
            <div>
                <div className="dim toggle-edit toggled" />
                <div className="edit panel panel-default toggle-edit toggled">
                    <EditStats stats={stats} assignment={assignment} outlet={outlet} />

                    <div className="col-xs-12 col-lg-9 edit-new dialog">

                        {this.renderHeader()}
                        {this.renderBody()}
                        {this.renderFooter()}
                    </div>
                </div>
            </div>
		);
    }
}

AssignmentEdit.propTypes = {
    user: PropTypes.object,
    stats: PropTypes.object,
    assignment: PropTypes.object,
    onToggle: PropTypes.func,
    setAssignment: PropTypes.func,
    updateOutlet: PropTypes.func,
};

export default AssignmentEdit;

