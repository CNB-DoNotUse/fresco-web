import React, { PropTypes } from 'react';
import AssignmentListItem from './admin-assignment-list-item';
import AdminAssignmentEdit from './admin-assignment-edit';

class Assignments extends React.Component {
    constructor(props) {
        super(props);

        const firstAssignment = props.assignments && props.assignments.length
            ? props.assignments[0]
            : null;

        this.state = {
            activeAssignment: firstAssignment,
        };

        this.setActiveAssignment = this.setActiveAssignment.bind(this);
        this.updateAssignment = this.updateAssignment.bind(this);
        this.scroll = this.scroll.bind(this);
    }

    setActiveAssignment(id) {
        if (id == null) {
            this.setState({ activeAssignment: false });

            return;
        }

        for (let a in this.props.assignments) {
            if (this.props.assignments[a].id == id) {
                this.setState({ activeAssignment: this.props.assignments[a] });
                break;
            }
        }
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

    render() {
        const { assignments } = this.props;
        const { activeAssignment } = this.state;
        function sortListItem(a, b) {
            if (a.created_at > b.created_at) {
                return -1;
            } else if (a.created_at < b.created_at) {
                return 1;
            }

            return 0;
        }

        let listItems = [];
        let editPane = '';

        let assignmentsToRender = [];
        ['nearby', 'global'].forEach((type) => {
            assignmentsToRender = assignmentsToRender
                .concat(assignments[type] && assignments[type].length ? assignments[type] : []);
        });

        if (assignmentsToRender.length) {
            listItems = assignmentsToRender.sort(sortListItem).map((assignment, i) => (
                <AssignmentListItem
                    type="assignment"
                    assignment={assignment}
                    key={i}
                    active={activeAssignment && activeAssignment.id === assignment.id}
                    setActiveAssignment={this.setActiveAssignment}
                />
            ));
        }
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
                    {listItems}
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

