import React, { PropTypes } from 'react';
import 'app/sass/platform/dialogs/items.scss';

export default class Items extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        toggled: PropTypes.bool,
        scrollable: PropTypes.bool,
        header: PropTypes.string,
        context: PropTypes.string,
        emptyMessage: PropTypes.string,
        children: PropTypes.node,
    }

    static defaultProps = {
        onClose: () => {},
        toggled: false,
        header: '',
        scrollable: false,
        context: null,
        emptyMessage: 'No items',
    }

    renderEmptyMessage() {
        return <p className="empty">{this.props.emptyMessage}</p>;
    }

    render() {
        const {
            toggled,
            header,
            onClose,
            children,
            scrollable,
            context
        } = this.props;

        return (
            <div className={`dialog-wrap ${toggled ? 'toggled' : ''}`}>
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />

                <div
                    className={`dialog-modal--items ${toggled ? 'toggled' : ''}`}
                    onScroll={scrollable ? (e) => { this.props.onScroll(e, context) } : null}
                >
                    <div className="header">
                        <span>{header}</span>
                    </div>

                    <div
                        className="items"
                    >
                        {(children && children.length) ? children : this.renderEmptyMessage()}
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
