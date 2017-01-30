import api from 'app/lib/api';
import { isLoading, toggleSnackbar } from './ui';

/**
 * Action types as consant
 */
export const RECEIVE_CLIENTS = 'RECEIVE_CLIENTS';
export const RECEIVE_CLIENT = 'RECEIVE_CLIENT';

/**
 * Action creators
 */
export const receiveClients = (clients) => ({
    type: RECEIVE_CLIENTS,
    clients
});

export const receiveClient = (client, index) => ({
    type: RECEIVE_CLIENT,
    client,
    index
})


/**
 * Action creator for getting clients
 */
export const getClients = () => (dispatch) => {
    api
        .get('client/list')
        .then(response => dispatch(receiveClients(response)))
}



/**
 * Action creator for generating a client
 */
export const generateClient = (params) => (dispatch) => {

}

/**
 * Updates a client
 * @param  {Object} params Params to update the client with
 */
export const updateClient = (id, params = {}, index) => (dispatch, getState) => {
    const clients = getState().clients;
    const clientBeingUpdated = clients[index];

    dispatch(isLoading(true));

    api
        .post(`client/${id}/update`, params)
        .then(response => {
            dispatch(receiveClient(response, index));
            dispatch(isLoading(false));
        })
        .catch(error => {
            dispatch(isLoading(false));
            //Send back clients again to update state
            dispatch(receiveClients(clients))
            dispatch(toggleSnackbar('There was an error updating this client!'))
        });

}

/**
 * Action creator for generating a client
 */
export const deleteClient = (clientID) => (dispatch) => {

}

export const rekeyClient = (clientID) => (dispatch) => {

}