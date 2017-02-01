import { combineReducers } from 'redux';
import moderation from './moderation';
import pushNotifs from './pushNotifs';

export default combineReducers({
    user,
    outlet,
    ui,
    notificationSettings,
    outletSettings,
    clients
});