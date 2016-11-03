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

export const isImportedGallery = ({ owner_id = null, posts = [] }) => (
    !owner_id && (posts && posts.every(p => !p.owner_id))
);

// TODO: should turn into new isImportedGallery?
// export const galleryOwnerChangeable = ({ owner_id = null, uploader_id = null }) => (
//     owner_id !== uploader_id
// );

export const isSubmittedGallery = ({ owner_id = null, posts = [] }) => (
    owner_id && (posts && posts.every(p => p.owner_id === owner_id))
);

