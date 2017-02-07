import { combineReducers } from 'redux-immutable';

import moderation from './moderation';
import pushNotifs from './pushNotifs';
import user from './user';

/**
 * Old main reducer. 
 * Reducers should loaded from the reducers directory
 */
export default combineReducers({
    moderation,
    pushNotifs,
    user
});
