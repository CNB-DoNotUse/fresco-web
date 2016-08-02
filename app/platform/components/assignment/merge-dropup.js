import React, { PropTypes } from 'react';
import utils from 'utils';
import uniqBy from 'lodash/uniqBy';
import reject from 'lodash/reject';

/**
 * AssignmentMergeDropup Dropdown(up) menu that displays list of nearby assignments
 * Click on assignment in list, calls onSelectMerge prop
 *
 * @extends React.Component
 */
class MergeDropup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            nearbyAssignments: [],
        };
    }

    componentDidMount() {
        $(document).click((e) => {
            // Hide dropdown on click as long as not clicking on master button.
            if ($(e.target).parents('.merge-dropup').size() === 0
                && e.target.className !== 'merge-dropup__toggle') {
                this.setState({ active: false });
            }
        });

        this.findNearbyAssignments();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.location !== nextProps.location) {
            this.findNearbyAssignments();
        }
    }

    componentWillUnmount() {
        // Clean up click event on unmount
        $(document).unbind('click');
    }

    onToggle() {
        this.setState({ active: !this.state.active });
    }

    /**
     * Finds nearby assignments
     */
    findNearbyAssignments() {
        const { loading } = this.state;
        const { assignmentId, location } = this.props;
        if (loading || !location || !location.lat || !location.lng) return;

        this.setState({ loading: true });
        const data = {
            radius: 1,
            geo: utils.getGeoFromCoord(location),
            limit: 5,
        };

        $.ajax({
            url: '/api/assignment/find',
            data,
            dataType: 'json',
            contentType: 'application/json',
        })
        .done((res) => {
            if (res.nearby && res.global) {
                const nearbyAssignments =
                    uniqBy(reject(res.nearby.concat(res.global), { id: assignmentId }), 'id');
                this.setState({ nearbyAssignments });
            }
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    renderAssignments(assignments) {
        const { onSelectMerge } = this.props;

        return assignments.map((a, i) => (
            <div
                key={i}
                className="merge-dropup__menu-item"
                onClick={() => onSelectMerge(a)}
            >
                <span className="assignment-title">
                    {a.title}
                </span>
                <span className="assignment-location">
                    {a.address}
                </span>
                <p className="assignment-caption">
                    {a.caption}
                </p>
            </div>
        ));
    }

    render() {
        const { active, nearbyAssignments } = this.state;

        if (active && nearbyAssignments.length) {
            return (
                <div className={'merge-dropup merge-dropup--active pull-right '}>
                    <div className="merge-dropup__toggle merge-dropup__toggle--active" onClick={() => this.onToggle()} >
                        <span>{`Merge (${nearbyAssignments.length})`}</span>
                        <i className={'mdi mdi-menu-down pull-right'} />
                    </div>

                    <div className="merge-dropup__body">
                        {this.renderAssignments(nearbyAssignments)}
                    </div>
                </div>

            );
        }

        return (
            <div className={'merge-dropup pull-right btn'}  onClick={() => this.onToggle()}>
                <div className="merge-dropup__toggle">
                    <span>{`Merge (${nearbyAssignments.length})`}</span>
                    <i className={'mdi mdi-menu-up'} />
                </div>
            </div>

        );
    }
}

MergeDropup.propTypes = {
    assignmentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    location: PropTypes.object.isRequired,
    onSelectMerge: PropTypes.func.isRequired,
};

export default MergeDropup;

