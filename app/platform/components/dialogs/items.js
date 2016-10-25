import React, { PropTypes } from 'react';

export default class Items extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        toggled: PropTypes.bool,
        header: PropTypes.string,
        emptyMessage: PropTypes.string,
        children: PropTypes.node,
    }

    static defaultProps = {
        onClose: () => {},
        toggled: false,
        header: '',
        emptyMessage: 'No items',
    }

    renderEmptyMessage() {
        return <div style={{ textAlign: 'center' }}>{this.props.emptyMessage}</div>;
    }

    render() {
        const {
            toggled,
            header,
            onClose,
            children,
        } = this.props;

        return (
            <div className={`dialog-wrap ${toggled ? 'toggled' : ''}`}>
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
                        {children.length ? children : this.renderEmptyMessage()}
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
