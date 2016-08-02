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
            loading: false,
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
                concat: true,
                tab: 'assignments',
            },
            null);
        }
    }

    /**
     * approveAssignment
     * gets form data then calls posts request to approve and update assignment
     *
     */
    approveAssignment(id, params) {
        if (!id || !params || this.state.loading) return;
        this.setState({ loading: true });

        $.ajax({
            method: 'post',
            url: `/api/assignment/${id}/approve`,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(params),
        })
        .done(() => {
            this.onUpdateAssignment(id);
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
            method: 'post',
            url: `/api/assignment/${id}/reject`,
        })
        .done(() => {
            $.snackbar({ content: 'Assignment Rejected!' });
            this.onUpdateAssignment(id);
            this.setState({ loading: false });
        })
        .fail(() => {
            $.snackbar({ content: 'Could not reject assignment!' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
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
                    rejectAssignment={(id) => this.rejectAssignment(id)}
                    approveAssignment={(id, p) => this.approveAssignment(id, p)}
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

