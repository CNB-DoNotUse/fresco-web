import React, { PropTypes } from 'react';

class SnackbarModal extends React.Component {
    // a modal that pops up, displays a message, and can link to somewhere
    static defaultProps = {
        timeout: 5000,
        content: '',
        href: ''
    };

    componentDidUpdate() {
        const { timeout } = this.props;
        setTimeout(this.context.closeAlert, timeout);
    }

    onClick = () => {
        const win = window.open( this.props.href, '_blank');
        win.focus();
    }


    render() {
        const { content, href, timeout } = this.props;
        let click = () => {};
        if (href) click
        return (
            <span onClick={ href ? this.onClick : this.context.closeAlert } className="snackbar-content">
                {content || ''}
            </span>
        );
    }
}

SnackbarModal.contextTypes = {
    openAlert: PropTypes.func,
    closeAlert: PropTypes.func
};

export default SnackbarModal;
