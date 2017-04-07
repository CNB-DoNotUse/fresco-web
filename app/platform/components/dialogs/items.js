import React, { PropTypes } from 'react';
import Base from './base';
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
    };

    static defaultProps = {
        onClose: () => {},
        toggled: false,
        header: '',
        scrollable: false,
        context: null,
        emptyMessage: 'No items',
    };

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
            <Base toggled={toggled}>
                <div
                    className={`dialog-modal--items ${toggled ? 'toggled' : ''}`}
                    onScroll={scrollable ? (e) => { this.props.onScroll(e, context) } : null}
                >
                    <div className="dialog-modal__header">
                        <span>{header}</span>
                    </div>

                    <div
                        className="dialog-modal__items"
                    >
                        {(children && children.length) ? children : this.renderEmptyMessage()}
                    </div>

                    <div className="dialog-modal__footer">
                        <button
                            className="cancel"
                            onClick={onClose}
                        >
                           Close
                        </button>
                    </div>
                </div>
            </Base>
        );
    }
}
