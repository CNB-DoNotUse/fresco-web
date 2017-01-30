import * as actions from '../actions/clients';

/**
 * Clients reducer
 */
 const clients = (state = [], action) => {
    switch (action.type) {
        case actions.RECEIVE_CLIENTS:
            return action.clients
        case actions.RECEIVE_CLIENT:
            return state.clients.map((client, index) => {
                if(index !== action.index) return;
                return action.client;
            })    
        default:
            return state
    }
}


export default clients;