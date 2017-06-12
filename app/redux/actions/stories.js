import api from 'app/lib/api';
import utils from 'utils';
import { enableLoading, toggleSnackbar, toggleModal } from './ui';
import { findById } from 'app/lib/helpers';

export const RECEIVE_STORIES = 'RECEIVE_STORIES';
export const RECEIVE_ONE_STORY = 'RECEIVE_ONE_STORY';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const RECEIVE_ERROR = 'RECEIVE_ERROR';
export const RECEIVE_USERS = 'RECEIVE_USERS';
export const REMOVE_USERS = 'REMOVE_USERS';
export const MOVE_USERS = 'MOVE_USERS';
export const RECEIVE_ASSIGNMENTS = 'RECEIVE_ASSIGNMENTS';
export const REMOVE_ASSIGNMENTS = 'REMOVE_ASSIGNMENTS';
export const MOVE_ASSIGNMENTS = 'MOVE_ASSIGNMENTS';
export const RECEIVE_TAGS = 'RECEIVE_TAGS';
export const EDIT_NEW_STORY = 'EDIT_NEW_STORY';
export const RESET_PARAMS = "RESET_PARAMS";
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

export const receiveUsers = users => ({
    type: RECEIVE_USERS,
    ...users,
});
export const removeUser = userID => ({
    type: REMOVE_USERS,
    userID,
});
export const moveUser = userID => ({
    type: MOVE_USERS,
    userID,
});
export const receiveAssignments = assignments => ({
    type: RECEIVE_ASSIGNMENTS,
    ...assignments,
});
export const removeAssignment = assignmentID => ({
    type: REMOVE_ASSIGNMENTS,
    assignmentID,
});
export const moveAssignment = assignmentID => ({
    type: MOVE_ASSIGNMENTS,
    assignmentID,
});
export const receiveTags = tags => ({
    type: RECEIVE_TAGS,
    ...tags,
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

export const resetParams = () => ({
    type: RESET_PARAMS,
    params: {
        verified: true,
        unverified: false,
        purchased: true,
        notPurchased: false,
        capturedTime: true,
        relativeTime: true,
        location,
        address: '',
        radius: 250,
        searchTerm: '',
        users: {},
        assignments:{},
        tags: {},
        loading: false,
        errors: {},
        params: { users: {}, assignments: {}, tags: {} }
    }
})
// export const createStory = story => ({
//     type: CREATE_STORY,
//     error,
// });

// async actions
export function getUsers(query) {
    return (dispatch) => {
        return api.get('search', {
                [`users[q]`]: query
            }).then(users => dispatch(receiveUsers(users)))
            .catch(error => dispatch(receiveError(error)));
    }
}
export function getAssignments(query) {
    return (dispatch) => {
        return api.get('search', {
                [`assignments[q]`]: query
            }).then(assignments => dispatch(receiveAssignments(assignments)))
            .catch(error => dispatch(receiveError(error)));
    }
}
export function getTags(query) {
    return (dispatch) => {
        return api.get('search', {
                [`tags[q]`]: query
            }).then(tags => {
                dispatch(receiveTags(tags))
            })
            .catch(error => dispatch(receiveError(error)));
    }
}



export function deleteStory(story_id) {
    return (dispatch) => {
        return api.post(`story/${story_id}/delete`)
          .then(oneStory => dispatch(receiveOneStory(oneStory)),
          error => dispatch(receiveError(error))
        );
    };
}

export function updateStory(story) {
    return (dispatch) => {
        return api.post(`story/${story.id}/update`, story)
            .then(oneStory => dispatch(receiveOneStory(oneStory)),
            error => dispatch(receiveError(error))
        );
    };
}

export function getStories() {
    return (dispatch) => {
        return api.get(`story/recent`)
            .then(stories => dispatch(receiveStories(stories)),
            error => dispatch(receiveError(error))
        )
    }
}
