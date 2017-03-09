import createReducer from '../reducers';
import ui from '../reducers/ui';
import outlet from '../reducers/outlet';

/**
 * Creates outlet settings reducer
 */
export default createReducer({
    ui,
    outlet,
    loggedIn: (state = false, action) => state,
    hasGranted: (state = false, action) => state,
    client_id: (state = '', action) => state,
    redirect_uri: (state = '', action) => state,
    scope: (state = '', action) => state,
});