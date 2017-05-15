import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import React from 'react';
import api from 'app/lib/api';

const assignmentParams = { direction: "desc", sortBy: "created_at", limit: 1 };

function past12Hours(lastAssignmentTime) {
    return (new Date() -  new Date(lastAssignmentTime) > 43200000);
}
// makes an api call to see if an assignment has been made in the last 12 hours
export const checkIfInactive = (openAlert) => {
    api.get('assignment/list', assignmentParams)
        .then((res) => {
            if (res.length > 0) {
                if (past12Hours(res[0].created_at) && !checkIfNotified()) {
                    openAlert({ content: "You haven't made an assignment in 12+ hours. Fresco works best with momentum. Expect quality responses after three consecutive days of posting assignments consistently.", timeout: 10000 });
                    markNotified();
                }
            }
        })
        .catch((err) => {
            console.log(err);
            console.log("Could not get latest assignment data");
        });
}

// checks if there is a record of an inactivity alert in the session storage
const checkIfNotified = () => {
    if (getFromSessionStorage('notifications', 'inactivity', false)) {
        return !past12Hours(getFromSessionStorage('notifications','inactivity'));
    } else {
        return false;
    }
}

//helper method to record that a notification has been served, so that it only serves it once per session
const markNotified = () => {
    const timeNotified = new Date().toString();
    setInSessionStorage('notifications', { inactivity: timeNotified });

}
