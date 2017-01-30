import 'isomorphic-fetch';
import qs from 'qs';

const fetchStatusHandler = (response) => {
    if (response.status === 200) {
        return response;
    }

    throw new Error(response.statusText);
};

/**
 * Front-end API proxy to be used around the codebase instead of direct network requests
 */
export default {
    post(url, body, headers = {}) {
        return fetch(`/api/${url}`, {
            method: 'POST',
            body: JSON.stringify(body),
            credentials: 'include',
            headers: Object.assign({
                'Content-Type': 'application/json',
                'Data-Type': 'json'
            }, headers)
        })
        .then(fetchStatusHandler)
        .then(res => res.json())
        .catch(Promise.reject);
    },

    get(url, body = {}, headers = {}) {
        const query = qs.stringify(body);

        return fetch(`/api/${url}?${query}`, {
            method: 'GET',
            credentials: 'include',
            headers: Object.assign({
                'Content-Type': 'application/json',
                'Data-Type': 'json'
            }, headers)
        })
        .then(fetchStatusHandler)
        .then(res => res.json())
        .catch(Promise.reject);
    },
};

