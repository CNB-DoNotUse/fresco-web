import * as actions from '../actions/versions';

/**
 * Clients reducer
 */
const clients = (state = [], action) => {
    switch (action.type) {
        case actions.RECEIVE_VERSIONS:
            return action.versions
        default:
            return state
    }
}


export default clients;