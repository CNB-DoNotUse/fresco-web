import { combineReducers } from 'redux';

import moderation from './moderation';
import pushNotifs from './pushNotifs';
import user from '../reducers/user';
import outlet from '../reducers/outlet';
import ui from '../reducers/ui';
import notificationSettings from '../reducers/notificationSettings'
import outletSettings from '../reducers/outletSettings';
import clients from '../reducers/clients';

export default combineReducers({
    user,
    outlet,
    ui,
    notificationSettings,
    outletSettings,
    clients
});