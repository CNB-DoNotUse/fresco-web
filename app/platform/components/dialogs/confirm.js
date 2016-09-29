import React, { PropTypes } from 'react';

export default class Confirm extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func,
        toggle: PropTypes.func,
        toggled: PropTypes.bool,
        hasInput: PropTypes.bool,
        text: PropTypes.string,
    }

    static defaultProps = {
        onSubmit: () => {},
        toggle: () => {},
        toggled: false,
        text: '',
        hasInput: false,
    }

    onSubmit = (e) => {
        e.preventDefault();

        this.props.onSubmit(this.input.value);
    }

    renderInput = () => (
        <div className="body">
            <form
                className="form-group-default"
                onSubmit={this.onSubmit}
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
        const { toggled, text, hasInput } = this.props;

        return (
            <div className="dialog-wrap">
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />

                <div className={`dialog ${toggled ? 'toggled' : ''}`}>
                    <div className="header">
                        <h3>{text}</h3>
                    </div>

                    {hasInput && this.renderInput()}

                    <div className="footer">
                        <button
                            className="cancel"
                            onClick={this.props.toggle}
                        >
                            Cancel
                        </button>

                        <button
                            className="primary"
                            onClick={(e) => this.onSubmit(e)}
                        >
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
