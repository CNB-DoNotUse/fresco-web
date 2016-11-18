// Session storage helper fns

export const createGetFromStorage = ({ type = 'session', key }) => (dataKey, unfound = null) => {
    if (type === 'session') {
        if (sessionStorage.getItem(key)) {
            const data = JSON.parse(sessionStorage.getItem(key));
            return data[dataKey];
        }
    }

    if (type === 'local') {
        if (localStorage.getItem(key)) {
            const data = JSON.parse(localStorage.getItem(key));
            return data[dataKey];
        }
    }

    return unfound;
};

export const createSetInStorage = ({ type = 'session', key }) => (data) => {
    let curData = {};

    if (type === 'session') {
        if (sessionStorage.getItem(key)) {
            curData = JSON.parse(sessionStorage.getItem(key));
        }

        const newData = JSON.stringify(Object.assign(curData, data));
        sessionStorage.setItem(key, newData);
    }

    if (type === 'local') {
        if (localStorage.getItem(key)) {
            curData = JSON.parse(localStorage.getItem(key));
        }

        const newData = JSON.stringify(Object.assign(curData, data));
        localStorage.setItem(key, newData);
    }
};

