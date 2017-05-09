import React from 'react';
import merge from 'lodash/merge';
import {
    RECEIVE_STORIES,
    RECEIVE_ONE_STORY,
    RECEIVE_POSTS,
    RECEIVE_ERROR,
    EDIT_NEW_STORY,
    CHANGE_SEARCH,
    REMOVE_STORY,
    RECEIVE_USER_STATUS,
} from 'app/redux/actions/stories';

const searchParams = (state = {}, action) => {
    switch (action.type) {
        case CHANGE_SEARCH:
        const { param, value } = action.searchParam;
            if (value || value === "") {
                return state.set( param, value );
            } else {
                const currentVal = state.get(param);
                return state.set(param, !currentVal);
            }
        default:
            return state;
    }
}

export default searchParams;
