const ALL_IDS = 'allIds';
const BY_ID = 'byId';
const normalizedBase = { [BY_ID]: {}, [ALL_IDS]: [] };

const errors = {
    missingID: 'Missing identity field!'
}

/**
 * Normalizes array data structure
 * @param  {Array} originalData  Original list of objects
 * @param  {String} identityField Field to identify the object with
 * @return {Object} Normalized object
 */
export const normalizeList = (originalData = [], identityField) => {
    if(!identityField) {
        throw errors.missingID;
        return;
    }

    let normalizedData = Object.assign({}, normalizedBase);

    for(let i = 0; i < originalData.length; i++) {
        const objToNormalize = originalData[i];
        const objID = objToNormalize[identityField];

        if(!objID) {
            throw `Object at index ${i} is missing the identity field '${identityField}'`;
            return;
        }
        
        normalizedData[BY_ID][objToNormalize[identityField]] = objToNormalize;
        normalizedData[ALL_IDS].push(objID)
    }

    return normalizedData;
}

/**
 * Adds object to the top of the list
 */
export const addObject = (objectToAdd, normalizedData, identityField) => {
    const objectID = objectToAdd[identityField];

    if(!objectID) {
        throw errors.missingID;
        return;
    }

    //Return new copy
    return {
        [BY_ID]: Object.assign({}, normalizedData[BY_ID], {
            [objectID] : objectToAdd
        }),
        [ALL_IDS]: [objectID, ...normalizedData[ALL_IDS]]
    }
}

export const removeObject = (objectToRemove, normalizedData, identityField) => {
    const objectID = objectToRemove[identityField];

    if(!objectID) {
        throw errors.missingID;
        return;
    }

    // //Return new copy
    // return {
    //     [BY_ID]: Object.assign({}, normalizedData[BY_ID], {
    //         [objectID] : objectToAdd
    //     }),
    //     [ALL_IDS]: [objectID, ...normalizedData[ALL_IDS]]
    // }
}

export const updateObject = (objectToUpdate, normalizedData, identityField) => {
    const objectID = objectToUpdate[identityField];

    if(!objectID) {
        throw errors.missingID;
        return;
    }

    
    //Return new copy
    // return {
    //     [BY_ID]: Object.assign({}, normalizedData[BY_ID], {
    //         [objectID] : objectToUpdate
    //     }),
    //     [ALL_IDS]: [...normalizedData[ALL_IDS]]
    // }
}