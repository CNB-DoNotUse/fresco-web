import { combineReducers } from 'redux-immutable';

import pushNotifications from './pushNotifications';
import user from './user';

export default combineReducers({
    pushNotifications,
    user,
});

