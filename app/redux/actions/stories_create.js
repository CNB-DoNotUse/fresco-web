import api from 'app/lib/api';
import utils from 'utils';
import {
    receiveError,
    receiveOneStory
} from './stories';

export const ADD_POST = 'ADD_POST';
export const REMOVE_POST = 'REMOVE_POST';
export const ADD_TAG = 'ADD_TAG';
export const REMOVE_TAG = 'REMOVE_TAG';
export const CAPTION = 'CAPTION';
export const TITLE = 'TITLE';
export const HIGHLIGHTED = 'HIGHLIGHTED';
export const CREATE_STORY = 'CREATE_STORY';
export const CLEAR_FIELDS = 'CLEAR_FIELDS';
export const CLEAR_POSTS = 'CLEAR_POSTS';

export const addPost = post => ({
    type: ADD_POST,
    post
})

export const addTag = tag => ({
    type: ADD_TAG,
    tag
})

export const removePost = post => ({
    type: REMOVE_POST,
    post
})

export const removeTag = tag => ({
    type: REMOVE_TAG,
    tag
})

export const changeCaption = caption => ({
    type: CAPTION,
    caption
})

export const changeTitle = title => ({
    type: TITLE,
    title
})

export const changeHighlighted = () => ({
    type: HIGHLIGHTED,
})

export const clearFields = () => ({
    type: CLEAR_FIELDS
})
export const clearPosts = () => ({
    type: CLEAR_POSTS
})
// export function createStory(story) {
//     return (dispatch) => {
//         return api.post('story/create', story)
//           .then(oneStory => dispatch(receiveOneStory(oneStory)),
//           error => dispatch(receiveError(error))
//         );
//     };
// }
