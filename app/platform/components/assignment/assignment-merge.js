import React, { PropTypes } from 'react';

class AssignmentMerge extends React.Component {
    componentDidMount() {
        $.material.init();
    }

    cancel() {
        this.props.toggle();
    }

    /**
     * Merges assignment into existing assignment
     * @param  {Object} data
     * @param  {String} data.title
     * @param  {String} data.caption
     * @param  {String} data.assignmentToMergeInto
     * @param  {String} data.assignmentToDelete
     */
    postMerge(id, data) {
        if (!id || !data.mergeWith_id) return;

        $.ajax({
            type: 'POST',
            url: `/api/assignment/${id}/merge`,
            data: JSON.stringify(data),
        })
        .done(() => {
            this.onUpdateAssignment(data.mergeWith_id);
            $.snackbar({ content: 'Assignment successfully merged!' });
        })
        .fail(() => {
            $.snackbar({ content: 'Could not merge assignment!' });
        });
    }

    merge() {
        const { mergeAssignment, assignment } = this.props;

        if (!this.refs.title.value.length) {
            $.snackbar({ content: 'The merged assignment\'s title cannot be empty!' });
            this.refs.title.focus();
            return;
        }
        if (!this.refs.caption.value.length) {
            $.snackbar({ content: 'The merged assignment\'s caption cannot be empty!' });
            this.refs.caption.focus();
            return;
        }

        this.postMerge(assignment.id, {
            title: this.refs.title.value,
            caption: this.refs.caption.value,
            mergeWith_id: mergeAssignment.id,
        });
    }

    render() {
        let toggledText = this.props.toggled ? ' toggled' : '';
        const { assignment, mergeAssignment } = this.props;

        if (!this.props.assignment || !this.props.mergeAssignment) return <div />;

        return (
            <div className="assignment-merge-container">
                <div className={"dim toggle-edit " + toggledText} onClick={this.props.toggle}></div>
                <div className={"edit panel panel-default toggle-edit assignment-merge-dialog" + toggledText}>
                    <div className="col-lg-4 visible-lg edit-current assignment-merge-side">
                        <div className="assignment-block">
                            <span className="section-label">Active Assignment</span>
                            <h1>{assignment.title}</h1>
                            <p>{assignment.caption}</p>
                        </div>
                        <div className="assignment-block">
                            <span className="section-label">Submitted Assignment</span>
                            <h1>{mergeAssignment.title}</h1>
                            <p>{mergeAssignment.caption}</p>
                        </div>
                    </div>
                    <div className="col-xs-12 col-lg-8 edit-new dialog">
                        <div className="dialog-head">
                            <span className="md-type-title">Update assignment info</span>
                            <span
                                className="mdi mdi-close pull-right icon toggle-edit toggler"
                                onClick={() => this.cancel()}
                            />
                        </div>
                        <div className="dialog-body">
                            <div className="dialog-col col-xs-12 form-group-default">
                                <div className="dialog-row">
                                    <input
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Title"
                                        title="Title"
                                        ref="title"
                                        defaultValue={assignment.title}
                                    />
                                </div>

                                <div className="dialog-row">
                                    <textarea
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                        title="Caption"
                                        ref="caption"
                                        defaultValue={assignment.caption}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="dialog-foot">
                            <button
                                type="button"
                                className="btn btn-flat"
                                onClick={() => this.cancel()}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-flat pull-right"
                                onClick={() => this.merge()}
                            >
                                Merge & Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

AssignmentMerge.defaultProps = {
    toggle() {},
};

AssignmentMerge.propTypes = {
    toggle: PropTypes.func.isRequired,
    mergeAssignment: PropTypes.object,
    assignment: PropTypes.object,
};

export default AssignmentMerge;

