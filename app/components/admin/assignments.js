import React, { PropTypes } from 'react';
import AssignmentListItem from './assignment-list-item';
import AdminAssignmentEdit from './assignment-edit';
import uniqBy from 'lodash/uniqBy';
import findIndex from 'lodash/findIndex';

class Assignments extends React.Component {
    constructor(props) {
        super(props);

        const firstAssignment = props.assignments && props.assignments.length
            ? props.assignments[0]
            : null;

        this.state = {
            activeAssignment: firstAssignment,
        };

        this.scroll = this.scroll.bind(this);
    }

    onUpdateAssignment(id) {
        const { removeAssignment } = this.props;
        const allAssignments = this.getAllAssignments();
        const index = findIndex(allAssignments, { id });

        if (allAssignments[index + 1]) {
            this.setState({ activeAssignment: allAssignments[index + 1] },
                () => removeAssignment(id));
        } else {
            this.setState({ activeAssignment: null },
                () => removeAssignment(id));
        }
    }

    setActiveAssignment(assignment) {
        this.setState({ activeAssignment: assignment });
    }

    getAllAssignments() {
        const { assignments } = this.props;
        let allAssignments = [];

        ['nearby', 'global'].forEach((type) => {
            allAssignments = allAssignments
                .concat(assignments[type] && assignments[type].length ? assignments[type] : []);
        });

        return allAssignments;
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
        let cmps = [];
        const assignmentsToRender = uniqBy(this.getAllAssignments(), 'id');

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
                    onApproveAssignment={(v) => this.onApproveAssignment(v)}
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
    assignments: PropTypes.object.isRequired,
    getData: PropTypes.func.isRequired,
    removeAssignment: PropTypes.func.isRequired,
};

export default Assignments;

