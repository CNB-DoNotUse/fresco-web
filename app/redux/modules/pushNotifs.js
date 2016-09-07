// https://github.com/erikras/ducks-modular-redux
import api from 'app/lib/api';
import { verifyGallery } from 'app/lib/gallery';
import { fromJS, Map, List } from 'immutable';
import differenceBy from 'lodash/differenceBy';
import get from 'lodash/get';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';

// constants
// action types
const SEND = 'pushNotifs/SEND';
const SEND_SUCCESS = 'pushNotifs/SEND_SUCCESS';
const SEND_FAIL = 'pushNotifs/SEND_FAIL';
const SET_ACTIVE_TAB = 'pushNotifs/SET_ACTIVE_TAB';
const UPDATE_TEMPLATE_SUCCESS = 'pusnNotifs/UPDATE_TEMPLATE_SUCCESS';
const UPDATE_TEMPLATE_ERROR = 'pusnNotifs/UPDATE_TEMPLATE_ERROR';
const CONFIRM_ERROR = 'pushNotifs/CONFIRM_ERROR';

// helpers
const getDataFromTemplate = (template, getState) => {
    const templateData = getState()
        .getIn(['pushNotifs', 'templates', template], Map());
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
            case('users'): return 'user_ids';
            case('galleries'): return 'gallery_ids';
            case('gallery'): 'gallery_id';
            case ('story'): return 'story_id';
            default:
                return k;
        }
    });

    formData = mapValues(formData, (v, k) => {
        if (k === 'geo') return { type: 'Point', coordinates: [v.lng, v.lat] };
        if (k === 'user_ids') return v.map(u => u.id);
        return v;
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

    return Object.assign({}, templateFormData, { ...otherFormData });
};

// action creators
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

    const data = getDataFromTemplate(template, getState);
    return api
        .post('notifications/create', data)
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
            return state.set('loading', false);
        case SEND_FAIL:
            return state.set('loading', false).set('error', action.data);
        case SET_ACTIVE_TAB:
            return state.set('activeTab', action.activeTab.toLowerCase());
        case CONFIRM_ERROR:
            return state.set('error', null);
        case UPDATE_TEMPLATE_SUCCESS:
            return state.mergeIn(['templates', action.template], action.data);
        case UPDATE_TEMPLATE_ERROR:
            return state.set('error', action.data);
        default:
            return state;
    }
};

export default pushNotifs;

