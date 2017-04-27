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
import utils from 'utils';

// constants
// action types
export const SEND = 'pushNotifs/SEND';
export const SEND_SUCCESS = 'pushNotifs/SEND_SUCCESS';
export const SEND_FAIL = 'pushNotifs/SEND_FAIL';
export const SET_ACTIVE_TAB = 'pushNotifs/SET_ACTIVE_TAB';
export const UPDATE_TEMPLATE_SUCCESS = 'pushNotifs/UPDATE_TEMPLATE_SUCCESS';
export const UPDATE_TEMPLATE_ERROR = 'pushNotifs/UPDATE_TEMPLATE_ERROR';
export const DISMISS_ALERT = 'pushNotifs/DISMISS_ALERT';
export const CONFIRM_SEND = 'pushNotifs/CONFIRM_SEND';
export const CANCEL_SEND = 'pushNotifs/CANCEL_SEND';
export const CLOSE_INFO_DIALOG = 'pushNotifs/CLOSE_INFO_DIALOG';

// helpers

/**
* Determines the state of location and users filters,
* whether the filters are checked and if specific locations and users have been
* selected
* @param {object} template taken from redux state which is the template info
* @return {object} that determines which filters have been selected and if specific
*     details have been chosen
*/
export const getTemplateState = (template) => ({
    restrictByUser: get(template, 'restrictByUser', false),
    restrictByLocation: get(template, 'restrictByLocation', false),
    usersSelected: get(template, 'users', false),
    locationSelected: get(template, 'location', false),
});


/**
* Determines the errors on the template and gives an error messages
* @param {string} template name of the template
* @return {string} msg error message, empty if there are no errors
*/
const getTemplateErrors = (template, getState) => {
    const templateData = getState().getIn(['pushNotifs', 'templates', template], Map());
    const {restrictByUser,
        restrictByLocation,
        usersSelected,
        locationSelected} = getTemplateState(templateData.toJS());
    const missing = [];
    const errors = [];
    let msg = '';

    if (!templateData.get('title') && template !== "support") missing.push('Title');
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
    default:
        break;
    }

    if (restrictByLocation && !locationSelected) missing.push('Specific location');
    if (restrictByUser && (!usersSelected || usersSelected.length === 0)) {
        missing.push('Specific user');
    }

    if (restrictByLocation && templateData.get('radius') < 250) {
        errors.push('Radius must be at least 250ft');
    }
    if (missing.length) msg = `Missing required fields: ${missing.join(', ')}`;
    errors.forEach(e => { msg = msg.concat(`\n${e}`); });

    return msg;
};

/**
* Packages template data into a promise
*/
const getFormDataFromTemplate = (template, state) => (
    new Promise((resolve) => {
        const templateData = state.getIn(['templates', template], Map());
        const {restrictByUser, restrictByLocation} = getTemplateState(templateData.toJS());

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
            case ('gallery'): return 'gallery_id';
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
            case ('gallery_id'): return v.id;
            case ('story_id'): return v.id;
            case ('assignment_id'): return v.id;
            case ('radius'): return utils.feetToMiles(v);
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

        const templateFormData = { type: templateKey};
        const otherFormData = {recipients: pick(formData, ['geo', 'radius', 'user_ids']),
            content: omit(formData, ['geo', 'radius', 'source', 'user_ids'])};

        // there may be a better way to package for support request
        if (template === "support") {
            const body = otherFormData.content;
            const user_id = { user_id: otherFormData.recipients.user_ids[0]}
            return resolve(Object.assign({}, body, user_id));
        }
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

const verifyDefaultUpdate = ({ data, state }) => {
    return new Promise((resolve, reject) => {
        if (!data.users) return resolve();
        if (data.users) {
            const users = state.get('users', List()).toJS();
            const newUser = get(differenceBy(data.users, users, 'id'), '[0]');
            if (!newUser) return resolve();

            verifyUser(newUser)
                .then(() => resolve())
                .catch(() => reject('Invalid user'));
        }
    });
};

const verifyGalleryListUpdate = ({ data, state }) => {
    return new Promise((resolve, reject) => {
        if (!data.galleries) return resolve();
        if (data.galleries) {
            const galleries = state.get('galleries', List()).toJS();
            const newGallery = get(differenceBy(data.galleries, galleries, 'id'), '[0]');
            if (!newGallery) return resolve();

            verifyGallery(newGallery)
                .then(() => resolve())
                .catch(() => reject('Invalid gallery id'));
        }
    });
};

const verifyAssignmentUpdate = ({ data }) => {
    return new Promise((resolve, reject) => {
        if (!data.assignment) return resolve();

        if (data.assignment) {
            if (data.assignment.id && data.assignment.title) return resolve();
            verifyAssignment({ id: data.assignment.title })
                .then(resolve)
                .catch(() => reject('Invalid assignment'));
        }
    });
};

const verifyRecommendUpdate = ({ data, state }) => {
    return new Promise((resolve, reject) => {
        if (!data.story && !data.gallery) return resolve();
        if (data.gallery) {
            if (state.get('story')) {
                return reject('Can only recommend one gallery or story');
            }

            verifyGallery(data.gallery)
                .then(() => resolve())
                .catch(() => reject('Invalid gallery id'));
        }

        if (data.story) {
            if (state.get('gallery')) {
                return reject('Can only recommend one of gallery or story');
            }
            return resolve();
        }
    });
};

export const updateTemplate = (template, data) => ({
    type: UPDATE_TEMPLATE_SUCCESS,
    template,
    data,
});

export const updateTemplateAsync = (template, data) => (dispatch, getState) => {
    const successAction = {
        type: UPDATE_TEMPLATE_SUCCESS,
        template,
        data,
    };
    const errorAction = {
        type: UPDATE_TEMPLATE_ERROR,
        template,
        msg: 'There was an error updating the template',
    };

    const state = getState().getIn(['pushNotifs', 'templates', template], Map());

    switch (template) {
    case 'recommend':
        return verifyDefaultUpdate({ data, state })
        .then(() => verifyRecommendUpdate({ data, state }))
        .then(() => dispatch(successAction))
        .catch(msg => dispatch(Object.assign({}, errorAction, { msg })));
    case 'assignment':
        return verifyDefaultUpdate({ data, state })
        .then(() => verifyAssignmentUpdate({ data }))
        .then(() => {
            dispatch(successAction);
            // use title and body from assignment if in data
            if (data.assignment) {
                const { title, body } = data.assignment;
                dispatch({
                    type: UPDATE_TEMPLATE_SUCCESS,
                    template,
                    data: { title, body },
                });
            }
        })
        .catch(msg => dispatch(Object.assign({}, errorAction, { msg })));
    case 'gallery list':
        return verifyDefaultUpdate({ data, state })
        .then(() => verifyGalleryListUpdate({ data, state }))
        .then(() => dispatch(successAction))
        .catch(msg => dispatch(Object.assign({}, errorAction, { msg })));
    default:
        return verifyDefaultUpdate({ data, state })
        .then(() => dispatch(successAction))
        .catch(msg => dispatch(Object.assign({}, errorAction, { msg })));
    }
};

export const send = (template) => (dispatch, getState) => {
    const error = getTemplateErrors(template, getState);
    if (error) {
        dispatch({
            type: SEND_FAIL,
            template,
            data: error || 'Error',
        });

        return;
    }

    dispatch({ type: SEND, template });
};

/**
* Determines what messages have been sent
* @param {number} count is expected from the notifications/create endpoint, which
*   represents how many individual push notifications were sent, if attribute is
*   missing, then it is assumed that notifications/smooch (chat) was used
* @return {string} message confirming type and quantity of notifications
*/
const getSuccessMsg = (count) => {
    // conditional for smooch notifications
    if (count) {
        if (count === 1) return `${count} push`;
        return `${count} pushes`;
    } else if (count === 0) {
        return "However, no users satisfied your filters";
    }
    return "1 chat";
};

export const confirmSend = (template) => (dispatch, getState) => {
    const state = getState().get('pushNotifs');
    if (state.get('loading')) return;
    dispatch({ type: CONFIRM_SEND });

    const route = template === "support" ? 'notifications/smooch' : 'notifications/user/create';

    getFormDataFromTemplate(template, state)
    .then((data) => (
        api
        .post(route, data)
        .then(res => {
            dispatch({
                type: SEND_SUCCESS,
                template,
                header: 'Notification sent',
                body: getSuccessMsg(res.count),
            });
        })
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

export const closeInfoDialog = () => ({
    type: CLOSE_INFO_DIALOG,
});

// reducer
const pushNotifs = (state = fromJS({
    activeTab: 'default',
    templates: { 'default': {restrictByLocation: false, restrictByUser: true} },
    infoDialog: {},
    loading: false,
    requestConfirmSend: false,
    error: null,
    alert: null }), action = {}) => {

    switch (action.type) {
        case SEND:
            return state.set('requestConfirmSend', true);
        case CONFIRM_SEND:
            return state.set('loading', true);
        case SEND_SUCCESS:
            return state
                .set('loading', false)
                .set('requestConfirmSend', false)
                .set('alert', 'Notification sent!')
                .setIn(['templates', action.template], fromJS({restrictByLocation: false, restrictByUser: true}))
                .set('infoDialog', fromJS({
                    visible: true,
                    header: action.header,
                    body: action.body,
                }));
        case CLOSE_INFO_DIALOG:
            return state.set('infoDialog', fromJS({ visible: false }));
        case SEND_FAIL:
            return state
                .set('loading', false)
                .set('requestConfirmSend', false)
                .set('alert', action.data);
        case SET_ACTIVE_TAB:
            const lowerCaseTemp = action.activeTab.toLowerCase();
            return state
                .set('activeTab', lowerCaseTemp)
                .delete('templates')
                .setIn(['templates', lowerCaseTemp], fromJS({restrictByLocation: false, restrictByUser: true}))
                .set('alert', null);
        case DISMISS_ALERT:
            return state.set('alert', null);
        case CANCEL_SEND:
            return state
                .set('requestConfirmSend', false)
                .set('loading', false);
        case UPDATE_TEMPLATE_SUCCESS:
            return state.mergeIn(['templates', action.template], action.data);
        case UPDATE_TEMPLATE_ERROR:
            return state.set('alert', action.msg);
        default:
            return state;
    }
};

export default pushNotifs;
