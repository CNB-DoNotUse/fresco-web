import React, { PropTypes } from 'react';

export default class Confirm extends React.Component {
    static propTypes = {
        onConfirm: PropTypes.func,
        onCancel: PropTypes.func,
        toggled: PropTypes.bool,
        hasInput: PropTypes.bool,
        header: PropTypes.string,
        disabled: PropTypes.bool,
        confirmText: PropTypes.string,
        body: PropTypes.string,
    }

    static defaultProps = {
        onConfirm: () => {},
        onCancel: () => {},
        toggled: false,
        header: '',
        confirmText: 'Confirm',
        hasInput: false,
        disabled: false,
    }

    onConfirm = (e) => {
        e.preventDefault();
        const { hasInput, onConfirm } = this.props;
        if (hasInput) onConfirm(this.input.value);
        else onConfirm();
    }

    renderBody = () => (
        <div className="body">
            {this.props.body && this.props.body}
            {this.props.hasInput && (
                <form
                    className="form-group-default"
                    onSubmit={this.onConfirm}
                >
                    <input
                        ref={(r) => { this.input = r; }}
                        type="password"
                        className="form-control floating-label"
                        placeholder="Password"
                    />
                </form>
            )}
        </div>
    )

    render() {
        const { toggled, header, confirmText, hasInput, onCancel, disabled, body } = this.props;

        return (
            <div className={`dialog-wrap ${toggled ? 'toggled' : ''}`}>
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />

                <div className={`dialog-modal--confirm ${toggled ? 'toggled' : ''}`}>
                    <div className="header">
                        <h3>{header}</h3>
                    </div>

                    {(hasInput || body) && this.renderBody()}

                    <div className="footer">
                        <button
                            className="cancel btn"
                            onClick={onCancel}
                            disabled={disabled}
                        >
                            Cancel
                        </button>

                        <button
                            className="primary btn"
                            onClick={this.onConfirm}
                            disabled={disabled}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

