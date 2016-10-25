import React, { PropTypes } from 'react';

export default class Confirm extends React.Component {
    static propTypes = {
        onConfirm: PropTypes.func,
        onCancel: PropTypes.func,
        toggled: PropTypes.bool,
        hasInput: PropTypes.bool,
        text: PropTypes.string,
        disabled: PropTypes.bool,
        confirmText: PropTypes.string,
    }

    static defaultProps = {
        onConfirm: () => {},
        onCancel: () => {},
        toggled: false,
        text: '',
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

    renderInput = () => (
        <div className="body">
            <form
                className="form-group-default"
                onSubmit={this.onConfirm}
            >
                <input
                    ref={r => { this.input = r; }}
                    type="password"
                    className="form-control floating-label"
                    placeholder="Password"
                />
            </form>
        </div>
    )

    render() {
        const { toggled, text, confirmText, hasInput, onCancel, disabled } = this.props;

        return (
            <div className={`dialog-wrap ${toggled ? 'toggled' : ''}`}>
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />

                <div className={`confirm-dialog ${toggled ? 'toggled' : ''} ${hasInput ? '' : 'no-input'}`}>
                    <div className="header">
                        <h3>{text}</h3>
                    </div>

                    {hasInput && this.renderInput()}

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

