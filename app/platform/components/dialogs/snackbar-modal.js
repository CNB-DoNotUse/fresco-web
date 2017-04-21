import React from 'react';

class SnackbarModal extends React.Component {

    render() {
        const { title, body } = this.props;
        return (
            <div id="snack" className="dialog-modal--confirm">
                <h3>{title || 'Title'}</h3>
            </div>
        );
    }
}

export default SnackbarModal;
