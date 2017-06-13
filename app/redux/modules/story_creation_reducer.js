import React from 'react';
import merge from 'lodash/merge';

import {
    ADD_POST,
    REMOVE_POST,
    ADD_TAG,
    REMOVE_TAG,
    CAPTION,
    TITLE,
    HIGHLIGHTED,
    CLEAR_FIELDS,
    CLEAR_POSTS
} from 'app/redux/actions/stories_create';

const initialState = {
    caption: '',
    title: '',
    posts: [],
    tags: [],
}

const storyCreation = (state = initialState, action) => {
    Object.freeze(state);
    let newState = merge({}, state);
    switch (action.type) {
        case ADD_POST:
            newState.posts.push(action.post)
            return newState;
        case REMOVE_POST:
            const postIDs = state.posts.map(p => p.id);
            const index = postIDs.indexOf(action.post.id);
            if (index > -1) {
                const firstHalf = newState.posts.slice(0, index);
                const secondHalf = newState.posts.slice(index + 1);
                newState.posts = firstHalf.concat(secondHalf);
                return newState;
            } else {
                return state;
            }
            break;
        case ADD_TAG:
            newState.tags = action.tag;
            return newState;
            break;
        case REMOVE_TAG:
            const tagIndex = state.tags.indexOf(action.tag);
            if (tagIndex > -1) {
                const firstHalf = newState.tags.slice(0, tagIndex);
                const secondHalf = newState.tags.slice(tagIndex + 1);
                newState.tags = firstHalf.concat(secondHalf);
                return newState;
            } else {
                return state
            }
            break;
        case CAPTION:
            newState.caption = action.caption;
            return newState;
            break;
        case TITLE:
            newState.title = action.title;
            return newState;
            break;
        // case HIGHLIGHTED:
        //     if (state.rating > 0) {
        //         newState.rating = 0;
        //     } else {
        //         newState.rating = 3;
        //     }
        //     return newState;
        //     break;
        case CLEAR_FIELDS:
            //clear all fields except posts
            const newInitial = merge({}, initialState)
            newInitial.posts = state.posts;
            return newInitial;
            break;
        case CLEAR_POSTS:
            const newerInitial = merge({}, initialState)
            newerInitial.title = state.title;
            newerInitial.caption = state.caption;
            newerInitial.tags = state.tags;
            return newerInitial;
            break;
        default:
            return state;

    }
}

export default storyCreation;
