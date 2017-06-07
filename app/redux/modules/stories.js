import React from 'react';
import merge from 'lodash/merge';

import {
    RECEIVE_STORIES,
    RECEIVE_ONE_STORY,

} from 'app/redux/actions/stories';

const stories = (state = {}, action) => {
    switch (action.type) {
        case RECEIVE_STORIES:
            break;
        case RECEIVE_ONE_STORY:
            break;
        default:
            return state;
    }
    // add api calls to search params
}

export default stories;
