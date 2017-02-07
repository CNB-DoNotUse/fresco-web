import * as actions from '../actions/outlet';

/**
 * Outlet reducer
 */
 const outlet = (state = {}, action) => {
    switch (action.type) {
        case actions.RECEIVE_OUTLET:
            return action.outlet
        default:
            return state
    }
}


export default outlet;
