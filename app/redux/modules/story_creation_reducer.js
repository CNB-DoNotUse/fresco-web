import React from 'react';
import merge from 'lodash/merge';

import {
    ADD_POST,
    REMOVE_POST,
    CAPTION,
    TITLE,
    HIGHLIGHTED,
    CREATE_STORY
} from 'app/redux/actions/stories_create';

const initialState = {
    highlighted: false,
    caption: '',
    title: '',
    posts: [],
    tags: []
}

const storyCreation = (state = initialState, action) => {
    Object.freeze(state)
    const newState = merge(state, {});
    switch (action.type) {
        case ADD_POST:
            newState.posts.push(action.post)
            return newState;
        case ADD_POST:
            const postIDs = state.posts.map(p => p.id);
            const index = postIDs.indexOf(action.post.id);
            if (index > -1) {
                newState.posts = state.posts.slice(0, index).concat(state.posts.slice(index + 1));
                return newState;
            } else {
                return state;
            }
            break;
        case ADD_POST:

            break;
        case ADD_POST:

            break;
        default:
            return state;

    }
}

export default storyCreation;
