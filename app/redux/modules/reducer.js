import { combineReducers } from 'redux-immutable';

import moderation from './moderation';
import pushNotifs from './pushNotifs';
import user from './user';
import searchParams from './SearchParams_reducer';
import stories from './stories_reducer';

/**
 * Old main reducer.
 * Reducers should loaded from the reducers directory
 */
export default combineReducers({
    moderation,
    pushNotifs,
    user,
    searchParams,
    stories
});
