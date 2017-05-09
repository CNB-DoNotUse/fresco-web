import api from 'app/lib/api';
import utils from 'utils';
import { enableLoading, toggleSnackbar, toggleModal } from './ui';
import { findById } from 'app/lib/helpers';

export const RECEIVE_STORIES = 'RECEIVE_STORIES';
export const RECEIVE_ONE_STORY = 'RECEIVE_ONE_STORY';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const RECEIVE_ERROR = 'RECEIVE_ERROR';
// export const UPDATE_STORY = 'UPDATE_STORY';
// export const UPDATE_POST = 'UPDATE_POST';
export const EDIT_NEW_STORY = 'EDIT_NEW_STORY';
// export const CREATE_STORY = 'CREATE_STORY';
// export const DELETE_POST = 'DELETE_POST';
// export const DELETE_STORY = 'DELETE_STORY';
export const CHANGE_SEARCH = 'CHANGE_SEARCH';
// export const PURCHASE_STORY = 'PURCHASE_STORY';
export const REMOVE_STORY = 'REMOVE_STORY';
// export const

// tentative
export const RECEIVE_USER_STATUS = 'RECEIVE_USER_STATUS';

// export const

//sync actions
export const changeSearch = searchParam => ({
    type: CHANGE_SEARCH,
    searchParam
})
export const receiveStories = stories => ({
    type: RECEIVE_STORIES,
    stories,
});

export const receiveOneStory = story => ({
    type: RECEIVE_ONE_STORY,
    story,
});

export const receivePosts = posts => ({
    type: RECEIVE_POSTS,
    posts,
});

export const receiveError = error => ({
    type: RECEIVE_ERROR,
    error,
});

// export const updateStory = story => ({
//     type: UPDATE_STORY,
//     story,
// });
//
// export const updatePost = post => ({
//     type: UPDATE_POST,
//     post,
// });

export const editNewStory = story => ({
    type: EDIT_NEW_STORY,
    story,
});

// export const createStory = story => ({
//     type: CREATE_STORY,
//     error,
// });

// async actions
export function createStory(story) {
  return (dispatch) => {
    return api.post('/story/create', story)
      .then(oneStory => dispatch(receiveOneStory(oneStory)),
      error => dispatch(receiveError(error))
    );
  };
}

export function deleteStory(story) {
  return (dispatch) => {
    return api.post('')
      .then(oneStory => dispatch(receiveOneStory(oneStory)),
      error => dispatch(receiveError(error))
    );
  };
}
