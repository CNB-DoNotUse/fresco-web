import React, { PropTypes } from 'react'

class PasswordDialog extends React.Component {

    onSubmit(e) {
        e.preventDefault();

        this.props.onSubmit(this.refs.input.value)
    }

    render() {
        const toggled = this.props.toggled ? 'toggled' : '';

        return (
            <div className="dialog-wrap">
                <div className={`dim transparent ${toggled}`} />
               
                <div className={`dialog ${toggled}`}>
                    <div className="header">
                        <h3>Enter your password</h3>
                    </div>

                    <div className="body">
                        <form className="form-group-default" onSubmit={(e) => this.onSubmit(e)}>
                            <input
                                ref="input"
                                type="password"
                                className="form-control floating-label"
                                placeholder="Password"
                            />
                        </form>
                    </div>

                    <div className="footer">
                        <button 
                            className="cancel"
                            onClick={this.props.toggle}>
                            Cancel
                        </button>

                        <button 
                            className="primary" 
                            onClick={(e) => this.onSubmit(e)}>
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

PasswordDialog.propTypes = {
    onSubmit: PropTypes.func,
    toggle: PropTypes.func,
    toggled: PropTypes.bool
}

PasswordDialog.defaultProps = {
    onSubmit: () => {},
    toggle: () => {},
    toggled: false
}

export default PasswordDialog;