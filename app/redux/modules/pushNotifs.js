// https://github.com/erikras/ducks-modular-redux
import api from 'app/lib/api';
import { verifyGallery, verifyUser, verifyAssignment } from 'app/lib/models';
import { fromJS, Map, List } from 'immutable';
import differenceBy from 'lodash/differenceBy';
import get from 'lodash/get';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';

// constants
// action types
export const SEND = 'pushNotifs/SEND';
export const SEND_SUCCESS = 'pushNotifs/SEND_SUCCESS';
export const SEND_FAIL = 'pushNotifs/SEND_FAIL';
export const SET_ACTIVE_TAB = 'pushNotifs/SET_ACTIVE_TAB';
export const UPDATE_TEMPLATE_SUCCESS = 'pusnNotifs/UPDATE_TEMPLATE_SUCCESS';
export const UPDATE_TEMPLATE_ERROR = 'pusnNotifs/UPDATE_TEMPLATE_ERROR';
export const DISMISS_ALERT = 'pushNotifs/DISMISS_ALERT';
export const CONFIRM_SEND = 'pushNotifs/CONFIRM_SEND';
export const CANCEL_SEND = 'pushNotifs/CANCEL_SEND';

// helpers
const getTemplateErrors = (template, getState) => {
    const templateData = getState().getIn(['pushNotifs', 'templates', template], Map());
    const missing = [];

    if (!templateData.get('title')) missing.push('Title');
    if (!templateData.get('body')) missing.push('Body');
    switch (template) {
        case 'assignment':
            if (!templateData.get('assignment')) missing.push('Assignment');
            break;
        case 'recommend':
            if (!templateData.get('gallery') && !templateData.get('story')) {
                missing.push('Gallery or Story');
            }
            break;
        case 'gallery list':
            if (!templateData.get('galleries')) missing.push('Galleries');
            break;
    }

    return missing.length
        ? `Missing required fields: ${missing.join(', ')}`
        : null;
};

const getFormDataFromTemplate = (template, getState) => (
    new Promise((resolve) => {
        const templateData = getState().getIn(['pushNotifs', 'templates', template], Map());

        const restrictByUser = templateData.get('restrictByUser', false);
        const restrictByLocation = templateData.get('restrictByLocation', false);
        let formData = templateData
            .filterNot((v, k) => ['restrictByUser', 'restrictByLocation', 'address'].includes(k))
            .filterNot((v, k) => {
                if (!restrictByUser) return k === 'users';
                if (!restrictByLocation) return ['location', 'address'].includes(k);
                return false;
            }).toJS();

        formData = mapKeys(formData, (v, k) => {
            switch (k) {
                case ('location'): return 'geo';
                case ('users'): return 'user_ids';
                case ('galleries'): return 'gallery_ids';
                case ('gallery'): 'gallery_id';
                case ('story'): return 'story_id';
                case ('assignment'): return 'assignment_id';
                default:
                    return k;
            }
        });

        formData = mapValues(formData, (v, k) => {
            switch (k) {
                case ('geo'): return { type: 'Point', coordinates: [v.lng, v.lat] };
                case ('user_ids'): return v.map(u => u.id);
                case ('gallery_ids'): return v.map(g => g.id);
                case ('gallery_id'): return v.id
                case ('story_id'): return v.id
                case ('assignment_id'): return v.id
                default:
                    return v;
            }
        });

        let templateKey;
        switch (template) {
            case 'recommend':
                if (get(formData, 'gallery_id')) templateKey = 'user-news-gallery';
                else if (get(formData, 'story_id')) templateKey = 'user-news-story';
                break;
            case 'assignment':
                templateKey = 'user-dispatch-new-assignment';
                break;
            case 'gallery list':
                templateKey = 'user-news-today-in-news';
                break;
            case 'default':
            default:
                templateKey = 'user-news-custom-push';
        }

        const templateFormData = { notification:
            { [templateKey]: omit(formData, ['geo', 'radius', 'user_ids']) },
        };
        const otherFormData = pick(formData, ['geo', 'radius', 'user_ids']);

        return resolve(Object.assign({}, templateFormData, { ...otherFormData }));
    })
);

// action creators
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const dismissAlert = () => ({
    type: DISMISS_ALERT,
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

    if (data.galleries) {
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

    if (data.users) {
        const users = getState()
            .getIn(['pushNotifs', 'templates', template, 'users'], List())
            .toJS();
        const newUser = get(differenceBy(data.users, users, 'id'), '[0]');
        if (!newUser) return dispatch(successAction);

        return verifyUser(newUser)
        .then(() => dispatch(successAction))
        .catch(() =>
            dispatch(Object.assign({}, errorAction, { data: 'Invalid user' })));
    }

    if (data.assignments) {
        const assignments = getState()
            .getIn(['pushNotifs', 'templates', template, 'assignments'], List())
            .toJS();
        const newAssignment = get(differenceBy(data.assignments, assignments, 'id'), '[0]');
        if (!newAssignment) return dispatch(successAction);

        return verifyAssignment(newAssignment)
        .then(() => dispatch(successAction))
        .catch(() =>
            dispatch(Object.assign({}, errorAction, { data: 'Invalid assignment' })));
    }

    return dispatch(successAction);
};

export const send = (template) => (dispatch, getState) => {
    dispatch({ type: SEND, template });

    const error = getTemplateErrors(template, getState);
    if (error) {
        dispatch({
            type: SEND_FAIL,
            template,
            data: error || 'Error',
        });

        return;
    }
};

export const confirmSend = (template) => (dispatch, getState) => {
    getFormDataFromTemplate(template, getState)
    .then((data) => (
        api
        .post('notifications/create', data)
        .then(res => dispatch({ type: SEND_SUCCESS, template, data: res }))
        .catch(err => dispatch({
            type: SEND_FAIL,
            template,
            data: get(err, 'responseJSON.msg', 'API error'),
        }))
    ))
    .catch((err) => (
        dispatch({
            type: SEND_FAIL,
            template,
            data: err || 'Error',
        })
    ));
};

export const cancelSend = () => ({
    type: CANCEL_SEND,
});

// reducer
const pushNotifs = (state = fromJS({
    activeTab: 'default',
    templates: {},
    loading: false,
    requestConfirmSend: false,
    error: null,
    alert: null }), action = {}) => {
    switch (action.type) {
        case SEND:
            return state
                .set('loading', true)
                .set('requestConfirmSend', true);
        case SEND_SUCCESS:
            return state
                .set('loading', false)
                .set('requestConfirmSend', false)
                .set('alert', 'Notification sent!')
                .setIn(['templates', action.template], Map());
        case SEND_FAIL:
            return state
                .set('loading', false)
                .set('requestConfirmSend', false)
                .set('alert', action.data);
        case SET_ACTIVE_TAB:
            return state.set('activeTab', action.activeTab.toLowerCase()).set('alert', null);
        case DISMISS_ALERT:
            return state.set('alert', null);
        case CANCEL_SEND:
            return state
                .set('requestConfirmSend', false)
                .set('loading', false);
        case UPDATE_TEMPLATE_SUCCESS:
            return state.mergeIn(['templates', action.template], action.data);
        case UPDATE_TEMPLATE_ERROR:
            return state.set('alert', action.data);
        default:
            return state;
    }
};

export default pushNotifs;

