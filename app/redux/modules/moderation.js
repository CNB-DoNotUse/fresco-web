// https://github.com/erikras/ducks-modular-redux
import { fromJS, Set, OrderedSet, List, Map } from 'immutable';
import api from 'app/lib/api';
import moment from 'moment';

// constants
// action types
export const SET_ACTIVE_TAB = 'moderation/SET_ACTIVE_TAB';
export const DISMISS_ALERT = 'moderation/DISMISS_ALERT';
export const SET_ALERT = 'moderation/SET_ALERT';
export const TOGGLE_SUSPENDED_DIALOG = 'moderation/TOGGLE_SUSPENDED_DIALOG';
export const FETCH_GALLERIES = 'moderation/FETCH_GALLERIES';
export const FETCH_GALLERIES_SUCCESS = 'moderation/FETCH_GALLERIES_SUCCESS';
export const FETCH_GALLERIES_FAIL = 'moderation/FETCH_GALLERIES_FAIL';
export const FETCH_USERS = 'moderation/FETCH_USERS';
export const FETCH_USERS_SUCCESS = 'moderation/FETCH_USER_SUCCESS';
export const FETCH_USERS_FAIL = 'moderation/FETCH_USER_FAIL';
export const FETCH_SUSPENDED_USERS_SUCCESS = 'moderation/FETCH_SUSPENDED_USERS_SUCCESS';
export const FETCH_REPORTS_SUCCESS = 'moderation/FETCH_REPORTS_SUCCESS';
export const SET_REPORTS_INDEX = 'moderation/SET_REPORTS_INDEX';
export const ENABLE_FILTER = 'moderation/ENABLE_FILTER';
export const DISABLE_FILTER = 'moderation/DISABLE_FILTER';
export const TOGGLE_SUSPEND_USER = 'moderation/TOGGLE_SUSPEND_USER';
export const TOGGLE_GALLERY_GRAPHIC = 'moderation/TOGGLE_GALLERY_GRAPHIC';
export const SKIP_USER = 'moderation/SKIP_USER';
export const SKIP_GALLERY = 'moderation/SKIP_GALLERY';
export const DISABLE_USER = 'moderation/DISABLE_USER';
export const DELETE_GALLERY = 'moderation/DELETE_GALLERY';

const REPORTS_LIMIT = 10;

// action creators
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const dismissAlert = () => ({
    type: DISMISS_ALERT,
});

export const fetchSuspendedUsers = (last) => (dispatch) => {
    api
    .get('user/suspended', { last: last ? last.id : null })
    .then(res => (
        dispatch({
            type: FETCH_SUSPENDED_USERS_SUCCESS,
            data: res,
        })
    ));
};

export const fetchReports = ({ id, type, last }) => (dispatch) => {
    const urlBase = type === 'galleries' ? 'gallery' : 'user';

    api
    .get(`${urlBase}/${id}/reports`, { last: last ? last.get('id') : null, limit: REPORTS_LIMIT })
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

export const fetchGalleries = (loadMore) => (dispatch, getState) => {
    if (getState().getIn(['moderation', 'loading'])) return;
    dispatch({ type: FETCH_GALLERIES });
    let last;
    if (loadMore) last = getState().getIn(['moderation', 'galleries']).last();

    api
    .get('gallery/reported', { last: last ? last.id : null, limit: 10 })
    .then(res => {
        res.forEach(g => dispatch(fetchReports({ id: g.id, type: 'galleries' })));
        dispatch({
            type: FETCH_GALLERIES_SUCCESS,
            data: res,
        });
    })
    .catch(() => {
        dispatch({
            type: FETCH_GALLERIES_FAIL,
            data: 'Could not fetch galleries.',
        });
    });
};

export const fetchUsers = (loadMore) => (dispatch, getState) => {
    if (getState().getIn(['moderation', 'loading'])) return;
    dispatch({ type: FETCH_USERS });
    let last;
    if (loadMore) last = getState().getIn(['moderation', 'users']).last();

    api
    .get('user/reported', { last: last ? last.id : null, limit: 10 })
    .then(res => {
        res.forEach(u => dispatch(fetchReports({ id: u.id, type: 'users' })));
        dispatch({
            type: FETCH_USERS_SUCCESS,
            data: res,
        });
    })
    .catch(() => {
        dispatch({
            type: FETCH_USERS_FAIL,
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

export const updateReportsIndex = (type, id, change) => (dispatch, getState) => {
    const reportData = getState().getIn(['moderation', 'reports', type, id], Map());
    const newIndex = (reportData.get('index', 0) + change) || 0;
    const reportsSize = reportData.get('reports', List()).size;

    if (newIndex < 0) return;
    if (newIndex >= reportsSize && reportsSize < REPORTS_LIMIT) return;
    if (newIndex >= reportsSize && reportsSize % 10 !== 0) return;
    if (newIndex >= reportsSize && newIndex >= REPORTS_LIMIT) {
        dispatch(fetchReports({
            id,
            type,
            last: reportData.get('reports', OrderedSet()).last(),
        }));

        return;
    }

    dispatch({
        type: SET_REPORTS_INDEX,
        data: {
            reportsType: type,
            ownerId: id,
            index: newIndex,
        },
    });
};

export const toggleSuspendUser = (type, id) => (dispatch, getState) => {
    let user;
    if (type === 'gallery') {
        user = getState().getIn(['moderation', 'galleries']).find(g => g.id === id).owner;
    } else {
        user = getState().getIn(['moderation', 'users']).find(u => u.id === id);
    }

    if (user.suspended_until) {
        const suspended_until = null;
        api
        .post(`user/${user.id}/unsuspend`)
        .then(() => dispatch({
            type: TOGGLE_SUSPEND_USER,
            data: {
                suspended_until,
                type,
                id,
            },
        }))
        .catch(() => {
            dispatch({
                type: SET_ALERT,
                data: 'Could not unsuspend user',
            });
        });
    } else {
        const suspended_until = moment().add(1, 'week').toISOString();
        api
        .post(`user/${user.id}/suspend`, { suspended_until })
        .then(() => dispatch({
            type: TOGGLE_SUSPEND_USER,
            data: {
                suspended_until,
                type,
                id,
            },
        }))
        .catch(() => {
            dispatch({
                type: SET_ALERT,
                data: 'Could not unsuspend user',
            });
        });
    }
};

export const toggleGalleryGraphic = (id) => (dispatch, getState) => {
    const nsfw = getState().getIn(['moderation', 'galleries']).find(g => g.id === id).is_nsfw;

    api
    .post(`gallery/${id}/${nsfw ? 'sfw' : 'nsfw'}`)
    .then(() => dispatch({
        type: TOGGLE_GALLERY_GRAPHIC,
        data: {
            id,
            nsfw: !nsfw,
        },
    }))
    .catch(() => dispatch({
        type: SET_ALERT,
        data: 'Could not toggle graphic',
    }));
};

export const skipCard = (type, id) => (dispatch) => (
    api
    .post(`${type}/${id}/report/skip`)
    .then(() => dispatch({
        type: type === 'user' ? SKIP_USER : SKIP_GALLERY,
        data: id,
    }))
    .catch(() => dispatch({
        type: SET_ALERT,
        data: `Could not skip ${type}`,
    }))
);

export const deleteCard = (type, id) => (dispatch) => {
    const params = type === 'user' ? { user_id: id } : {};
    const url = type === 'user' ? 'user/disable' : `gallery/${id}/delete`;

    api
    .post(url, params)
    .then(() => dispatch({
        type: type === 'user' ? DISABLE_USER : DELETE_GALLERY,
        data: id,
    }))
    .catch(() => dispatch({
        type: SET_ALERT,
        data: (type === 'gallery') ? 'Could not delete gallery' : 'Could not disable user',
    }));
};

export const toggleSuspendedDialog = () => ({
    type: TOGGLE_SUSPENDED_DIALOG,
});

const moderation = (state = fromJS({
    activeTab: 'galleries',
    galleries: List(),
    users: List(),
    suspendedUsers: List(),
    reports: fromJS({ galleries: {}, users: {} }),
    filters: fromJS({ galleries: Set(), users: Set() }),
    loading: false,
    suspendedDialog: false,
    error: null,
    alert: null }), action = {}) => {
    switch (action.type) {
        case FETCH_GALLERIES:
        case FETCH_USERS:
            return state.set('loading', true);
        case FETCH_GALLERIES_SUCCESS:
            return state.update('galleries', g => g.concat(action.data)).set('loading', false);
        case FETCH_USERS_SUCCESS:
            return state.update('users', u => u.concat(action.data)).set('loading', false);
        case FETCH_GALLERIES_FAIL:
        case FETCH_USERS_FAIL:
            return state.set('loading', false);
        case FETCH_REPORTS_SUCCESS:
            const { type, reports, id } = action.data;
            return state
                .updateIn(['reports', type, id], Map(), r => (
                    fromJS({
                        index: r.get('index', 0),
                        reports: r.get('reports', OrderedSet()).concat(fromJS(reports)),
                    })
                ));
        case FETCH_SUSPENDED_USERS_SUCCESS:
            return state.update('suspendedUsers', s => s.concat(action.data));
        case SET_REPORTS_INDEX:
            const { reportsType, ownerId, index } = action.data;
            return state.setIn(['reports', reportsType, ownerId, 'index'], index);
        case TOGGLE_SUSPEND_USER:
            if (action.data.type === 'user') {
                return state
                    .updateIn(['users', state.get('users').findIndex(u => u.id === action.data.id)], u => (
                        Object.assign({}, u, { suspended_until: action.data.suspended_until })
                    ));
            } else if (action.data.type === 'gallery') {
                return state
                    .updateIn(['galleries', state.get('galleries').findIndex(g => g.id === action.data.id)], g => (
                        Object.assign({}, g, {
                            owner: Object.assign(g.owner, { suspended_until: action.data.suspended_until })
                        })
                    ));
            }
        case TOGGLE_SUSPENDED_DIALOG:
            return state.update('suspendedDialog', s => !s);
        case SKIP_USER:
        case DISABLE_USER:
            return state
                .deleteIn(['users', state.get('users').findIndex(u => u.id === action.data)]);
        case TOGGLE_GALLERY_GRAPHIC:
            const graphicIndex = state.get('galleries').findIndex(u => u.id === action.data.id);
            return state
                .updateIn(['galleries', graphicIndex], u => (
                    Object.assign({}, u, { is_nsfw: action.data.nsfw })
                ));
        case SKIP_GALLERY:
        case DELETE_GALLERY:
            return state
                .deleteIn([
                    'galleries', state.get('galleries').findIndex(g => g.id === action.data),
                ]);
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

