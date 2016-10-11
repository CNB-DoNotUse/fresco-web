import React, { PropTypes } from 'react';

export default class Items extends React.Component {
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
        const {
            toggled,
            header,
            onClose,
            children,
        } = this.props;

        return (
            <div className="dialog-wrap">
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />

                <div
                    className={`items-dialog ${toggled ? 'toggled' : ''}`}
                >
                    <div className="header">
                        <span>{header}</span>
                    </div>

                    <div
                        className="items"
                    >
                        {children}
                    </div>

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
