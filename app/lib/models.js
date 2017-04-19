import api from './api';

export const verifyUser = user => (
    api.get(`user/${user.id}`)
);

export const verifyAssignment = assignment => (
    api.get(`assignment/${assignment.id}`)
);

export const deletePosts = (postIds) => {
    if (!postIds || !postIds.length) return Promise.resolve();
    return api.post('post/delete', { post_ids: postIds });
};
