import api from './api';

export const verifyGallery = gallery => (
    api.get(`gallery/${gallery.id}`)
);

export const verifyUser = user => (
    api.get(`user/${user.id}`)
);

export const verifyAssignment = assignment => (
    api.get(`assignment/${assignment.id}`)
);

/**
 * Tells if a gallery is original by checking if all the posts have the same parent id
 */
export const isOriginalGallery = ({ id = '', posts = [] }) => (
    posts && posts.every(p => p.parent_id === id)
);

/**
 * Tells us if a gallery is imported. Checks if the importer ID is sent OR
 * if all the posts have no owner and are a part of the same gallery
 */
export const isImportedGallery = ({ owner_id = null, id = null, posts = [], importer_id = null } = gallery) => (
    importer_id || (!owner_id && (posts ? posts.every(p => {
        !p.owner_id && p.parent_id == id
    }) : true))
);

/**
 * Tells us if a gallery is submitted by checking
 * if there is an owner, no importer, and all the posts have the same owner
 */
export const isSubmittedGallery = ({ owner_id = null, posts = [], importer_id = null } = gallery) => (
    owner_id && !importer_id && (posts && posts.every(p => p.owner_id === owner_id))
);

export const deletePosts = (postIds) => {
    if (!postIds || !postIds.length) return Promise.resolve();
    return api.post('post/delete', { post_ids: postIds });
};

/**
 * Saves a gallery
 * @param  {String} id     ID of the galley to save
 * @param  {Object} params Gallery paramsters to update
 * @return {Object}        API response from gallery/update, normally an updated gallery object
 */
export const saveGallery = (id, params) => {
    if (!id || !params) return Promise.resolve();
    return api.post(`gallery/${id}/update`, params);
};

export const recommendGallery = (params) => {
    if (!params) return Promise.resolve();
    return api.post(`notifications/outlet/create`, params);
}
