import api from './api';

export const verifyGallery = (gallery) => (
    api
    .get(`gallery/${gallery.id}`)
    .then(() => Promise.resolve())
    .catch(() => Promise.reject())
);

export const verifyUser = (user) => (
    api
    .get(`user/${user.id}`)
    .then(() => Promise.resolve())
    .catch(() => Promise.reject())
);

export const verifyAssignment = (assignment) => (
    api
    .get(`assignment/${assignment.id}`)
    .then(() => Promise.resolve())
    .catch(() => Promise.reject())
);
