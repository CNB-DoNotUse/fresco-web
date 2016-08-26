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
const nonDataKeys = ['restrictByUser', 'restrictByLocation', 'error'];

// actions
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const confirmError = () => ({
    type: CONFIRM_ERROR,
});

export const updateTemplate = (template, data) => (dispatch, getState) => {
    const success = {
        type: UPDATE_TEMPLATE_SUCCESS,
        template,
        data,
    };
    const error = {
        type: UPDATE_TEMPLATE_ERROR,
        template,
        data: 'There was an error updating the template',
    };

    if (data.hasOwnProperty('galleries')) {
        const galleries = getState()
            .getIn(['pushNotifs', 'templates', template, 'galleries'], List())
            .toJS();
        const newGallery = get(differenceBy(data.galleries, galleries, 'id'), '[0]');
        if (!newGallery) return dispatch(error);

        return verifyGallery(newGallery)
        .then(() => dispatch(success))
        .catch(() =>
            dispatch(Object.assign({}, error, { data: 'Invalid gallery id.' })));
    }

    return dispatch(success);
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
            // data: get(err, 'responseJSON.msg', 'API error'),
            // TODO: temp for demo purposes
            data: JSON.stringify(data, null, '\t'),
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

