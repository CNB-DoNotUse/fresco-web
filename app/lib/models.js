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

export const isOriginalGallery = ({ id = '', posts = [] }) => (
    posts && posts.every(p => p.parent_id === id)
);

// TODO changed to just check importer_id once old galleries are migrated
export const isImportedGallery = ({ owner_id = null, posts = [], importer_id = null }) => (
    importer_id || (!owner_id && (posts ? posts.every(p => !p.owner_id) : true))
);

export const isSubmittedGallery = ({ owner_id = null, posts = [] }) => (
    owner_id && (posts && posts.every(p => p.owner_id === owner_id))
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
