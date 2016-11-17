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

