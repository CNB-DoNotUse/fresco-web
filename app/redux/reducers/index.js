import { combineReducers } from 'redux';

/**
 * Takes reducers in a function and combines them
 * @param  {Object} reducers Reducers needed to be added
 * @return {Object} Combined reducers
 */
export default function createReducer(reducers) {
    return combineReducers({
        ...reducers
    });
}