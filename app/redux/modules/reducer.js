import { combineReducers } from 'redux-immutable';

import pushNotifs from './pushNotifs';
import user from './user';

export default combineReducers({
    pushNotifs,
    user,
});

