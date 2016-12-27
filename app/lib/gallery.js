import api from './api';

/**
 * Gallery model file
 */

/**
 * Fetches reposts for provided gallery
 * @return {Array} Array of users who have reposted the gallery
 */
export const getReposts = (id, params = { sortBy: 'created_at', limit: 8 }) => {
    if (!id) return Promise.resolve();
    return api.get(`gallery/${id}/reposts`, params);
};

/**
 * Fetches likes for provided gallery
 * @return {Array} Array of users who have liked the gallery
 */
export const getLikes = (id, params = { sortBy: 'created_at', limit: 8 }) => {
    if (!id) return Promise.resolve();
    return api.get(`gallery/${id}/likes`, params);
};