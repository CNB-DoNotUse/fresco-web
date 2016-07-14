import React, { PropTypes } from 'react';
import AssignmentListItem from './assignment-list-item';
import AdminAssignmentEdit from './assignment-edit';
import uniqBy from 'lodash/uniqBy';
import findIndex from 'lodash/findIndex';
import omit from 'lodash/omit';

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

        this.scroll = this.scroll.bind(this);
    }

    onUpdateAssignment(id) {
        const { removeAssignment } = this.props;
        const allAssignments = this.getAllAssignments();
        const index = findIndex(allAssignments, { id });

        if (allAssignments[index + 1]) {
            this.setState({ 
                activeAssignment: allAssignments[index + 1] 
            }, () => removeAssignment(id));
        } else {
            this.setState({ 
                activeAssignment: null 
            }, () => removeAssignment(id));
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

        return uniqBy(allAssignments, 'id');
    }

    approve(params) {
        const { id } = params;
        if (!id) return;
        this.setState({ loading: true });

        let data = Object.assign({}, params);
        data = omit(data, 'id');
        $.ajax({
            type: 'POST',
            url: `/api/assignment/${id}/approve`,
            data,
        })
        .done(() => {
            this.onUpdateAssignment(id);
            this.setState({ loading: false });
            $.snackbar({ content: 'Assignment Approved!' });
        })
        .fail(() => {
            $.snackbar({ content: 'Could not approve assignment!' });
        });
    }

    reject(id) {
        if (!id) return;
        this.setState({ loading: true });

        $.ajax({
            type: 'POST',
            url: `/api/assignment/${id}/reject`,
        })
        .done(() => {
            $.snackbar({ content: 'Assignment Rejected!' });
            this.onUpdateAssignment(id);
            this.setState({ loading: false });
        })
        .fail(() => {
            $.snackbar({ content: 'Could not reject assignment!' });
        });
    }

    /**
     * Merges assignment into existing assignment
     * @param  {Object} data
     * @param  {String} data.title
     * @param  {String} data.caption
     * @param  {String} data.assignmentToMergeInto
     * @param  {String} data.assignmentToDelete
     */
    merge(data, cb) {
        $.ajax({
            url: '/api/assignment/merge',
            data,
        })
        .done(() => {
            this.onUpdateAssignment(data.assignmentToDelete);
            $.snackbar({ content: 'Assignment successfully merged!' });
            cb();
        })
        .fail(() => {
            $.snackbar({ content: 'Could not merge assignment!' });
        });
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
        const assignmentsToRender = this.getAllAssignments();

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
        const { activeAssignment, loading } = this.state;

        let editPane = '';
        if (activeAssignment && activeAssignment.id) {
            editPane = (
                <AdminAssignmentEdit
                    assignment={activeAssignment}
                    loading={loading}
                    approve={(params) => this.approve(params)}
                    rejectAssignment={(id) => this.reject(id)}
                    merge={(params, cb) => this.merge(params, cb)}
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

