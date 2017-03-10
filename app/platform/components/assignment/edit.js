import React, { PropTypes } from 'react';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import utils from 'utils';
import ChipInput from '../global/chip-input';
import AutocompleteMap from '../global/autocomplete-map';
import Merge from './merge';
import MergeDropup from './merge-dropup';

export default class AssignmentEdit extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        assignment: PropTypes.object,
        onToggle: PropTypes.func,
        save: PropTypes.func,
        loading: PropTypes.bool,
        visible: PropTypes.bool.isRequired,
    };

    state = this.getStateFromProps(this.props);

    getStateFromProps(props) {
        const { assignment } = props;
        const radius = assignment.radius || 0;

        if (!assignment) return {};

        return {
            address: assignment.address,
            caption: assignment.caption,
            isAcceptable: assignment.is_acceptable,
            endsAt: moment(assignment.ends_at).valueOf(),
            location: assignment.location,
            radius,
            title: assignment.title,
            outlets: assignment.outlets,
            showMergeDialog: false,
        };
    }

    componentDidMount() {
        $.material.init();
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
        if (data.source === 'markerDrag') this.setState(data);
    }

    onChangeEndsAt(e) {
        this.setState({ endsAt: moment().add(e.target.value, 'h').valueOf() });
    }

    /**
     * Called when AutocompleteMap's radius changes.
     * @param  {int} radius Radius in feet
     */
    onRadiusUpdate(radius) {
        this.setState({ radius: utils.feetToMiles(radius) });
    }

    /**
     * onChangeGlobal - called on global checkbox change
     * When global is checked, location and address set to null
     * When not checked, location and adress are set to original/default vals
     */
    onChangeGlobal = () => {
        if (this.isGlobalLocation()) {
            const { assignment: { location, address } } = this.props;
            this.setState({ location: location || { lat: 40.7, lng: -74 }, address });
        } else {
            this.setState({ location: null, address: null });
        }
    };

    /**
     * Saves the assignment from the current values in the form
     */
    onSave() {
        const { assignment, save, loading } = this.props;
        const {
            title,
            caption,
            radius,
            location,
            address,
            endsAt,
            outlets,
            isAcceptable,
        } = this.state;
        const geo = location && Object.prototype.hasOwnProperty.call(location, 'type')
            ? location
            : utils.getGeoFromCoord(location);

        if (!assignment || !assignment.id || loading) return;
        if (this.hasFormErrors()) return;

        // filter params for changed values only
        const params = pickBy({
            address,
            caption,
            radius: this.isGlobalLocation() ? undefined : radius,
            location: this.isGlobalLocation() ? null : geo,
            ...utils.getRemoveAddParams('outlets', assignment.outlets, outlets),
            title,
            ends_at: endsAt,
            is_acceptable: isAcceptable,
        }, (v, k) => {
            if (isEqual(assignment[k], v)) return false;
            if (k === 'ends_at' && (moment(assignment.ends_at).valueOf() === v)) return false;
            if (Array.isArray(v)) return !!v.length;
            if (typeof v === 'undefined') return false;
            return true;
        });

        save(assignment.id, params);
    }

    onCloseMerge() {
        this.setState({ assignmentToMergeInto: null, showMergeDialog: false });
    }

    /**
     * Called when assignment-merge-menu-item is clicked
     * @param  {[type]} id ID of assignment to be merged into
     */
    onSelectMerge(assignment) {
        this.setState({ assignmentToMergeInto: assignment, showMergeDialog: true });
    }

    /**
     * onMergeAssignment - closes merge dialog, calls onUpdateAssignment
     *
     * @param {Number} id Id of inactive assignment being merged into active assignment
     */
    onMergeAssignment(id, mergeIntoId) {
        this.onCloseMerge();
        $.snackbar({ content: 'Assignment merged!' });
        window.location.href = mergeIntoId
            ? `/assignment/${mergeIntoId}`
            : document.referrer || '/highlights';
    }

    onChangeInput = (e) => {
        if (e.target.type === 'checkbox') {
            this.setState({ [e.target.name]: e.target.checked });
        } else {
            this.setState({ [e.target.name]: e.target.value });
        }
    };

    hasFormErrors() {
        const { title, caption, radius, address, endsAt, outlets } = this.state;

        if (!outlets || !outlets.length) {
            $.snackbar({ content: 'An assignment must have at least one outlet!' });
            return true;
        }
        if (utils.isEmptyString(title)) {
            $.snackbar({ content: 'An assignment must have a title!' });
            return true;
        }
        if (utils.isEmptyString(caption)) {
            $.snackbar({ content: 'An assignment must have a caption!' });
            return true;
        }
        if (!this.isGlobalLocation() && address === '') {
            $.snackbar({ content: 'An assignment must have a location1' });
            return true;
        }
        if (!this.isGlobalLocation() && utils.milesToFeet(radius) < 250) {
            $.snackbar({ content: 'Radius must be at least 250ft!' });
            return true;
        }
        if (utils.hoursToExpiration(endsAt) < 0) {
            $.snackbar({ content: 'Expiration time must be a number greater than 0!' });
            return true;
        }

        return false;
    }

    revert() {
        // Set state back to original props
        this.setState(this.getStateFromProps(this.props));
    }

    clear = () => {
        this.setState({
            caption: '',
            title: '',
            address: null,
            endsAt: null,
            location: null,
            radius: null,
            outlet: null,
        });
    };

    /**
     * Reverts fields to original state
     */
    onCancel = () => {
        this.revert();
        this.props.onToggle();
    };

    isGlobalLocation() {
        return !this.state.location || isEmpty(this.state.location);
    }

    renderHeader() {
        return (
            <div className="dialog-head">
                <span className="md-type-title">Edit assignment</span>
                <span
                    className="mdi mdi-close pull-right icon toggle-edit toggler"
                    onClick={this.onCancel}
                />
            </div>
        );
    }

    renderBody() {
        const {
            title,
            caption,
            outlets,
            address,
            location,
            radius,
            endsAt,
            isAcceptable,
        } = this.state;
        const { user } = this.props;
        const globalLocation = this.isGlobalLocation();

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <div className="dialog-row">
                        <input
                            type="text"
                            className="form-control floating-label"
                            placeholder="Title"
                            title="Title"
                            name="title"
                            value={title}
                            onChange={this.onChangeInput}
                        />
                    </div>

                    <div className="dialog-row">
                        <textarea
                            type="text"
                            className="form-control floating-label"
                            placeholder="Caption"
                            name="caption"
                            title="Caption"
                            value={caption}
                            onChange={this.onChangeInput}
                        />
                    </div>

                    {user.roles.includes('admin') && (
                        <ChipInput
                            model="outlets"
                            queryAttr="title"
                            className="dialog-row"
                            items={outlets}
                            updateItems={o => this.setState({ outlets: o })}
                            autocomplete
                        />
                    )}

                    {user.roles.includes('admin') && (
                        <div className="checkbox form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isAcceptable"
                                    disabled={globalLocation}
                                    onChange={this.onChangeInput}
                                    checked={isAcceptable}
                                />
                                Acceptable
                            </label>
                        </div>
                    )}
                </div>

                <div className="dialog-col col-xs-12 col-md-5 form-group-default">

                    <div className="dialog-row map-group">
                        <div className="checkbox form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    disabled={isAcceptable}
                                    onChange={this.onChangeGlobal}
                                    checked={globalLocation}
                                />
                                Global
                            </label>
                        </div>

                        {!globalLocation && (
                            <AutocompleteMap
                                address={address}
                                location={location}
                                radius={Math.round(utils.milesToFeet(radius))}
                                onRadiusUpdate={(r) => this.onRadiusUpdate(r)}
                                onPlaceChange={(p) => this.onPlaceChange(p)}
                                onMapDataChange={(d) => this.onMapDataChange(d)}
                                draggable
                                rerender
                                hasRadius
                            />
                        )}
                    </div>

                    <div className="dialog-row">
                        <div className="form-group-default">
                            <input
                                type="text"
                                className="form-control floating-label"
                                data-hint="hours from now"
                                placeholder="Expiration time"
                                value={utils.hoursToExpiration(endsAt)}
                                onChange={(e) => this.onChangeEndsAt(e)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderFooter() {
        const { loading, assignment } = this.props;
        const { location } = this.state;

        return (
            <div className="dialog-foot">
                <button
                    id="story-edit-revert"
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                    onClick={() => this.revert()}
                >
                    Revert changes
                </button>
                <button
                    id="story-edit-clear"
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                    onClick={this.clear}
                >
                    Clear all
                </button>
                <button
                    id="story-edit-save"
                    type="button"
                    className="btn btn-flat pull-right"
                    disabled={loading}
                    onClick={() => this.onSave()}
                >
                    Save
                </button>
                <button
                    id="story-edit-discard"
                    type="button"
                    className="btn btn-flat pull-right toggle-edit toggler"
                    disabled={loading}
                    onClick={this.onCancel}
                >
                    Discard
                </button>
                {!this.isGlobalLocation() && (
                    <MergeDropup
                        assignmentId={assignment.id}
                        location={location}
                        onSelectMerge={(a) => this.onSelectMerge(a)}
                    />
                )}
            </div>
        );
    }

    renderStats() {
        const { assignment } = this.props;
        const { outlets, endsAt, caption, title } = this.state;
        const address = assignment.address || 'No Address';
        const timeCreated = moment(new Date(assignment.created_at)).format('MMM Do YYYY, h:mm:ss a');
        const expiresText = (moment().diff(endsAt) > 1 ? 'Expired ' : 'Expires ') + moment(endsAt).fromNow();

        return (
            <div className="col-lg-3 visible-lg edit-current">
                <div className="meta">
                    <div className="meta-user">
                        <div>
                            <img
                                role="presentation"
                                className="img-circle img-responsive"
                                src="/images/placeholder-assignment@2x.png"
                            />
                        </div>
                        <div>
                            <span className="md-type-title">{title}</span>
                            <span id="assignment-edit-owner" className="md-type-body1">
                                {outlets[0] && outlets[0].title ? `Posted by ${outlets[0].title}` : ''}
                            </span>
                        </div>
                    </div>
                    <div className="meta-description">{caption}</div>
                    <div className="meta-list">
                        <ul className="md-type-subhead">
                            <li>
                                <span className="mdi mdi-clock icon"></span>{timeCreated}
                            </li>
                            <li>
                                <span className="mdi mdi-map-marker icon"></span>{address}
                            </li>
                            <li>
                                <span className="mdi mdi-alert-circle icon"></span>{expiresText}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { showMergeDialog, assignmentToMergeInto } = this.state;
        const { assignment, visible } = this.props;

        return (
            <div>
                <div className={`dim toggle-edit ${visible ? 'toggled' : ''}`} />
                <div className={`edit panel panel-default toggle-edit ${visible ? 'toggled' : ''}`}>
                    {this.renderStats()}

                    <div className="col-xs-12 col-lg-9 edit-new dialog">
                        {this.renderHeader()}
                        {this.renderBody()}
                        {this.renderFooter()}
                    </div>
                </div>

                {(showMergeDialog && assignmentToMergeInto) && (
                    <Merge
                        assignment={assignment}
                        assignmentToMergeInto={assignmentToMergeInto}
                        onClose={() => this.onCloseMerge()}
                        onMergeAssignment={(id, mId) => this.onMergeAssignment(id, mId)}
                    />
                )}
            </div>
		);
    }
}
