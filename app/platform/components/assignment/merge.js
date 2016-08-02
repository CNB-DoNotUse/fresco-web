import React, { PropTypes } from 'react';

class AssignmentMerge extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    componentDidMount() {
        $.material.init();
    }

    /**
     * Merges assignment into existing assignment
     * @param  {Number} id of assignment to be merged
     * @param  {Object} data, requires mergeInto_id(id of assignment to be merged into)
     */
    postMerge(id, data) {
        const { loading } = this.state;
        if (loading || !id || !data.merge_into_id) return;

        this.setState({ loading: true });
        $.ajax({
            method: 'POST',
            url: `/api/assignment/${id}/merge`,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            this.props.onMergeAssignment(id);
            $.snackbar({ content: 'Assignment successfully merged!' });
        })
        .fail(() => {
            $.snackbar({ content: 'Could not merge assignment!' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    /**
     * Initiates merge assignments, fails if empty form data
     */
    merge() {
        const { mergeIntoAssignment, assignment } = this.props;

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
            merge_into_id: mergeIntoAssignment.id,
        });
    }

    render() {
        const { assignment, mergeIntoAssignment, onClose } = this.props;
        const { loading } = this.state;

        return (
            <div className="assignment-merge-container">
                <div className={"dim toggle-edit toggled"} onClick={onClose}></div>
                <div className={"edit panel panel-default toggle-edit assignment-merge-dialog toggled"}>
                    <div className="col-lg-4 visible-lg edit-current assignment-merge-side">
                        <div className="assignment-block">
                            <span className="section-label">Active Assignment</span>
                            <h1>{mergeIntoAssignment.title}</h1>
                            <p>{mergeIntoAssignment.caption}</p>
                        </div>
                        <div className="assignment-block">
                            <span className="section-label">Submitted Assignment</span>
                            <h1>{assignment.title}</h1>
                            <p>{assignment.caption}</p>
                        </div>
                    </div>
                    <div className="col-xs-12 col-lg-8 edit-new dialog">
                        <div className="dialog-head">
                            <span className="md-type-title">Update assignment info</span>
                            <span
                                className="mdi mdi-close pull-right icon toggle-edit toggler"
                                onClick={onClose}
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
                                        defaultValue={mergeIntoAssignment.title}
                                    />
                                </div>

                                <div className="dialog-row">
                                    <textarea
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                        title="Caption"
                                        ref="caption"
                                        defaultValue={mergeIntoAssignment.caption}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="dialog-foot">
                            <button
                                type="button"
                                className="btn btn-flat"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-flat pull-right"
                                onClick={() => this.merge()}
                                disabled={loading}
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

AssignmentMerge.propTypes = {
    onClose: PropTypes.func.isRequired,
    onMergeAssignment: PropTypes.func.isRequired,
    mergeIntoAssignment: PropTypes.object,
    assignment: PropTypes.object,
};

export default AssignmentMerge;

