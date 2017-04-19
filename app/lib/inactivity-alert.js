import { getFromSessionStorage, setInSessionStorage } from './storage';
import React from 'react';
import api from './api';

// makes an api call to see if an assignment has been made in the last 12 hours
const checkIfInactive = () => {

}

// checks if a notification has been sent
const checkIfNotified = () => {
    return getFromSessionStorage('notifications', 'inactivity', false);
}

//helper method to record that a notification has been served, so that it only serves it once per session
const markNotified = () => {
    setInSessionStorage('notifications', { inactivity: true });
}

//actual react component of the alert
const InactiveNotification = () => {

}
