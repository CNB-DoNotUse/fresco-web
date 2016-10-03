// https://github.com/erikras/ducks-modular-redux
import { fromJS, OrderedSet } from 'immutable';
import api from 'app/lib/api';

// constants
// action types
export const SET_ACTIVE_TAB = 'moderation/SET_ACTIVE_TAB';
export const DISMISS_ALERT = 'moderation/DISMISS_ALERT';
export const SET_ALERT = 'moderation/DISMISS_ALERT';
export const FETCH_GALLERIES_SUCCESS = 'moderation/FETCH_GALLERIES_SUCCESS';

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

const moderation = (state = fromJS({
    activeTab: 'GALLERIES',
    galleries: OrderedSet(),
    loading: false,
    error: null,
    alert: null }), action = {}) => {
    switch (action.type) {
        case FETCH_GALLERIES_SUCCESS:
            return state.update('galleries', g => g.concat(action.data));
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
