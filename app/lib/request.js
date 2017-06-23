import 'whatwg-fetch';
import qs from 'qs';

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        let error = new Error(response.statusText);
        error.response = response
        throw error;
    }
}

function parseJSON(response) {
    return response.json()
}


/**
 * Front-end network proxy to be used around the codebase instead of direct network requests
 */
export default {
    post(url, body, headers = {}) {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            credentials: 'include',
            headers: Object.assign({
                'Content-Type': 'application/json',
                'Data-Type': 'json'
            }, headers)
        })
        .then(checkStatus)
        .then(parseJSON)
    },

    get(url, body = {}, headers = {}) {
        const newURL = url.slice(-1) === "&" ? `${url}${qs.stringify(body)}` : `${url}?${qs.stringify(body)}`
        return fetch(newURL, {
            method: 'GET',
            credentials: 'include',
            headers: Object.assign({
                'Content-Type': 'application/json',
                'Data-Type': 'json'
            }, headers)
        })
        .then(checkStatus)
        .then(parseJSON)
    },
};
