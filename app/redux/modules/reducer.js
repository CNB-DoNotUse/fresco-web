import { combineReducers } from 'redux';

import pushNotifications from './pushNotifications';
import user from './user';

export default combineReducers({
    pushNotifications,
    user,
});

