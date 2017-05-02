import React from 'react';

class SnackbarModal extends React.Component {
    // a modal that pops up, displays a message, and can link to somewhere
    static propTypes = {

    };

    static defaultProps = {
        time: 5000,
        title: '',
        
    };

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
