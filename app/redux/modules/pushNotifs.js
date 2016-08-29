// https://github.com/erikras/ducks-modular-redux
import api from 'app/lib/api';
import { verifyGallery } from 'app/lib/gallery';
import { fromJS, Map, List } from 'immutable';
import differenceBy from 'lodash/differenceBy';
import get from 'lodash/get';

// constants
const SEND = 'pushNotifs/SEND';
const SEND_SUCCESS = 'pushNotifs/SEND_SUCCESS';
const SEND_FAIL = 'pushNotifs/SEND_FAIL';
const SET_ACTIVE_TAB = 'pushNotifs/SET_ACTIVE_TAB';
// const UPDATE_TEMPLATE = 'pushNotifs/UPDATE_TEMPLATE';
const UPDATE_TEMPLATE_SUCCESS = 'pusnNotifs/UPDATE_TEMPLATE_SUCCESS';
const UPDATE_TEMPLATE_ERROR = 'pusnNotifs/UPDATE_TEMPLATE_ERROR';
const CONFIRM_ERROR = 'pushNotifs/CONFIRM_ERROR';

// keys irrelevant to api
const nonDataKeys = ['restrictByUser', 'restrictByLocation'];

// actions
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const confirmError = () => ({
    type: CONFIRM_ERROR,
});

export const updateTemplate = (template, data) => (dispatch, getState) => {
    const successAction = {
        type: UPDATE_TEMPLATE_SUCCESS,
        template,
        data,
    };
    const errorAction = {
        type: UPDATE_TEMPLATE_ERROR,
        template,
        data: 'There was an error updating the template',
    };

    if (get(data, 'galleries')) {
        const galleries = getState()
            .getIn(['pushNotifs', 'templates', template, 'galleries'], List())
            .toJS();
        const newGallery = get(differenceBy(data.galleries, galleries, 'id'), '[0]');
        if (!newGallery) return dispatch(successAction);

        return verifyGallery(newGallery)
        .then(() => dispatch(successAction))
        .catch(() =>
            dispatch(Object.assign({}, errorAction, { data: 'Invalid gallery id' })));
    }

    return dispatch(successAction);
};

export const send = (template) => (dispatch, getState) => {
    dispatch({ type: SEND, template });
    const data = getState()
        .getIn(['pushNotifs', 'templates', template], Map())
        .filterNot((v, k) => nonDataKeys.includes(k))
        .toJS();

    return api
        .post('push/create', data)
        .then(res => dispatch({ type: SEND_SUCCESS, template, data: res }))
        .catch(err => dispatch({
            type: SEND_FAIL,
            template,
            data: get(err, 'responseJSON.msg', 'API error'),
        }));
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
        case CONFIRM_ERROR:
            return state.set('error', null);
        case UPDATE_TEMPLATE_SUCCESS:
            return state.mergeIn(['templates', action.template], action.data)
        case UPDATE_TEMPLATE_ERROR:
            return state.set('error', action.data);
        default:
            return state;
    }
};

export default pushNotifs;

