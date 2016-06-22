import React from 'react'

export default class AssignmentMerge extends React.Component {

    constructor(props) {
        super(props);

        this.cancel = this.cancel.bind(this);
        this.merge  = this.merge.bind(this);

    }

    cancel() {
        this.props.toggle();
    }

    merge() {
        if(!this.refs.title.value.length) {
            $.snackbar({ content: 'The merged assignment\'s title cannot be empty!' });
            this.refs.title.focus();
            return;
        }
        if(!this.refs.caption.value.length) {
            $.snackbar({ content: 'The merged assignment\'s caption cannot be empty!' });
            this.refs.caption.focus();
            return;
        }

        this.props.merge({
            title: this.refs.title.value,
            caption: this.refs.caption.value,
            assignmentToMergeInto: this.props.assignmentToMergeInto._id,
            assignmentToDelete: this.props.assignment._id,
            outlet: this.props.assignment.outlets[0]._id
        });
    }

    render() {

        let toggledText = this.props.toggled ? ' toggled' : '';

        if(!this.props.assignment || !this.props.assignmentToMergeInto) return <div />;

        return (
            <div className="assignment-merge-container">
                <div className={"dim toggle-edit " + toggledText} onClick={this.props.toggle}></div>
                <div className={"edit panel panel-default toggle-edit assignment-merge-dialog" + toggledText}>
                    <div className="col-lg-4 visible-lg edit-current assignment-merge-side">
                        <div className="assignment-block">
                            <span className="section-label">Active Assignment</span>
                            <h1>{this.props.assignmentToMergeInto.title}</h1>
                            <p>{this.props.assignmentToMergeInto.caption}</p>
                        </div>
                        <div className="assignment-block">
                            <span className="section-label">Submitted Assignment</span>
                            <h1>{this.props.assignment.title}</h1>
                            <p>{this.props.assignment.caption}</p>
                        </div>
                    </div>
                    <div className="col-xs-12 col-lg-8 edit-new dialog">
                        <div className="dialog-head">
                            <span className="md-type-title">Update assignment info</span>
                            <span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.cancel}></span>
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
                                        defaultValue={this.props.assignmentToMergeInto.title} />
                                </div>
                                
                                <div className="dialog-row">
                                    <textarea
                                        type="text"
                                        className="form-control floating-label"
                                        placeholder="Caption"
                                        title="Caption"
                                        ref="caption"/>
                                </div>
                            </div>
                        </div>
                            
                        <div className="dialog-foot">
                            <button type="button" className="btn btn-flat" onClick={this.cancel}>Cancel</button>
                            <button type="button" className="btn btn-flat pull-right" onClick={this.merge}>Merge & Update</button>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}

AssignmentMerge.defaultProps = {
    toggle: function() {}
}