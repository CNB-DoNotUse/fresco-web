// https://github.com/erikras/ducks-modular-redux
import api from 'app/lib/api';
import { fromJS, Map } from 'immutable';

// constants
const SEND = 'pushNotifs/SEND';
const SEND_SUCCESS = 'pushNotifs/SEND_SUCCESS';
const SEND_FAIL = 'pushNotifs/SEND_FAIL';
const SET_ACTIVE_TAB = 'pushNotifs/SET_ACTIVE_TAB';
const UPDATE_TEMPLATE = 'pushNotifs/UPDATE_TEMPLATE';

// keys irrelevant to api
const nonDataKeys = ['restrictByUser', 'restrictByLocation'];

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

export const send = (template) => (dispatch, getState) => {
    dispatch({ type: SEND, template });
    const data = getState()
        .getIn(['pushNotifs', template], Map())
        .filterNot((v, k) => (nonDataKeys.includes(k)))
        .toJS();

    return api
        .post('push/create', data)
        .then(res => dispatch({ type: SEND_SUCCESS, data: res }))
        .catch(err => dispatch({ type: SEND_FAIL, data: err }));
};

// reducer
const pushNotifs = (state = fromJS({
    activeTab: 'default',
    templates: {},
    loading: false,
    error: null }), action = {}) => {
    switch (action.type) {
        case SEND:
            return state.set('loading', true);
        case SEND_SUCCESS:
            return state.set('loading', false)
        case SEND_FAIL:
            return state.set('loading', false).set('error', action.data);
        case SET_ACTIVE_TAB:
            return state.set('activeTab', action.activeTab.toLowerCase());
        case UPDATE_TEMPLATE:
            return state.mergeIn(['templates', action.template], action.data);
        default:
            return state;
    }
};

export default pushNotifs;

