import React, { PropTypes } from 'react';

export default class Info extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        toggled: PropTypes.bool,
        header: PropTypes.string,
        children: PropTypes.node,
        minHeight: PropTypes.number,
        maxHeight: PropTypes.number,
        width: PropTypes.number,
    }

    static defaultProps = {
        onClose: () => {},
        toggled: false,
        header: '',
    }

    render() {
        const {
            minHeight,
            maxHeight,
            width,
            toggled,
            header,
            onClose,
            children,
        } = this.props;

        const infoStyle = {
            height: children && children.length > 1 ? maxHeight : minHeight,
            width,
        };

        return (
            <div className="dialog-wrap">
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />

                <div
                    className={`info-dialog ${toggled ? 'toggled' : ''}`}
                    style={infoStyle}
                >
                    <div className="header">
                        <span>{header}</span>
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
