import React, { PropTypes } from 'react';
import AssignmentListItem from './assignment-list-item';
import AssignmentEdit from './assignment-edit';
import findIndex from 'lodash/findIndex';

class Assignments extends React.Component {
    constructor(props) {
        super(props);

        const firstAssignment = props.assignments && props.assignments.length
            ? props.assignments[0]
            : null;

        this.state = {
            activeAssignment: firstAssignment,
            loading: false,
        };
    }

    onUpdateAssignment(id) {
        const { assignments, removeAssignment } = this.props;
        const index = findIndex(assignments, { id });
        const nextAssignment = assignments[index + 1]
            || assignments[index - 1]
            || null;
        removeAssignment(id);
        this.setActiveAssignment(nextAssignment);
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
                concat: true,
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
        const { activeAssignment, loading } = this.state;

        let editPane = '';
        if (activeAssignment && activeAssignment.id) {
            editPane = (
                <AssignmentEdit
                    assignment={activeAssignment}
                    loading={loading}
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

