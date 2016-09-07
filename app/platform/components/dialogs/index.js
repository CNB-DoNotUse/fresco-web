export const Alertify = ({ text, onConfirm }) => {
    if (text && typeof(text) === 'string') {
        alertify.confirm(text, (e) => {
            if (e) onConfirm();
        });
    }

    return null;
};

export const Snackbar = ({ text, onShow, onClick = (() => {}) }) => {
    if (text && typeof(text) === 'string') {
        $.snackbar({ content: text, timeout: 5000 }).click(() => onClick());
        // TODO: fix: causing react render bug
        if (onShow && typeof onShow === 'function') onShow();
    }

    return null;
};

