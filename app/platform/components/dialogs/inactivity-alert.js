import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import React from 'react';
import api from 'app/lib/api';

const assignmentParams = { direction: "desc", sortBy: "created_at", limit: 1 };

// makes an api call to see if an assignment has been made in the last 12 hours
export const checkIfInactive = () => {
    api.get('assignment/list', assignmentParams)
        .then((res) => {
            console.log(res);
            if (res.length > 0) {
                const lastAssignment = res[0];
            }
        })
        .catch((err) => {
            console.log("nope");
        });

}

// checks if a notification has been sent
const checkIfNotified = () => {
    return getFromSessionStorage('notifications', 'inactivity', false);
}

//helper method to record that a notification has been served, so that it only serves it once per session
const markNotified = () => {
    const timeNotified = new Date();
    setInSessionStorage('notifications', { inactivity: timeNotified });
}

//actual react component of the alert
const InactiveNotification = () => {

}
