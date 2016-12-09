// Session storage helper fns

export const getFromSessionStorage = (key, dataKey, unfound = null) => {
    if (sessionStorage.getItem(key)) {
        const data = JSON.parse(sessionStorage.getItem(key));
        if (data && ({}).hasOwnProperty.call(data, dataKey)) return data[dataKey];
    }

    return unfound;
};

export const getFromLocalStorage = (key, dataKey, unfound = null) => {
    if (localStorage.getItem(key)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && ({}).hasOwnProperty.call(data, dataKey)) return data[dataKey];
    }

    return unfound;
};

export const setInSessionStorage = (key, data) => {
    let curData = {};

    if (sessionStorage.getItem(key)) {
        curData = JSON.parse(sessionStorage.getItem(key));
    }

    const newData = JSON.stringify(Object.assign(curData, data));
    sessionStorage.setItem(key, newData);
};

export const setInLocalStorage = (key, data) => {
    let curData = {};

    if (localStorage.getItem(key)) {
        curData = JSON.parse(localStorage.getItem(key));
    }

    const newData = JSON.stringify(Object.assign(curData, data));
    localStorage.setItem(key, newData);
};
