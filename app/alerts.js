// Loops through window alerts and displays them
$(document).ready(() => {
    if (window.alerts && window.alerts.length) {
        window.alerts.forEach((a) => {
            $.snackbar({
                content: a,
                timeout: 5000,
                htmlAllowed: true,
            });
        });
    }
});

