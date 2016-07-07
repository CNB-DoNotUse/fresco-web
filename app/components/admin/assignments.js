import React, { PropTypes } from 'react';
import AssignmentListItem from './admin-assignment-list-item';
import AdminAssignmentEdit from './admin-assignment-edit';
import uniqBy from 'lodash/uniqBy';

class Assignments extends React.Component {
    constructor(props) {
        super(props);

        const firstAssignment = props.assignments && props.assignments.length
            ? props.assignments[0]
            : null;

        this.state = {
            activeAssignment: firstAssignment,
        };

        this.updateAssignment = this.updateAssignment.bind(this);
        this.scroll = this.scroll.bind(this);
    }

    setActiveAssignment(assignment) {
        this.setState({ activeAssignment: assignment });
    }

    updateAssignment(id) {
        // TODO: refactor
        const { assignments } = this.props;
        let next_index = 0;

        for (let a in assignments) {
            if (id === assignments[a].id) {
                if (a === (assignments.length - 1)) {
                    next_index = a - 1;
                } else {
                    next_index = a;
                    assignments.splice(a, 1);
                }
            }
        }

        this.setActiveAssignment(assignments ? assignments[next_index] ? assignments[next_index].id : null : null);
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
        const { assignments } = this.props;
        const { activeAssignment } = this.state;
        let cmps = [];
        let assignmentsToRender = [];
        ['nearby', 'global'].forEach((type) => {
            assignmentsToRender = assignmentsToRender
                .concat(assignments[type] && assignments[type].length ? assignments[type] : []);
        });
        assignmentsToRender = uniqBy(assignmentsToRender, 'id');

        function sortListItem(a, b) {
            if (a.created_at > b.created_at) {
                return -1;
            } else if (a.created_at < b.created_at) {
                return 1;
            }

            return 0;
        }

        if (assignmentsToRender.length) {
            cmps = assignmentsToRender.sort(sortListItem).map((assignment, i) => (
                <AssignmentListItem
                    type="assignment"
                    assignment={assignment}
                    key={i}
                    active={activeAssignment && activeAssignment.id === assignment.id}
                    setActiveAssignment={() => this.setActiveAssignment(assignment)}
                />
            ));
        }

        return cmps;
    }

    render() {
        const { activeAssignment } = this.state;

        let editPane = '';
        if (activeAssignment && activeAssignment.id) {
            editPane = (
                <AdminAssignmentEdit
                    assignment={activeAssignment}
                    updateAssignment={this.updateAssignment}
                />
            );
        }

        return (
            <div className="container-fluid admin">
                <div className="col-md-6 col-lg-7 list" onScroll={this.scroll}>
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
    assignments: PropTypes.object,
    getData: PropTypes.func,
};

export default Assignments;

