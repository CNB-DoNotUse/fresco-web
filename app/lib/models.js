import api from './api';

export const verifyGallery = (gallery) => (
    api.get(`gallery/${gallery.id}`)
);

export const verifyUser = (user) => (
    api.get(`user/${user.id}`)
);

export const verifyAssignment = (assignment) => (
    api.get(`assignment/${assignment.id}`)
    .then(r => ({ title: r.title, id: r.id, body: r.caption }))
);
