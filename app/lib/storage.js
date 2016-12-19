// Session storage helper fns

/**
 * Gets a value stored in session storage
 *
 * @param {String} key the key to lookup in root storage obj
 * @param {String} dataKey the key to look up in retrieved object from storage
 * @param {*} unfound=null the value to return if item isn't found
 * @returns {*} The retrieved data from storage
 */
export const getFromSessionStorage = (key, dataKey, unfound = null) => {
    if (sessionStorage.getItem(key)) {
        const data = JSON.parse(sessionStorage.getItem(key));
        if (data && ({}).hasOwnProperty.call(data, dataKey)) return data[dataKey];
    }

    return unfound;
};

/**
 * Gets a value stored in local storage
 *
 * @param {String} key the key to lookup in root storage obj
 * @param {String} dataKey the key to look up in retrieved object from storage
 * @param {*} unfound=null the value to return if item isn't found
 * @returns {*} The retrieved data from storage
 */
export const getFromLocalStorage = (key, dataKey, unfound = null) => {
    if (localStorage.getItem(key)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && ({}).hasOwnProperty.call(data, dataKey)) return data[dataKey];
    }

    return unfound;
};

/**
 * Sets a value in session storage
 *
 * @param {String} key the key to be set in root storage obj
 * @param {*} data the data to be stored in session obj} data
 */
export const setInSessionStorage = (key, data) => {
    let curData = {};

    if (sessionStorage.getItem(key)) {
        curData = JSON.parse(sessionStorage.getItem(key));
    }

    const newData = JSON.stringify(Object.assign(curData, data));
    sessionStorage.setItem(key, newData);
};

/**
 * Sets a value in local storage
 *
 * @param {String} key the key to be set in root storage obj
 * @param {*} data the data to be stored in session obj} data
 */
export const setInLocalStorage = (key, data) => {
    let curData = {};

    if (localStorage.getItem(key)) {
        curData = JSON.parse(localStorage.getItem(key));
    }

    const newData = JSON.stringify(Object.assign(curData, data));
    localStorage.setItem(key, newData);
};
