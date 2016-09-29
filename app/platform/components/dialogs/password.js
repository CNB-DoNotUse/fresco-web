import React, { PropTypes } from 'react'

class PasswordDialog extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func,
        toggle: PropTypes.func,
        toggled: PropTypes.bool
    }

    static defaultProps = {
        onSubmit: () => {},
        toggle: () => {},
        toggled: false
    }

    onSubmit = (e) => {
        e.preventDefault();

        this.props.onSubmit(this.refs.input.value)
    }

    render() {
        const toggled = this.props.toggled ? 'toggled' : '';

        return (
            <div className="dialog-wrap">
                <div className={`dim transparent ${toggled}`} />

                <div className={`confirm-dialog ${toggled}`}>
                    <div className="header">
                        <h3>Enter your password</h3>
                    </div>

                    <div className="body">
                        <form
                            className="form-group-default"
                            onSubmit={this.onSubmit}
                        >
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

export default PasswordDialog;
