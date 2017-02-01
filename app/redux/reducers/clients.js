import * as actions from '../actions/clients';

/**
 * Clients reducer
 */
 const clients = (state = [], action) => {
    switch (action.type) {
        case actions.RECEIVE_CLIENTS:
            return action.clients
        case actions.RECEIVE_CLIENT:
            return state.map((client, index) => {
                if(index !== action.index) return client;
                return action.client;
            })   
        case actions.ADD_CLIENT:
            return [action.client, ...state] 
        case actions.REMOVE_CLIENT:
            return state.filter((elm, index) => index !== action.index)   
        default:
            return state
    }
}


export default clients;