// https://github.com/erikras/ducks-modular-redux
import { fromJS, OrderedSet, Set } from 'immutable';
import api from 'app/lib/api';

// constants
// action types
export const SET_ACTIVE_TAB = 'moderation/SET_ACTIVE_TAB';
export const DISMISS_ALERT = 'moderation/DISMISS_ALERT';
export const SET_ALERT = 'moderation/DISMISS_ALERT';
export const FETCH_GALLERIES_SUCCESS = 'moderation/FETCH_GALLERIES_SUCCESS';
export const FETCH_USERS_SUCCESS = 'moderation/FETCH_USER_SUCCESS';
export const ENABLE_FILTER = 'moderation/ENABLE_FILTER';
export const DISABLE_FILTER = 'moderation/DISABLE_FILTER';

// action creators
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const fetchGalleries = (params = {}) => (dispatch, getState) => {
    const last = getState().getIn(['moderation', 'galleries']).last();
    api
    .get('gallery/reported', Object.assign(params, { last: last ? last.id : null }))
    .then(res => {
        dispatch({
            type: FETCH_GALLERIES_SUCCESS,
            data: res,
        });
    })
    .catch(() => {
        dispatch({
            type: SET_ALERT,
            data: 'Could not fetch galleries.',
        });
    });
};

export const fetchUsers = (params = {}) => (dispatch, getState) => {
    const last = getState().getIn(['moderation', 'users']).last();
    api
    .get('user/reported', Object.assign(params, { last: last ? last.id : null }))
    .then(res => {
        dispatch({
            type: FETCH_USERS_SUCCESS,
            data: res,
        });
    })
    .catch(() => {
        dispatch({
            type: SET_ALERT,
            data: 'Could not fetch users.',
        });
    });
};

export const toggleFilter = (tab, filter) => (dispatch, getState) => {
    const activeFilters = getState().getIn(['moderation', 'filters', tab]);

    if (activeFilters.includes(filter)) {
        dispatch({
            type: DISABLE_FILTER,
            tab,
            filter,
        });
    } else {
        dispatch({
            type: ENABLE_FILTER,
            tab,
            filter,
        });
    }
};

const moderation = (state = fromJS({
    activeTab: 'galleries',
    galleries: OrderedSet(),
    users: OrderedSet(),
    filters: fromJS({ galleries: Set(), users: Set() }),
    loading: false,
    error: null,
    alert: null }), action = {}) => {
    switch (action.type) {
        case FETCH_GALLERIES_SUCCESS:
            return state.update('galleries', g => g.concat(action.data));
        case FETCH_USERS_SUCCESS:
            return state.update('users', u => u.concat(action.data));
        case ENABLE_FILTER:
            return state.updateIn(['filters', action.tab], f => f.add(action.filter));
        case DISABLE_FILTER:
            return state.updateIn(['filters', action.tab], f => f.delete(action.filter));
        case SET_ACTIVE_TAB:
            return state
                .set('activeTab', action.activeTab.toLowerCase())
                .set('alert', null);
        case SET_ALERT:
            return state.set('alert', action.data);
        case DISMISS_ALERT:
            return state.set('alert', null);
        default:
            return state;
    }
};

export default moderation;

