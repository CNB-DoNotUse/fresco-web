import React, { PropTypes } from 'react';
import Base from './base';
import 'app/sass/platform/dialogs/confirm.scss';

/**
 * Basic confirm dialog
 * Pass onConfirm and onCancel props to get signals of user input
 * Can optionally pass back up an input, see props for more
 */
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
        <div className="dialog-modal__body">
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
            <Base toggled={toggled}>
                <div className={`dialog-modal--confirm ${toggled ? 'toggled' : ''}`}>
                    <div className="dialog-modal__header">
                        <h3>{header}</h3>
                    </div>

                    {(hasInput || body) && this.renderBody()}

                    <div className="dialog-modal__footer">
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
            </Base>
        );
    }
}

