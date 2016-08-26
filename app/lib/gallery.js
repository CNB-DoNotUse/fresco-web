import api from './api';

export const verifyGallery = (gallery) => (
    api
    .get(`gallery/${gallery.id}`)
    .then(() => Promise.resolve())
    .catch(() => Promise.reject())
);

