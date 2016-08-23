// https://github.com/erikras/ducks-modular-redux
import { fromJS } from 'immutable';
// const SAVE = 'pushNotifications/SAVE';
// const SAVE_SUCCESS = 'pushNotifications/SAVE_SUCCESS';
// const SAVE_FAIL = 'pushNotifications/SAVE_FAIL';
const SET_ACTIVE_TAB = 'pushNotifications/SET_ACTIVE_TAB';

export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

const pushNotifications = (state = fromJS({
    activeTab: 'default',
    pending: [],
    loading: false,
    error: null }), action = {}) => {
    switch (action.type) {
        // case SAVE:
        //     return state.set('loading', true);
        // case SAVE_SUCCESS:
        //     return state.set('loading', false).merge('pending', action.payload.notification);
        // case SAVE_FAIL:
        //     return state.set('loading', false).set('error', action.payload.error);
        case SET_ACTIVE_TAB:
            return state.set('ACTIVE_TAB', action.activeTab);
        default:
            return state;
    }
};

export default pushNotifications;

