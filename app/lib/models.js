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

export const postsHaveLocation = posts => {
    for (let x = 0; x < posts.length; x ++) {
        if (!(posts[x].address) || posts[x].address === "No Address") {
            return false;
        }
    }
    return posts[0].address;
}
