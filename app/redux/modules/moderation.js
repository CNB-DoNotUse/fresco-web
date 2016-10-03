// https://github.com/erikras/ducks-modular-redux
import { fromJS } from 'immutable';

// constants
// action types
export const SET_ACTIVE_TAB = 'pushNotifs/SET_ACTIVE_TAB';
export const DISMISS_ALERT = 'pushNotifs/DISMISS_ALERT';

// action creators
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

const moderation = (state = fromJS({
    activeTab: 'GALLERIES',
    loading: false,
    error: null,
    alert: null }), action = {}) => {
    switch (action.type) {
        case SET_ACTIVE_TAB:
            return state
                .set('activeTab', action.activeTab.toLowerCase())
                .set('alert', null);
        case DISMISS_ALERT:
            return state.set('alert', null);
        default:
            return state;
    }
};

export default moderation;
