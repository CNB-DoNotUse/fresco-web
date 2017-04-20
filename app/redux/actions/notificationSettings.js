import api from 'app/lib/api';
import { toggleSnackbar } from './ui';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Action types as consant
 */
export const LOAD = 'LOAD';
export const RECEIVE_NOTIFCATIONS = 'RECEIVE_NOTIFCATIONS';
export const UPDATE = 'UPDATE';

/**
 * Action creators
 */
export const receiveNotifications = (notifications) => ({
    type: RECEIVE_NOTIFCATIONS,
    notifications
});


/**
 * Loads notifications for the outlet
 */
export const loadNotifications = () => (dispatch, getState) => {
    api
        .get('user/settings', {types_like: 'notify-outlet%'})
        .then((res) => dispatch(receiveNotifications(res)))
}

 /**
  * Updates specific notification by event key, or all locations if no index is passed
  * @param {String} option The option that is being modified
  * @param {Integer} index The index of the notificaton object to find in the array of notifs
  */
export const updateNotification = (option, index = null, e) => (dispatch, getState) => {
    const singleNotification = index !== null;
    let params = {};

    let notifications = cloneDeep(getState().notificationSettings);
    let oldNotifications = cloneDeep(getState().notificationSettings);

    if(singleNotification) {
        notifications[index].options[option] = e.target.checked;

        params = { 
            [notifications[index].type] : {
                [option]: e.target.checked
            } 
        }
    } else {
        for (let notif of notifications) {
            //Check if option is available
            if(notif['options'].hasOwnProperty(option)) {
                notif['options'][option] = e.target.checked;
                params[notif.type] = {
                    [option]: e.target.checked
                }
            }
        }
    }

    //Set new notifications, failure will set back to original state
    dispatch(receiveNotifications(notifications));

    api
        .post('user/settings/update', params)
        .catch(error => {
            //Set back due to failure
            dispatch(receiveNotifications(oldNotifications));
            dispatch(toggleSnackbar('We\'re unable to update your notifications at the moment! Please try again in a bit.', true))
        });
}
