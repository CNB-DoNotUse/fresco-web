// Session storage helper fns

export const getFromStorage = (storageKey) => (key) => {
    if (localStorage.getItem(storageKey)) {
        const data = JSON.parse(localStorage.getItem(storageKey));
        return data[key];
    }

    return null;
};

export const setInStorage = (storageKey) => (data) => {
    let curData = {};
    if (localStorage.getItem(storageKey)) {
        curData = JSON.parse(localStorage.getItem(storageKey));
    }

    const newData = JSON.stringify(Object.assign(curData, data));
    localStorage.setItem(storageKey, newData);
}
