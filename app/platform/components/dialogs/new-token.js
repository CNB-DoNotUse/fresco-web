import React, { PropTypes } from 'react';
import Base from './base';

export default class NewToken extends React.Component {
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

    renderForm = () => (
        <div className="body">
            
        </div>
    )

    render() {
        const { toggled, header, confirmText, hasInput, onCancel, disabled, body } = this.props;

        return (
            <Base toggled={toggled}>
                <div className={`dialog-modal--confirm ${toggled ? 'toggled' : ''}`}>
                    <div className="version-dropdown"></div>
                    
                    <div className="form">

                        <input
                            ref="tokenName"
                            type="text"
                            className="token-name"
                            placeholder="Token name"
                        />

                        <input
                            ref="redirect"
                            type="text"
                            className="form-control floating-label"
                            placeholder="Redirect URI"
                        />
                    </div>

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
                            Save
                        </button>
                    </div>
                </div>
            </Base>
        );
    }
}

