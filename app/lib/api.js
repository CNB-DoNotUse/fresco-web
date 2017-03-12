import request from './request';

/**
 * Front-end API proxy that uses the request lib to prepend requests
 */
export default {
    post(url, body, headers = {}) {
        return request.post(`/api/${url}`, body, headers);
    },

    get(url, body = {}, headers = {}) {
        return request.get(`/api/${url}`, body, headers);
    }
};

