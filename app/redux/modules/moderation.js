// https://github.com/erikras/ducks-modular-redux
import { fromJS, OrderedSet, Set, List } from 'immutable';
import api from 'app/lib/api';

// constants
// action types
export const SET_ACTIVE_TAB = 'moderation/SET_ACTIVE_TAB';
export const DISMISS_ALERT = 'moderation/DISMISS_ALERT';
export const SET_ALERT = 'moderation/SET_ALERT';
export const FETCH_GALLERIES_SUCCESS = 'moderation/FETCH_GALLERIES_SUCCESS';
export const FETCH_USERS_SUCCESS = 'moderation/FETCH_USER_SUCCESS';
export const FETCH_REPORTS_SUCCESS = 'moderation/FETCH_REPORTS_SUCCESS';
export const ENABLE_FILTER = 'moderation/ENABLE_FILTER';
export const DISABLE_FILTER = 'moderation/DISABLE_FILTER';

// action creators
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const fetchReports = ({ id, type }) => (dispatch, getState) => {
    const last = getState().getIn(['moderation', 'reports', type, id], List()).last();
    const urlBase = type === 'galleries' ? 'gallery' : 'user';
    api
    .get(`${urlBase}/${id}/reports`, { last: last ? last.id : null, limit: 10 })
    .then(res => {
        dispatch({
            type: FETCH_REPORTS_SUCCESS,
            data: {
                reports: res,
                type,
                id,
            },
        });
    })
    .catch(() => {
        dispatch({
            type: SET_ALERT,
            data: 'Could not fetch reports',
        });
    });
};

export const fetchGalleries = (params = {}) => (dispatch, getState) => {
    const last = getState().getIn(['moderation', 'galleries']).last();
    api
    .get('gallery/reported', Object.assign(params, { last: last ? last.id : null }))
    .then(res => {
        res.forEach(g => dispatch(fetchReports({ id: g.id, type: 'galleries' })));
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
        res.forEach(u => dispatch(fetchReports({ id: u.id, type: 'users' })));
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

export const dismissAlert = () => ({
    type: DISMISS_ALERT,
});

const moderation = (state = fromJS({
    activeTab: 'galleries',
    galleries: OrderedSet(),
    users: OrderedSet(),
    reports: fromJS({ galleries: {}, users: {} }),
    filters: fromJS({ galleries: Set(), users: Set() }),
    loading: false,
    error: null,
    alert: null }), action = {}) => {
    switch (action.type) {
        case FETCH_GALLERIES_SUCCESS:
            return state.update('galleries', g => g.concat(action.data));
        case FETCH_USERS_SUCCESS:
            return state.update('users', u => u.concat(action.data));
        case FETCH_REPORTS_SUCCESS:
            const { type, reports, id } = action.data;
            return state
                .updateIn(['reports', type, id], OrderedSet(), r => r.concat(reports));
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

