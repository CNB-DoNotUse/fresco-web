import { combineReducers } from 'redux-immutable';

import moderation from './moderation';
import pushNotifs from './pushNotifs';
import user from './user';

export default combineReducers({
    moderation,
    pushNotifs,
    user,
});

