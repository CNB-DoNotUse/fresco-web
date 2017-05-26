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
    RECEIVE_USERS,
    MOVE_USERS,
    RECEIVE_TAGS,
    RECEIVE_ASSIGNMENTS,
    MOVE_ASSIGNMENTS,
    RESET_PARAMS
} from 'app/redux/actions/stories';
import { setInLocalStorage } from 'app/lib/storage';

import { fromJS } from 'immutable';

const searchParams = (state = {}, action) => {
    const newState = state.toJS();
    switch (action.type) {
        case CHANGE_SEARCH:
            const { param, value } = action.searchParam;
                if (value || value === "") {
                    return state.set( param, value ).set('users', {}).set('assignments', {});
                } else {
                    const currentVal = state.get(param);
                    return state.set(param, !currentVal);
                }
            break;
        case RECEIVE_USERS:
            if (action.users.results) {
                state.set('users', {});
                const users = {};
                action.users.results.forEach((user) => {
                    if (!state.getIn(['params', 'users', user.id])) {
                        users[user.id] = user;
                    }
                });
                return state.set('users', users);
            } else {
                state.set('users', {});
            }
            break;
        case MOVE_USERS:
            newState.params.users[action.userID] = newState.users[action.userID];
            delete newState.users[action.userID];
            return fromJS(newState);
            break;
        case RECEIVE_ASSIGNMENTS:
            if (action.assignments.results) {
                state.set('assignments', {});
                const assignments = {};
                action.assignments.results.forEach((assignment) => {
                    if (!state.getIn(['params', 'assignments', assignment.id])) {
                        assignments[assignment.id] = assignment;
                    }
                })
                return state.set('assignments', assignments);
            } else {
                state.set('assignments', {});
            }
            break;
        case MOVE_ASSIGNMENTS:
            newState.params.assignments[action.assignmentID] = newState.assignments[action.assignmentID];
            delete newState.assignments[action.assignmentID];
            return fromJS(newState);
        case RESET_PARAMS:
            setInLocalStorage('searchParams', action.params);
            return fromJS(action.params);
            break;
        // case RECEIVE_TAGS:
        //     if (action.tags.results) {
        //         state.set('tags', {});
        //         const tags = {};
        //         action.tags.results.slice(0, 3).forEach((tag) => {
        //             tags[tag.id] = tag;
        //         });
        //         return state.set('tags', tags)
        //     } else {
        //         state.set('tags', {});
        //     }
        //     break;
        //technically receiving errors is not necessary here since
        //receiveError is never dispatched here, just included if neede in the future
        case RECEIVE_ERROR:
            return state.set('errors', action.error);
            break;
        default:
            return state;
    }
    // add api calls to search params
}

export default searchParams;
