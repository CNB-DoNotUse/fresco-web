import React, { PropTypes } from 'react';

export default class Confirm extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        toggled: PropTypes.bool,
        header: PropTypes.string,
        children: PropTypes.node,
    }

    static defaultProps = {
        onClose: () => {},
        toggled: false,
        header: '',
    }

    render() {
        const { toggled, header, onClose, children } = this.props;

        return (
            <div className="dialog-wrap">
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />

                <div className={`info-dialog ${toggled ? 'toggled' : ''}`}>
                    <div className="header">
                        <h3>{header}</h3>
                    </div>

                    {children}

                    <div className="footer">
                        <button
                            className="cancel"
                            onClick={onClose}
                        >
                           Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
