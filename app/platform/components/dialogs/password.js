import React, { PropTypes } from 'react'

export default class ChangePasswordCard extends React.Component {

    onSubmit() {
        this.props.onSubmit(this.refs.input.value)
    }

    render() {
        const { toggled } = this.props;

        return (
            <div className="dialog-wrap">
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />
                <div className={`dialog ${toggled ? 'toggled': ''}`}>
                    <div className="header">
                        <h3>Enter your password</h3>
                    </div>

                    <div className="body">
                        <div className="form-group-default">
                            <input
                                ref="input"
                                type="password"
                                className="form-control floating-label"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="footer">
                        <button 
                            className="cancel"
                            onClick={this.props.toggle}>
                            Cancel
                        </button>

                        <button 
                            className="primary" 
                            onClick={this.onSubmit.bind(this)}>
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

ChangePasswordCard.defaultProps = {
    onSubmit: () => {},
    toggle: () => {},
    toggled: false
}