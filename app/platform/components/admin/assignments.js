import React, { PropTypes } from 'react';
import AssignmentListItem from './assignment-list-item';
import AssignmentEdit from './assignment-edit';
import findIndex from 'lodash/findIndex';

/**
 * Assignments - component for managing unrated assignments in admin view
 *
 * @extends React.Component
 */
class Assignments extends React.Component {
    constructor(props) {
        super(props);

        const firstAssignment = props.assignments && props.assignments.length
            ? props.assignments[0]
            : null;

        this.state = {
            activeAssignment: firstAssignment,
        };
    }

    /**
     * onUpdateAssignment
     *
     * @param {number} id Called on updating assignment
     * to set next active assignment and remove updated
     */
    onUpdateAssignment(id) {
        const { assignments, removeAssignment } = this.props;
        const index = findIndex(assignments, { id });

        removeAssignment(id, (arr) => {
            this.setActiveAssignment(arr[index] || arr[index + 1] || arr[index - 1]);
        });
    }

    setActiveAssignment(assignment) {
        this.setState({ activeAssignment: assignment });
    }

    scroll(e) {
        const { assignments, getData } = this.props;
        const target = e.target;
        if (target.scrollTop === target.scrollHeight - target.offsetHeight) {
            if (!assignments || !assignments.length) return;

            getData(assignments[assignments.length - 1].id, {
                tab: 'assignments',
            },
            null);
        }
    }

    renderAssignments() {
        const { activeAssignment } = this.state;
        const { assignments } = this.props;

        return assignments.map((assignment, i) => (
            <AssignmentListItem
                type="assignment"
                assignment={assignment}
                key={i}
                active={activeAssignment && activeAssignment.id === assignment.id}
                setActiveAssignment={() => this.setActiveAssignment(assignment)}
            />
        ));
    }

    render() {
        const { activeAssignment } = this.state;

        let editPane = '';
        if (activeAssignment && activeAssignment.id) {
            editPane = (
                <AssignmentEdit
                    assignment={activeAssignment}
                    onUpdateAssignment={(id) => this.onUpdateAssignment(id)}
                />
            );
        }

        return (
            <div className="container-fluid admin">
                <div className="col-md-6 col-lg-7 list" onScroll={(e) => this.scroll(e)}>
                    {this.renderAssignments()}
                </div>
                <div className="col-md-6 col-lg-5 form-group-default admin-edit-pane">
                    {editPane}
                </div>
            </div>
        );
    }
}

Assignments.propTypes = {
    assignments: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
    removeAssignment: PropTypes.func.isRequired,
};

export default Assignments;

