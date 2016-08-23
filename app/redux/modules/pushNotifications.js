// https://github.com/erikras/ducks-modular-redux
import { fromJS } from 'immutable';

// constants
// const SAVE = 'pushNotifications/SAVE';
// const SAVE_SUCCESS = 'pushNotifications/SAVE_SUCCESS';
// const SAVE_FAIL = 'pushNotifications/SAVE_FAIL';
const SET_ACTIVE_TAB = 'pushNotifications/SET_ACTIVE_TAB';
const UPDATE_TEMPLATE = 'pushNotifications/UPDATE_TEMPLATE';

// actions
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const updateTemplate = (template, data) => ({
    type: UPDATE_TEMPLATE,
    template,
    data,
});

// reducer
const pushNotifications = (state = fromJS({
    activeTab: 'default',
    templates: {},
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
            return state.set('activeTab', action.activeTab.toLowerCase());
        case UPDATE_TEMPLATE:
            return state.mergeIn(['templates', action.template], action.data);
        default:
            return state;
    }
};

export default pushNotifications;

