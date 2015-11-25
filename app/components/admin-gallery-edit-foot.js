import React from 'react'

export default class AdminGalleryEditFoot extends React.Component {
    render() {
        return (
            <div className="dialog-foot">
                <button type="button" className="btn btn-flat gallery-revert" onClick={this.props.revert} disabled={this.props.enabled}>Revert changes</button>
                <button type="button" className="btn btn-flat pull-right gallery-verify" onClick={this.props.verify} disabled={this.props.enabled}>Verify</button>
                <button type="button" className="btn btn-flat pull-right gallery-skip" onClick={this.props.skip} disabled={this.props.enabled}>Skip</button>
                <button type="button" className="btn btn-flat pull-right gallery-delete" onClick={this.props.remove} disabled={this.props.enabled}>Delete</button>
            </div>
        );
    }
}