import * as actions from '../actions/notificationSettings';

/**
 * Notification reducer
 */
 const notificationSettings = (state = [], action) => {
    switch (action.type) {
        case actions.RECEIVE_NOTIFCATIONS:
            return action.notifications
        default:
            return state
    }
}


export default notificationSettings;