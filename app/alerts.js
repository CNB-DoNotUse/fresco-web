//Loops through window alerts and displays them
$(document).ready(function() {
    for(let alert of window.alerts) { 
        $.snackbar({
            content: alert, 
            timeout: 5000,
            htmlAllowed: true
        });
    }
});