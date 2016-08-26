const Dialog = ({ text, onConfirm }) => {
    if (text && typeof(text) === 'string') {
        alertify.confirm(text, (e) => {
            if (e) onConfirm();
        });
    }

    return null;
};

export default Dialog;
