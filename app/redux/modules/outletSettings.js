import createReducer from '../reducers';
import user from '../reducers/user';
import outlet from '../reducers/outlet';
import ui from '../reducers/ui';
import notificationSettings from '../reducers/notificationSettings'
import clients from '../reducers/clients';
import versions from '../reducers/versions';

/**
 * Creates outlet settings reducer
 */
export default createReducer({
    user,
    outlet,
    ui,
    notificationSettings,
    clients,
    versions
});