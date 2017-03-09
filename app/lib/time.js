const moment = require('moment-timezone');

/**
 * Helper functions used for timestamp related functions
 * @type {Object}
 */
module.exports = {

    /**
     * Sets the windows time formatting style
     * @param {string} timeFormat `Absolute` or `Relative`
     */
    setTimeDisplayType(timeFormat) {
        // Set the windows time format
        window.timeFormat = timeFormat;

        const timeStrings = document.getElementsByClassName('timestring');

        //Change all timestamps to new format
        for (var i = timeStrings.length - 1; i >= 0; i--) {
            const timestamp = timeStrings[i].dataset.timestamp;
            timeStrings[i].innerHTML = this.formatTime(timestamp);
        };
    },

    formatTime(timestamp, absolute = false, format = null) {
        const userTimezone = moment.tz.guess();

        if (!absolute &&
            (typeof window === 'undefined' || !window.timeFormat || window.timeFormat === 'relative')) {
            return moment(timestamp).fromNow();
        } else if (window.timeFormat === 'absolute' || absolute) {
            //Checks if the timestamp is within the last day
            if (moment(Date.now()).startOf('day').isSame(moment(timestamp).startOf('day'))) {
                return moment.tz(timestamp, userTimezone).format(format || 'h:mm A z');
            }

            return moment.tz(timestamp, userTimezone).format(format || 'MMM Do, YYYY, h:mm A z');
        }

        return '';
    }
}