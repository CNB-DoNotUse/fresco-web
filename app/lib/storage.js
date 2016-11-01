// Session storage helper fns

export const getFromStorage = (storageKey) => (key) => {
    if (sessionStorage.getItem(storageKey)) {
        const data = JSON.parse(sessionStorage.getItem(storageKey));
        return data[key];
    }

    return null;
};

export const setInStorage = (storageKey) => (data) => {
    let curData = {};
    if (sessionStorage.getItem(storageKey)) {
        curData = JSON.parse(sessionStorage.getItem(storageKey));
    }

    const newData = JSON.stringify(Object.assign(curData, data));
    sessionStorage.setItem(storageKey, newData);
}
