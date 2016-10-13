// https://github.com/erikras/ducks-modular-redux
import { combineReducers } from 'redux-immutable';
import { fromJS, Set, OrderedSet, List, Map } from 'immutable';
import api from 'app/lib/api';
import moment from 'moment';

// constants
// action types
export const SET_ACTIVE_TAB = 'moderation/SET_ACTIVE_TAB';
export const DISMISS_ALERT = 'moderation/DISMISS_ALERT';
export const SET_ALERT = 'moderation/SET_ALERT';
export const TOGGLE_SUSPENDED_DIALOG = 'moderation/TOGGLE_SUSPENDED_DIALOG';
export const TOGGLE_INFO_DIALOG = 'moderation/TOGGLE_INFO_DIALOG';
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
export const RESTORE_SUSPENDED_USER = 'moderation/RESTORE_SUSPENDED_USER';
export const DELETE_CARD = 'moderation/DELETE_CARD';

const REPORTS_LIMIT = 10;

// action creators
export const setActiveTab = (activeTab) => ({
    type: SET_ACTIVE_TAB,
    activeTab,
});

export const dismissAlert = () => ({
    type: DISMISS_ALERT,
});

export const toggleSuspendedDialog = () => ({
    type: TOGGLE_SUSPENDED_DIALOG,
});

export const toggleInfoDialog = ({ open = false, header = '', body = '' }) => ({
    type: TOGGLE_INFO_DIALOG,
    open,
    header,
    body,
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

export const fetchReports = ({ id, entity, last }) => (dispatch) => {
    const urlBase = entity === 'galleries' ? 'gallery' : 'user';

    api
    .get(`${urlBase}/${id}/reports`, { last: last ? last.get('id') : null, limit: REPORTS_LIMIT })
    .then(res => {
        dispatch({
            type: FETCH_REPORTS_SUCCESS,
            reports: res,
            entity,
            id,
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
    const state = getState().getIn(['moderation', 'galleries']);
    if (state.get('loading')) return;
    dispatch({ type: FETCH_GALLERIES });

    let last;
    if (loadMore) last = state.get('entities').last();

    api
    .get('gallery/reported', { last: last ? last.id : null, limit: 10 })
    .then(res => {
        res.forEach(g => dispatch(fetchReports({ id: g.id, entity: 'galleries' })));
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
    const state = getState().getIn(['moderation', 'users']);
    if (state.get('loading')) return;
    dispatch({ type: FETCH_USERS });

    let last;
    if (loadMore) last = state.get('entities').last();

    api
    .get('user/reported', { last: last ? last.id : null, limit: 10 })
    .then(res => {
        res.forEach(u => dispatch(fetchReports({ id: u.id, entity: 'users' })));
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
    const activeFilters = getState().getIn(['moderation', 'ui', 'filters', tab]);

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

export const updateReportsIndex = (entity, id, change) => (dispatch, getState) => {
    const reportData = getState().getIn(['moderation', 'reports', entity, id], Map());
    const newIndex = (reportData.get('index', 0) + change) || 0;
    const reportsSize = reportData.get('reports', List()).size;

    if (newIndex < 0) return;
    if (newIndex >= reportsSize && reportsSize < REPORTS_LIMIT) return;
    if (newIndex >= reportsSize && reportsSize % 10 !== 0) return;
    if (newIndex >= reportsSize && newIndex >= REPORTS_LIMIT) {
        dispatch(fetchReports({
            id,
            entity,
            last: reportData.get('reports', OrderedSet()).last(),
        }));

        return;
    }

    dispatch({
        type: SET_REPORTS_INDEX,
        reportsType: entity,
        ownerId: id,
        index: newIndex,
    });
};

export const toggleSuspendUser = (entity, id) => (dispatch, getState) => {
    const state = getState().get('moderation');
    let user;
    let suspended_until = null;
    if (entity === 'gallery') {
        user = state
            .getIn(['galleries', 'entities'])
            .find(g => g.get('id') === id)
            .get('owner');
    } else {
        user = state.getIn(['users', 'entities']).find(u => u.get('id') === id);
    }

    if (user.get('suspended_until')) {
        api
        .post(`user/${user.get('id')}/unsuspend`)
        .then(() => dispatch({
            type: TOGGLE_SUSPEND_USER,
            suspended_until,
            entity,
            id,
        }))
        .catch(() => dispatch({
            type: SET_ALERT,
            data: 'Could not unsuspend user',
        }))
        .then(() => dispatch(fetchSuspendedUsers()));
    } else {
        suspended_until = moment().add(2, 'week').toISOString();
        api
        .post(`user/${user.get('id')}/suspend`, { suspended_until })
        .then(() => {
            dispatch({
                type: TOGGLE_SUSPEND_USER,
                suspended_until,
                entity,
                id,
            });

            const name = user.get('username') ? `@${user.get('username')}` : user.get('full_name');
            dispatch(toggleInfoDialog({
                open: true,
                header: `Suspend ${name}`,
                body: `${name} will be given a 14-day suspension, which can be canceled at any time.`,
            }));
        })
        .catch(() => dispatch({
            type: SET_ALERT,
            data: 'Could not unsuspend user',
        }))
        .then(() => dispatch(fetchSuspendedUsers()));
    }
};

export const restoreSuspendedUser = (id) => (dispatch, getState) => {
    const user = getState()
        .getIn(['moderation', 'suspendedUsers', 'entities'])
        .find(u => u.id === id);

    api
    .post(`user/${user.get('id')}/unsuspend`)
    .then(() => dispatch({
        type: RESTORE_SUSPENDED_USER,
        id,
    }))
    .catch(() => dispatch({
        type: SET_ALERT,
        data: 'Could not restore user',
    }));
};

export const toggleGalleryGraphic = (id) => (dispatch, getState) => {
    const nsfw = getState().getIn(['moderation', 'galleries', 'entities']).find(g => g.id === id).is_nsfw;

    api
    .post(`gallery/${id}/${nsfw ? 'sfw' : 'nsfw'}`)
    .then(() => dispatch({
        type: TOGGLE_GALLERY_GRAPHIC,
        id,
        nsfw: !nsfw,
    }))
    .catch(() => dispatch({
        type: SET_ALERT,
        data: 'Could not toggle graphic',
    }));
};

export const skipCard = (entity, id) => (dispatch) => (
    api
    .post(`${entity}/${id}/report/skip`)
    .then(() => dispatch({
        type: DELETE_CARD,
        id,
        entity,
    }))
    .catch(() => dispatch({
        type: SET_ALERT,
        data: `Could not skip ${entity}`,
    }))
);

export const deleteCard = (entity, id) => (dispatch) => {
    const params = entity === 'user' ? { user_id: id } : {};
    const url = entity === 'user' ? 'user/disable' : `gallery/${id}/delete`;

    api
    .post(url, params)
    .then(() => dispatch({
        type: DELETE_CARD,
        id,
        entity,
    }))
    .catch(() => dispatch({
        type: SET_ALERT,
        data: (entity === 'gallery') ? 'Could not delete gallery' : 'Could not disable user',
    }));
};

const gallery = (state, action) => {
    if (state.get('id') !== action.id) {
        return state;
    }
    switch (action.type) {
    case TOGGLE_SUSPEND_USER:
        return state.mergeIn(['owner'], { suspended_until: action.suspended_until });
    case TOGGLE_GALLERY_GRAPHIC:
        return state.set('is_nsfw', action.nsfw);
    default:
        return state;
    }
};

const galleries = (state = fromJS({
    entities: OrderedSet(),
    loading: false,
}), action = {}) => {
    if (action.entity && action.entity !== 'gallery') return state;

    switch (action.type) {
    case FETCH_GALLERIES_SUCCESS:
        return state.update('entities', g => g.concat(fromJS(action.data)));
    case FETCH_GALLERIES_FAIL:
        return state.set('loading', false);
    case TOGGLE_GALLERY_GRAPHIC:
        return state.update('entities', es => es.map(e => gallery(e, action)));
    case TOGGLE_SUSPEND_USER:
        return state.update('entities', es => es.map(e => gallery(e, action)));
    case DELETE_CARD:
        return state.update('entities', es => es.filterNot(e => e.get('id') === action.id));
    default:
        return state;
    }
};

const user = (state, action) => {
    switch (action.type) {
    case TOGGLE_SUSPEND_USER:
        if (state.id !== action.id) {
            return state;
        }
        return state.set('suspended_until', action.suspended_until);
    default:
        return state;
    }
};

const users = (state = fromJS({
    entities: OrderedSet(),
    loading: false,
}), action = {}) => {
    if (action.entity && action.entity !== 'user') return state;

    switch (action.type) {
    case FETCH_USERS_SUCCESS:
        return state.update('entities', u => u.concat(fromJS(action.data)));
    case FETCH_USERS_FAIL:
        return state.set('loading', false);
    case TOGGLE_SUSPEND_USER:
        return state.update('entities', es => es.map(e => user(e, action)));
    case DELETE_CARD:
        return state.update('entities', es => es.filterNot(e => e.get('id') === action.id));
    default:
        return state;
    }
};

const suspendedUsers = (state = fromJS({
    entities: OrderedSet(),
    loading: false,
}), action = {}) => {
    switch (action.type) {
    case FETCH_SUSPENDED_USERS_SUCCESS:
        return state.set('entities', OrderedSet(fromJS(action.data)));
    case RESTORE_SUSPENDED_USER:
        return state.update('entities', es => es.filterNot(s => s.get('id') === action.id));
    default:
        return state;
    }
};

const reports = (state = fromJS({
    galleries: {},
    users: {},
    loading: false,
}), action = {}) => {
    switch (action.type) {
    case FETCH_REPORTS_SUCCESS:
        return state.updateIn([action.entity, action.id], Map(), r => fromJS({
            reports: r.get('reports', List()).concat(action.reports),
            index: r.get('index', 0),
        }));
    case SET_REPORTS_INDEX:
        return state.setIn([action.reportsType, action.ownerId, 'index'], action.index);
    default:
        return state;
    }
};

const ui = (state = fromJS({
    activeTab: 'galleries',
    filters: fromJS({ galleries: Set(), users: Set() }),
    suspendedDialog: false,
    infoDialog: fromJS({ open: false, header: '', body: '' }),
    error: null,
    alert: null }), action = {}) => {
    switch (action.type) {
    case TOGGLE_SUSPENDED_DIALOG:
        return state.update('suspendedDialog', s => !s);
    case TOGGLE_INFO_DIALOG:
        return state.update('infoDialog', s => fromJS({
            open: !s.get('open'),
            header: action.header,
            body: action.body,
        }));
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

export default combineReducers({
    galleries,
    users,
    suspendedUsers,
    reports,
    ui,
});

